import { prisma } from '@/lib/prisma';
import { searchSimilarChunks } from '@/lib/knowledge';

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
 * Cosine similarity (fallback if needed)
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
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

    // Check if there are legacy JSON embeddings that need migration
    const legacyCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as "count"
      FROM "KnowledgeChunk" k
      JOIN "KnowledgeDoc" d ON k."docId" = d."id"
      JOIN "KnowledgeBase" b ON d."knowledgeBaseId" = b."id"
      WHERE b."instanceId" = ${instanceId}
        AND k."embedding" IS NOT NULL
        AND pg_typeof(k."embedding") = 'text'::regtype
      LIMIT 1
    `;
    if (Number(legacyCount[0]?.count ?? 0) > 0) {
      // Trigger background migration (fire and forget)
      fetch(`${process.env.NEXTAUTH_URL}/api/instances/${instanceId}/knowledge/migrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {}); // ignore errors
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