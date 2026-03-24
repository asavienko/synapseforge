CREATE TABLE IF NOT EXISTS "Webhook" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "instanceId" TEXT,
  "url" TEXT NOT NULL,
  "events" TEXT NOT NULL,
  "secret" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Webhook_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Webhook_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Webhook_userId_idx" ON "Webhook"("userId");
