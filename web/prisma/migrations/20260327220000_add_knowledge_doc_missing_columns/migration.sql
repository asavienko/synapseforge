-- Add missing columns to KnowledgeDoc
-- Original migration (20260313) only created: id, knowledgeBaseId, filename, fileSize, status, createdAt
-- Schema expects: type, contentText, chunkCount, updatedAt
ALTER TABLE "KnowledgeDoc"
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'txt',
  ADD COLUMN IF NOT EXISTS "contentText" TEXT,
  ADD COLUMN IF NOT EXISTS "chunkCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
