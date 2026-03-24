-- Add WhatsApp Business fields to AIInstance table
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappPhoneNumber" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappAccountId" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappBusinessName" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappApiKey" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappAccessToken" TEXT;
ALTER TABLE "AIInstance" ADD COLUMN IF NOT EXISTS "whatsappWebhookSecret" TEXT;
