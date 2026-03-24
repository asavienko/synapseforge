-- Infrastructure: health checks, snapshots, credentials, and provisioning fields

-- AlterTable: Add infrastructure + provisioning fields to AIInstance
ALTER TABLE "AIInstance"
  ADD COLUMN "healthStatus"    TEXT,
  ADD COLUMN "lastCheckedAt"   TIMESTAMP(3),
  ADD COLUMN "lastBackupAt"    TIMESTAMP(3),
  ADD COLUMN "vpsUrl"          TEXT,
  ADD COLUMN "gatewayToken"    TEXT,
  ADD COLUMN "provisionStatus" TEXT,
  ADD COLUMN "vpsProvider"     TEXT,
  ADD COLUMN "vpsServerId"     TEXT,
  ADD COLUMN "bootstrapToken"  TEXT,
  ADD COLUMN "bootstrapUsed"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "configSynced"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "sshPrivateKey"   TEXT;

-- CreateTable: HealthCheck
CREATE TABLE "HealthCheck" (
    "id"         TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status"     TEXT NOT NULL,
    "responseMs" INTEGER,
    "error"      TEXT,
    "checkedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HealthCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Snapshot
CREATE TABLE "Snapshot" (
    "id"         TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "sizeBytes"  INTEGER,
    "healthy"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InstanceCredential
CREATE TABLE "InstanceCredential" (
    "id"         TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "key"        TEXT NOT NULL,
    "value"      TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstanceCredential_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: HealthCheck → AIInstance
ALTER TABLE "HealthCheck"
  ADD CONSTRAINT "HealthCheck_instanceId_fkey"
  FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Snapshot → AIInstance
ALTER TABLE "Snapshot"
  ADD CONSTRAINT "Snapshot_instanceId_fkey"
  FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: InstanceCredential → AIInstance
ALTER TABLE "InstanceCredential"
  ADD CONSTRAINT "InstanceCredential_instanceId_fkey"
  FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: InstanceCredential unique per instance+key
CREATE UNIQUE INDEX "InstanceCredential_instanceId_key_key"
  ON "InstanceCredential"("instanceId", "key");
