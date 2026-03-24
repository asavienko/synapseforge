-- OpenClawVersion
CREATE TABLE IF NOT EXISTS "OpenClawVersion" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tag" TEXT NOT NULL UNIQUE,
  "imageRef" TEXT NOT NULL,
  "changelog" TEXT,
  "stable" BOOLEAN NOT NULL DEFAULT false,
  "deprecated" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- InstanceCommand
CREATE TABLE IF NOT EXISTS "InstanceCommand" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "instanceId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "requestedBy" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "errorMsg" TEXT,
  CONSTRAINT "InstanceCommand_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "InstanceCommand_instanceId_status_idx" ON "InstanceCommand"("instanceId", "status");

-- MachineSnapshot
CREATE TABLE IF NOT EXISTS "MachineSnapshot" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "instanceId" TEXT NOT NULL,
  "hetznerImageId" TEXT NOT NULL,
  "sizeGb" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'creating',
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MachineSnapshot_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add fields to AIInstance
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "currentVersion" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "targetVersion" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "versionLockedAt" TIMESTAMP(3);
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "autoUpdate" BOOLEAN NOT NULL DEFAULT false;

-- Add fields to Snapshot (check existing column names first)
ALTER TABLE "Snapshot" ADD COLUMN IF NOT EXISTS "label" TEXT;
ALTER TABLE "Snapshot" ADD COLUMN IF NOT EXISTS "tag" TEXT;
ALTER TABLE "Snapshot" ADD COLUMN IF NOT EXISTS "triggeredBy" TEXT;
