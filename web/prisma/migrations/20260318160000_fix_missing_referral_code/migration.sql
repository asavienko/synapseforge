-- Fix missing columns that aren't in any other migration
-- Only adding columns not covered by existing migrations

-- User table: referralCode (not in any other migration)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- AIInstance table: columns not in other migrations
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "syncRequested" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "configSynced" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "telegramBotUsername" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "sshPrivateKey" TEXT;
