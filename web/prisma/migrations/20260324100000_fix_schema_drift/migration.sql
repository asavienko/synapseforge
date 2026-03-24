-- Fix schema drift: add missing columns to WhiteLabelConfig
-- The init migration created WhiteLabelConfig with different columns than the current schema

-- Add missing WhiteLabelConfig columns (present in Prisma schema, missing in DB)
ALTER TABLE "WhiteLabelConfig" ADD COLUMN IF NOT EXISTS "brandName" TEXT NOT NULL DEFAULT 'OpenHelix AI';
ALTER TABLE "WhiteLabelConfig" ADD COLUMN IF NOT EXISTS "brandColor" TEXT NOT NULL DEFAULT '#7c3aed';
ALTER TABLE "WhiteLabelConfig" ADD COLUMN IF NOT EXISTS "hidePoweredBy" BOOLEAN NOT NULL DEFAULT false;

-- Rename old columns if they exist (primaryColor → brandColor conflict handled by IF NOT EXISTS above)
-- Note: primaryColor and secondaryColor from init migration are not in current schema; leaving them as-is
-- to avoid data loss. Prisma will just ignore unknown columns.

-- Ensure Manager.email has unique index (should already exist but safety guard)
CREATE UNIQUE INDEX IF NOT EXISTS "Manager_email_key" ON "Manager"("email");

-- Ensure Message table exists with correct schema
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "body" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Message"("userId");
CREATE INDEX IF NOT EXISTS "Message_managerId_idx" ON "Message"("managerId");
