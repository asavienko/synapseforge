import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: text, model: "text-embedding-3-small" }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch (error) {
    console.error("[knowledge-query] embedding error:", error);
    return null;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance)
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });

  const { query, limit = 5 } = (await req.json()) as { query: string; limit?: number };
  if (!query || typeof query !== 'string')
    return NextResponse.json({ error: "Query required" }, { status: 400 });

  // Get knowledge base
  const kb = await prisma.knowledgeBase.findUnique({
    where: { instanceId: id },
    include: { documents: { include: { chunks: true } } },
  });
  if (!kb) {
    return NextResponse.json({ error: "No knowledge base uploaded" }, { status: 404 });
  }

  // Generate embedding for query
  const queryEmbedding = await getEmbedding(query);
  if (!queryEmbedding) {
    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
  }

  // Collect all chunks with their embeddings
  const chunks: Array<{ id: string; content: string; embedding?: number[]; docId: string; filename: string }> = [];
  for (const doc of kb.documents) {
    for (const chunk of doc.chunks) {
      if (chunk.embedding) {
        try {
          const embedding = JSON.parse(chunk.embedding);
          chunks.push({
            id: chunk.id,
            content: chunk.content,
            embedding,
            docId: doc.id,
            filename: doc.filename,
          });
        } catch {
          // Skip malformed embeddings
        }
      }
    }
  }

  if (chunks.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Compute similarities
  const scored = chunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding!),
  }));

  // Sort by descending score and take top N
  scored.sort((a, b) => b.score - a.score);
  const topResults = scored.slice(0, limit).map(({ id, content, score, filename, docId }) => ({
    id,
    content,
    score,
    filename,
    docId,
  }));

  return NextResponse.json({ results: topResults });
}