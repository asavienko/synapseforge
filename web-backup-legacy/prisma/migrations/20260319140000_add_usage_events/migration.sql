-- Create UsageEvent table for tracking API usage
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient querying
CREATE INDEX "UsageEvent_userId_createdAt_idx" ON "UsageEvent"("userId", "createdAt");
CREATE INDEX "UsageEvent_instanceId_createdAt_idx" ON "UsageEvent"("instanceId", "createdAt");
CREATE INDEX "UsageEvent_type_createdAt_idx" ON "UsageEvent"("type", "createdAt");

-- Add foreign key constraints
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_instanceId_fkey"
    FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE CASCADE;
