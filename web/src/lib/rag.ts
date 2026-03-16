import { prisma } from '@/lib/prisma';
import { searchSimilarChunks } from '@/lib/knowledge';
import { randomUUID } from 'crypto';

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: query, model: "text-embedding-3-small" }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if instance knowledge base needs migration (has JSON embeddings)
 */
async function needsMigration(instanceId: string): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as "count"
    FROM "KnowledgeChunk" c
    JOIN "KnowledgeDoc" d ON c."docId" = d."id"
    JOIN "KnowledgeBase" b ON d."knowledgeBaseId" = b."id"
    WHERE b."instanceId" = ${instanceId}
      AND c."embedding" IS NOT NULL
      AND pg_typeof(c."embedding") = 'text'::regtype
  `;
  return Number(result[0]?.count ?? 0) > 0;
}

/**
 * Start a background migration job (non-blocking)
 */
async function startBackgroundMigration(instanceId: string) {
  const jobId = randomUUID();
  await prisma.migrationJob.create({
    data: {
      id: jobId,
      instanceId,
      type: 'knowledge_embeddings',
      status: 'queued',
      progress: 0,
    },
  });

  // Fire-and-forget: the actual migration runs in a separate process
  // In production, this would be a proper background job (e.g., BullMQ, Upstash)
  const apiKey = process.env.INTERNAL_API_KEY;
  if (!apiKey) {
    console.error('[migration] INTERNAL_API_KEY not set, cannot start background migration');
    return;
  }

  fetch(`${process.env.NEXTAUTH_URL}/api/internal/run-migration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-api-key': apiKey,
    },
    body: JSON.stringify({ jobId, instanceId }),
  }).catch(() => {}); // ignore errors
}

/**
 * Retrieve relevant knowledge base context for a given query.
 * Uses pgvector similarity when available, with cosine similarity fallback.
 */
export async function retrieveContext(
  instanceId: string,
  query: string,
  topK = 3
): Promise<string> {
  try {
    const kb = await prisma.knowledgeBase.findUnique({
      where: { instanceId },
      include: {
        documents: {
          where: { status: "ready" },
          include: { chunks: true },
        },
      },
    });

    if (!kb || kb.documents.length === 0) return "";

    // Check if migration is needed and trigger it once
    const migrationNeeded = await needsMigration(instanceId);
    if (migrationNeeded) {
      // Check if there's already a recent migration job running
      const recentJob = await prisma.migrationJob.findFirst({
        where: {
          instanceId,
          type: 'knowledge_embeddings',
          status: { in: ['queued', 'running'] },
          createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) }, // last 10 min
        },
      });

      if (!recentJob) {
        await startBackgroundMigration(instanceId);
      }
    }

    // Try embedding-based similarity via pgvector
    const queryEmbedding = await getQueryEmbedding(query);

    if (queryEmbedding) {
      const results = await searchSimilarChunks(instanceId, queryEmbedding, topK * 2); // get extra to filter
      // Convert distance to similarity and filter by threshold
      const filtered = results
        .map(r => ({ ...r, similarity: 1 - r.distance }))
        .filter(r => r.similarity > 0.5)
        .slice(0, topK);
      if (filtered.length > 0) {
        return filtered.map(r => r.content).join("\n\n---\n\n");
      }
    }

    // Fallback: simple keyword search within already-fetched chunks
    const allChunks = kb.documents.flatMap(d => d.chunks);
    if (allChunks.length === 0) return "";

    // Simple keyword fallback if no vector results
    const queryLower = query.toLowerCase();
    const keywords = queryLower
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 10);

    const scored = allChunks
      .map(chunk => {
        const contentLower = chunk.content.toLowerCase();
        const score = keywords.reduce((acc, kw) => acc + (contentLower.includes(kw) ? 1 : 0), 0);
        return { content: chunk.content, score };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (scored.length > 0) {
      return scored.map(s => s.content).join("\n\n---\n\n");
    }

    // Last resort: return first N chunks
    return allChunks.slice(0, topK).map(c => c.content).join("\n\n---\n\n");
  } catch (err) {
    console.error("[rag] retrieval error:", err);
    return "";
  }
}