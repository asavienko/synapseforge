-- Add missing referralCode column to User table
-- This column exists in Prisma schema but was never added to the database

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;

-- Create unique index for the referralCode (required by @unique in Prisma schema)
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");
