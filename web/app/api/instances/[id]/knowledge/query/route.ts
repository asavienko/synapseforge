import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/knowledge/embeddings';

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
  const queryEmbedding = await generateEmbedding(query).catch(err => {
    console.error('[knowledge-query] embedding error:', err);
    return null;
  });
  
  if (!queryEmbedding) {
    return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
  }

  // Use raw SQL with pgvector <=> operator for efficient cosine similarity search
  const embeddingsArrayStr = `[${queryEmbedding.join(',')}]`;
  const results = await prisma.$queryRaw<
    Array<{ 
      id: string; 
      content: string; 
      distance: number; 
      filename: string; 
      docId: string;
      metadata: string | null;
    }>
  >`
    SELECT 
      "KnowledgeChunk"."id",
      "KnowledgeChunk"."content",
      "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector as "distance",
      "KnowledgeDoc"."filename",
      "KnowledgeDoc"."id" as "docId",
      "KnowledgeChunk"."metadata"
    FROM "KnowledgeChunk"
    JOIN "KnowledgeDoc" ON "KnowledgeChunk"."docId" = "KnowledgeDoc"."id"
    JOIN "knowledge_base" ON "KnowledgeDoc"."knowledgeBaseId" = "knowledge_base"."id"
    JOIN "AIInstance" ON "knowledge_base"."instanceId" = "AIInstance"."id"
    WHERE 
      "AIInstance"."id" = ${id}
      AND "AIInstance"."userId" = ${session.user.id}
      AND "KnowledgeChunk"."embedding" IS NOT NULL
    ORDER BY "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector
    LIMIT ${limit}
  `;

  // Convert distance to similarity score (1 - distance for cosine)
  // Filter by relevance threshold (0.7 similarity = 0.3 distance)
  const topResults = results
    .map((r) => ({
      id: r.id,
      content: r.content,
      score: 1 - r.distance,
      filename: r.filename,
      docId: r.docId,
      metadata: r.metadata ? JSON.parse(r.metadata) : null,
    }))
    .filter(r => r.score > 0.5); // Only return relevant results

  return NextResponse.json({ 
    results: topResults,
    query,
    count: topResults.length 
  });
}
