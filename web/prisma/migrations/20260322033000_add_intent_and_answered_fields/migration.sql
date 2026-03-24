-- Add conversation intelligence fields to ChatMessage
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "intent" TEXT;
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "wasAnswered" BOOLEAN NOT NULL DEFAULT true;
