-- Create ConversationRating table
CREATE TABLE "ConversationRating" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationRating_pkey" PRIMARY KEY ("id")
);

-- Create unique index on conversationId
CREATE UNIQUE INDEX "ConversationRating_conversationId_key" ON "ConversationRating"("conversationId");

-- Create indexes
CREATE INDEX "ConversationRating_instanceId_idx" ON "ConversationRating"("instanceId");
CREATE INDEX "ConversationRating_rating_idx" ON "ConversationRating"("rating");
CREATE INDEX "ConversationRating_createdAt_idx" ON "ConversationRating"("createdAt");
