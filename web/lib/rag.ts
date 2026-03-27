import { prisma } from '@/lib/prisma';
import { searchSimilarChunks, getKnowledgeBaseStorage } from '@/lib/knowledge';
import { EMBEDDING_MODEL } from '@/lib/knowledge/embeddings';
import { randomUUID } from 'crypto';

const OPENAI_KEY = process.env.SYNAPSEFORGE_OPENAI_KEY || process.env.OPENHELIX_OPENAI_KEY || process.env.OPENAI_API_KEY;

interface SimilarChunk {
  id: string;
  content: string;
  score: number;
  filename: string;
  docId: string;
  metadata?: {
    page?: number;
    startChar?: number;
    endChar?: number;
  } | null;
}

async function getQueryEmbedding(query: string): Promise<number[] | null> {
  if (!OPENAI_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({ input: query, model: EMBEDDING_MODEL }),
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
    JOIN "knowledge_base" b ON d."knowledgeBaseId" = b."id"
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
 * Format context with source citations
 */
function formatContextWithCitations(chunks: SimilarChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const citation = `[${index + 1}]`;
      const source = chunk.filename;
      const page = chunk.metadata?.page ? ` (p.${chunk.metadata.page})` : '';
      return `${citation} ${chunk.content}\n   — Source: ${source}${page}`;
    })
    .join('\n\n');
}

/**
 * Retrieve relevant knowledge base context for a given query.
 * Uses pgvector similarity when available, with cosine similarity fallback.
 */
export async function retrieveContext(
  instanceId: string,
  query: string,
  topK = 3
): Promise<{ context: string; sources: string[] }> {
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

    if (!kb || kb.documents.length === 0) {
      return { context: "", sources: [] };
    }

    // Check if migration is needed and trigger it once
    const migrationNeeded = await needsMigration(instanceId);
    if (migrationNeeded) {
      const recentJob = await prisma.migrationJob.findFirst({
        where: {
          instanceId,
          type: 'knowledge_embeddings',
          status: { in: ['queued', 'running'] },
          createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
        },
      });

      if (!recentJob) {
        await startBackgroundMigration(instanceId);
      }
    }

    // Try embedding-based similarity via pgvector
    const queryEmbedding = await getQueryEmbedding(query);

    if (queryEmbedding) {
      const results = await searchSimilarChunks(instanceId, queryEmbedding, topK * 2);
      
      // Parse metadata from results and filter by threshold
      const filtered: SimilarChunk[] = results
        .map(r => ({
          ...r,
          score: 1 - r.distance,
          metadata: r.metadata ? JSON.parse(r.metadata) : null,
        }))
        .filter(r => r.score > 0.5)
        .slice(0, topK);

      if (filtered.length > 0) {
        const sources = [...new Set(filtered.map(r => r.filename))];
        return {
          context: formatContextWithCitations(filtered),
          sources,
        };
      }
    }

    // Fallback: simple keyword search
    const allChunks = kb.documents.flatMap(d => d.chunks);
    if (allChunks.length === 0) {
      return { context: "", sources: [] };
    }

    const queryLower = query.toLowerCase();
    const keywords = queryLower
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 10);

    const scored = allChunks
      .map(chunk => {
        const contentLower = chunk.content.toLowerCase();
        const score = keywords.reduce((acc, kw) => acc + (contentLower.includes(kw) ? 1 : 0), 0);
        return { content: chunk.content, score, filename: chunk.docId };
      })
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (scored.length > 0) {
      // Get filenames for fallback results
      const docIds = [...new Set(scored.map(s => s.filename))];
      const docs = await prisma.knowledgeDoc.findMany({
        where: { id: { in: docIds } },
        select: { id: true, filename: true },
      });
      const docMap = new Map(docs.map(d => [d.id, d.filename]));
      
      const sources = [...new Set(scored.map(s => docMap.get(s.filename) || 'Unknown'))];
      
      return {
        context: scored.map(s => s.content).join('\n\n---\n\n'),
        sources,
      };
    }

    return { context: "", sources: [] };
  } catch (err) {
    console.error("[rag] retrieval error:", err);
    return { context: "", sources: [] };
  }
}

/**
 * Get knowledge base stats for an instance
 */
export async function getKnowledgeBaseStats(instanceId: string): Promise<{
  documentCount: number;
  chunkCount: number;
  totalSize: number;
}> {
  try {
    const storage = await getKnowledgeBaseStorage(instanceId);
    return {
      documentCount: storage.documentCount,
      chunkCount: storage.chunkCount,
      totalSize: storage.totalBytes,
    };
  } catch (err) {
    console.error("[rag] stats error:", err);
    return { documentCount: 0, chunkCount: 0, totalSize: 0 };
  }
}
