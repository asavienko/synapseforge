-- Enable pgvector extension (Neon has it pre-installed)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add the embedding vector column and metadata to KnowledgeChunk
-- This was deferred in 20260313_add_knowledge_base ("will be added via separate migration")
ALTER TABLE "KnowledgeChunk"
  ADD COLUMN IF NOT EXISTS "embedding" vector(1536),
  ADD COLUMN IF NOT EXISTS "metadata" TEXT;

-- HNSW index for cosine similarity search (handles incremental inserts)
-- Wrapped in exception handler so non-pgvector environments don't block deploy
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS "KnowledgeChunk_embedding_idx"
    ON "KnowledgeChunk" USING hnsw ("embedding" vector_cosine_ops);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'HNSW index skipped: %', SQLERRM;
END $$;
