-- Enable pgvector if available (skips gracefully in CI/testing environments)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector extension not available, skipping vector setup';
END $$;

-- Knowledge base tables (core tables work without pgvector)
CREATE TABLE IF NOT EXISTS "KnowledgeBase" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "instanceId" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL DEFAULT 'Knowledge Base',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeBase_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "KnowledgeDoc" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "knowledgeBaseId" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'processing',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeDoc_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- KnowledgeChunk without vector column (will be added via separate migration when pgvector is available)
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "docId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeChunk_docId_fkey" FOREIGN KEY ("docId") REFERENCES "KnowledgeDoc"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "KnowledgeChunk_docId_idx" ON "KnowledgeChunk"("docId");
