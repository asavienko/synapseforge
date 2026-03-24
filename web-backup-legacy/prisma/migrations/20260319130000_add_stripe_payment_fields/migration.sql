-- Add Stripe payment tracking fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCancelAtPeriodEnd" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripePaymentFailedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripePaymentFailedInvoiceId" TEXT;

-- Create index for finding users with payment failures
CREATE INDEX IF NOT EXISTS "User_stripePaymentFailedAt_idx" ON "User"("stripePaymentFailedAt");

-- Create index for finding users with pending cancellations
CREATE INDEX IF NOT EXISTS "User_stripeCancelAtPeriodEnd_idx" ON "User"("stripeCancelAtPeriodEnd") WHERE "stripeCancelAtPeriodEnd" = true;
