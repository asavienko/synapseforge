-- CreateTable (IF NOT EXISTS: safe to re-run if applied via prisma db execute)
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isError" BOOLEAN NOT NULL DEFAULT false,
    "latencyMs" INTEGER,
    "provider" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey (skip if constraint already exists)
DO $$ BEGIN
  ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_instanceId_fkey"
    FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
