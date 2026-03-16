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

  // Generate embedding for query
  const queryEmbedding = await getEmbedding(query);
  if (!queryEmbedding) {
    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
  }

  // Use raw SQL with pgvector <=> operator for efficient cosine similarity search
  const embeddingsArrayStr = `[${queryEmbedding.join(',')}]`;
  const results = await prisma.$queryRaw<
    Array<{ id: string; content: string; distance: number; filename: string; docId: string }>
  >`
    SELECT 
      "KnowledgeChunk"."id",
      "KnowledgeChunk"."content",
      "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector as "distance",
      "KnowledgeDoc"."filename",
      "KnowledgeDoc"."id" as "docId"
    FROM "KnowledgeChunk"
    JOIN "KnowledgeDoc" ON "KnowledgeChunk"."docId" = "KnowledgeDoc"."id"
    JOIN "KnowledgeBase" ON "KnowledgeDoc"."knowledgeBaseId" = "KnowledgeBase"."id"
    JOIN "AIInstance" ON "KnowledgeBase"."instanceId" = "AIInstance"."id"
    WHERE 
      "AIInstance"."id" = ${id}
      AND "AIInstance"."userId" = ${session.user.id}
      AND "KnowledgeChunk"."embedding" IS NOT NULL
    ORDER BY "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector
    LIMIT ${limit}
  `;

  // Convert distance to similarity score (1 - distance for cosine)
  const topResults = results.map((r) => ({
    id: r.id,
    content: r.content,
    score: 1 - r.distance,
    filename: r.filename,
    docId: r.docId,
  }));

  return NextResponse.json({ results: topResults });
}
