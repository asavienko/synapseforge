-- Add missing AIInstance sync and bot columns
-- These columns exist in Prisma schema but were never added to the database

ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "syncRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "configSynced" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "telegramBotUsername" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "sshPrivateKey" TEXT;
