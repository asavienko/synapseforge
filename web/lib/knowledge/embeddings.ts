import OpenAI from 'openai';

const OPENAI_KEY = process.env.OPENHELIX_OPENAI_KEY || process.env.OPENAI_API_KEY;
const openai = OPENAI_KEY ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

export const EMBEDDING_MODEL = 'text-embedding-ada-002';
export const EMBEDDING_DIMENSION = 1536;

/**
 * Generate an embedding vector for the given text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  // Truncate text to fit within token limits (8191 tokens for ada-002)
  // Approximate: 1 token ≈ 4 characters
  const maxChars = 8191 * 4;
  const truncatedText = text.length > maxChars 
    ? text.slice(0, maxChars) 
    : text;

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[embeddings] Failed to generate embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple chunks in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  if (texts.length === 0) {
    return [];
  }

  // Truncate texts
  const maxChars = 8191 * 4;
  const truncatedTexts = texts.map(text => 
    text.length > maxChars ? text.slice(0, maxChars) : text
  );

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedTexts,
    });

    return response.data.map(d => d.embedding);
  } catch (error) {
    console.error('[embeddings] Failed to generate batch embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Validate embedding vector
 */
export function isValidEmbedding(embedding: number[]): boolean {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSION &&
    embedding.every(n => typeof n === 'number' && !isNaN(n))
  );
}
