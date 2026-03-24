import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export interface ChunkMetadata {
  page?: number;
  startChar: number;
  endChar: number;
}

/**
 * Insert a knowledge chunk with its embedding vector using raw SQL.
 * Bypasses Prisma's type system since `embedding` is Unsupported("vector").
 */
export async function insertChunkWithEmbedding(
  docId: string,
  content: string,
  embedding: number[],
  metadata?: ChunkMetadata
) {
  const embeddingStr = `[${embedding.join(',')}]`;
  const metadataStr = metadata ? JSON.stringify(metadata) : null;
  
  await prisma.$executeRaw`
    INSERT INTO "KnowledgeChunk" ("id", "docId", "content", "embedding", "metadata", "createdAt")
    VALUES (${randomUUID()}, ${docId}, ${content}, ${embeddingStr}::vector, ${metadataStr}, NOW())
  `;
}

/**
 * Search for similar chunks in a knowledge base using pgvector cosine similarity.
 */
export async function searchSimilarChunks(
  instanceId: string,
  queryEmbedding: number[],
  limit: number = 5
): Promise<Array<{
  id: string;
  content: string;
  distance: number;
  filename: string;
  docId: string;
  metadata: string | null;
}>> {
  // Get instance to verify ownership and get userId
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { userId: true },
  });
  if (!instance) {
    return [];
  }

  const embeddingsArrayStr = `[${queryEmbedding.join(',')}]`;
  return prisma.$queryRaw`
    SELECT 
      "KnowledgeChunk"."id",
      "KnowledgeChunk"."content",
      "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector as "distance",
      "KnowledgeDoc"."filename",
      "KnowledgeDoc"."id" as "docId",
      "KnowledgeChunk"."metadata"
    FROM "KnowledgeChunk"
    JOIN "KnowledgeDoc" ON "KnowledgeChunk"."docId" = "KnowledgeDoc"."id"
    JOIN "KnowledgeBase" ON "KnowledgeDoc"."knowledgeBaseId" = "KnowledgeBase"."id"
    JOIN "AIInstance" ON "KnowledgeBase"."instanceId" = "AIInstance"."id"
    WHERE 
      "AIInstance"."id" = ${instanceId}
      AND "AIInstance"."userId" = ${instance.userId}
      AND "KnowledgeChunk"."embedding" IS NOT NULL
    ORDER BY "KnowledgeChunk"."embedding" <=> ${embeddingsArrayStr}::vector
    LIMIT ${limit}
  `;
}

/**
 * Calculate total storage used by knowledge base for an instance
 */
export async function getKnowledgeBaseStorage(instanceId: string): Promise<{
  totalBytes: number;
  documentCount: number;
  chunkCount: number;
}> {
  const result = await prisma.$queryRaw<[{ totalBytes: bigint; documentCount: bigint; chunkCount: bigint }]>`
    SELECT 
      COALESCE(SUM(d."fileSize"), 0) as "totalBytes",
      COUNT(DISTINCT d."id") as "documentCount",
      COUNT(c."id") as "chunkCount"
    FROM "KnowledgeBase" b
    LEFT JOIN "KnowledgeDoc" d ON b."id" = d."knowledgeBaseId"
    LEFT JOIN "KnowledgeChunk" c ON d."id" = c."docId"
    WHERE b."instanceId" = ${instanceId}
  `;

  return {
    totalBytes: Number(result[0]?.totalBytes ?? 0),
    documentCount: Number(result[0]?.documentCount ?? 0),
    chunkCount: Number(result[0]?.chunkCount ?? 0),
  };
}

/**
 * Get storage limits based on user plan
 */
export function getStorageLimits(plan: string): {
  maxBytesPerFile: number;
  maxTotalBytes: number;
} {
  // Max 10MB per file for all plans
  const maxBytesPerFile = 10 * 1024 * 1024;
  
  // Total storage: 50MB for free, 100MB for pro/enterprise
  const maxTotalBytes = plan === 'free' 
    ? 50 * 1024 * 1024 
    : 100 * 1024 * 1024;
  
  return { maxBytesPerFile, maxTotalBytes };
}
