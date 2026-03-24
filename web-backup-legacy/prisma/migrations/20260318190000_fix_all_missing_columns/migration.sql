-- Comprehensive migration to add all missing columns
-- This fixes the schema mismatch between Prisma and the database

-- Add missing columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- Add missing columns to AIInstance table (sync-related)
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "syncRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "configSynced" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "telegramBotUsername" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "sshPrivateKey" TEXT;

-- Add missing columns to AIInstance table (Discord/Slack - from 20260312_add_discord_slack_fields)
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "discordBotUsername" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "discordBotId" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "slackBotName" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "slackTeamName" TEXT;

-- Add missing columns to AIInstance table (version management - from 20260313_version_management)
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "currentVersion" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "targetVersion" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "autoUpdate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "versionLockedAt" TIMESTAMP(3);

-- Add missing columns to AIInstance table (sandbox mode - from 20260313_sandbox_mode)
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "sandboxMode" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "sandboxUsed" INTEGER NOT NULL DEFAULT 0;
