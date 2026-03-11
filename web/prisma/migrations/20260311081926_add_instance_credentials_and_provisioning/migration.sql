-- CreateTable
CREATE TABLE "InstanceCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "instanceId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InstanceCredential_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "AIInstance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AIInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'assistant',
    "status" TEXT NOT NULL DEFAULT 'stopped',
    "tier" TEXT NOT NULL DEFAULT 'minimal',
    "description" TEXT,
    "config" TEXT,
    "healthStatus" TEXT,
    "lastCheckedAt" DATETIME,
    "lastBackupAt" DATETIME,
    "vpsUrl" TEXT,
    "gatewayToken" TEXT,
    "provisionStatus" TEXT,
    "vpsProvider" TEXT,
    "vpsServerId" TEXT,
    "bootstrapToken" TEXT,
    "bootstrapUsed" BOOLEAN NOT NULL DEFAULT false,
    "configSynced" BOOLEAN NOT NULL DEFAULT true,
    "sshPrivateKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AIInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AIInstance" ("config", "createdAt", "description", "gatewayToken", "healthStatus", "id", "lastBackupAt", "lastCheckedAt", "name", "status", "tier", "type", "updatedAt", "userId", "vpsUrl") SELECT "config", "createdAt", "description", "gatewayToken", "healthStatus", "id", "lastBackupAt", "lastCheckedAt", "name", "status", "tier", "type", "updatedAt", "userId", "vpsUrl" FROM "AIInstance";
DROP TABLE "AIInstance";
ALTER TABLE "new_AIInstance" RENAME TO "AIInstance";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "InstanceCredential_instanceId_key_key" ON "InstanceCredential"("instanceId", "key");
