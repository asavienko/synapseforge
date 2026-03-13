import { prisma } from "@/lib/prisma";

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
 * Cosine similarity between two vectors (fallback when pgvector not available).
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
 * Uses embedding cosine similarity when available, otherwise keyword fallback.
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

    const allChunks = kb.documents.flatMap((d) => d.chunks);
    if (allChunks.length === 0) return "";

    // Try embedding-based similarity
    const queryEmbedding = await getQueryEmbedding(query);

    if (queryEmbedding) {
      // Score chunks by cosine similarity using stored embeddings
      const scored = allChunks
        .map((chunk) => {
          let similarity = 0;
          if (chunk.embedding) {
            try {
              const emb = JSON.parse(chunk.embedding) as number[];
              similarity = cosineSimilarity(queryEmbedding, emb);
            } catch {
              // ignore parse errors
            }
          }
          return { content: chunk.content, similarity };
        })
        .filter((c) => c.similarity > 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      if (scored.length > 0) {
        return scored.map((c) => c.content).join("\n\n---\n\n");
      }
    }

    // Fallback: simple keyword search
    const queryLower = query.toLowerCase();
    const keywords = queryLower
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 10);

    const scored = allChunks
      .map((chunk) => {
        const contentLower = chunk.content.toLowerCase();
        const score = keywords.reduce(
          (acc, kw) => acc + (contentLower.includes(kw) ? 1 : 0),
          0
        );
        return { content: chunk.content, score };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (scored.length > 0) {
      return scored.map((c) => c.content).join("\n\n---\n\n");
    }

    // Last resort: return first N chunks
    return allChunks
      .slice(0, topK)
      .map((c) => c.content)
      .join("\n\n---\n\n");
  } catch (err) {
    console.error("[rag] retrieval error:", err);
    return "";
  }
}
