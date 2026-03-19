-- Create Webhook table for storing webhook configurations
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[] NOT NULL,
    "secret" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- Create index for faster lookups by instance
CREATE INDEX "Webhook_instanceId_idx" ON "Webhook"("instanceId");

-- Add foreign key constraint
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_instanceId_fkey" 
    FOREIGN KEY ("instanceId") REFERENCES "AIInstance"("id") ON DELETE CASCADE;

-- Create WebhookDelivery table for tracking webhook deliveries
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "statusCode" INTEGER,
    "response" TEXT,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- Create index for webhook deliveries
CREATE INDEX "WebhookDelivery_webhookId_idx" ON "WebhookDelivery"("webhookId");
CREATE INDEX "WebhookDelivery_createdAt_idx" ON "WebhookDelivery"("createdAt");

-- Add foreign key constraint
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" 
    FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE;
