-- Add token tracking columns to ChatMessage
-- inputTokens: prompt tokens consumed (from LLM provider response)
-- outputTokens: completion tokens generated
-- source: which API surface originated the message ("dashboard" | "api" | "api/openai-compat")

ALTER TABLE "ChatMessage"
  ADD COLUMN IF NOT EXISTS "inputTokens" INTEGER,
  ADD COLUMN IF NOT EXISTS "outputTokens" INTEGER,
  ADD COLUMN IF NOT EXISTS "source" TEXT;
