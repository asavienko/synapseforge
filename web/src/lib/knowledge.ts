import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * Insert a knowledge chunk with its embedding vector using raw SQL.
 * Bypasses Prisma's type system since `embedding` is Unsupported("vector").
 */
export async function insertChunkWithEmbedding(
  docId: string,
  content: string,
  embedding: number[]
) {
  const embeddingStr = `[${embedding.join(',')}]`;
  await prisma.$executeRaw`
    INSERT INTO "KnowledgeChunk" ("id", "docId", "content", "embedding", "createdAt")
    VALUES (${randomUUID()}, ${docId}, ${content}, ${embeddingStr}::vector, NOW())
  `;
}

/**
 * Search for similar chunks in a knowledge base using pgvector cosine similarity.
 */
export async function searchSimilarChunks(
  instanceId: string,
  queryEmbedding: number[],
  limit: number = 5
) {
  const embeddingsArrayStr = `[${queryEmbedding.join(',')}]`;
  return prisma.$queryRaw<
    Array<{
      id: string;
      content: string;
      distance: number;
      filename: string;
      docId: string;
    }>
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
      "AIInstance"."id" = ${instanceId}
      AND "AIInstance"."userId" = ${(await prisma.aIInstance.findUnique({ where: { id: instanceId } }))?.userId}
      AND "KnowledgeChunk"."embedding" IS NOT NULL
    ORDER BY "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector
    LIMIT ${limit}
  `;
}

/**
 * Simple keyword-based fallback search (used when embeddings unavailable).
 */
export async function searchByKeywords(
  instanceId: string,
  query: string,
  limit: number = 5
) {
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 10);

  if (keywords.length === 0) {
    return [];
  }

  // Build simple WHERE clauses with ILIKE for each keyword
  const conditions = keywords
    .map(() => `"KnowledgeChunk"."content" ILIKE ${'%' + keywords[0] + '%'}`) // simplified; in practice would need OR
    .join(' OR ');

  // This is a rough implementation; actual fallback is handled in rag.ts differently
  return prisma.$queryRaw<any[]>`
    SELECT 
      "KnowledgeChunk"."id",
      "KnowledgeChunk"."content",
      "KnowledgeDoc"."filename",
      "KnowledgeDoc"."id" as "docId"
    FROM "KnowledgeChunk"
    JOIN "KnowledgeDoc" ON "KnowledgeChunk"."docId" = "KnowledgeDoc"."id"
    JOIN "KnowledgeBase" ON "KnowledgeDoc"."knowledgeBaseId" = "KnowledgeBase"."id"
    JOIN "AIInstance" ON "KnowledgeBase"."instanceId" = "AIInstance"."id"
    WHERE "AIInstance"."id" = ${instanceId}
      AND (${conditions})
    LIMIT ${limit}
  `;
}