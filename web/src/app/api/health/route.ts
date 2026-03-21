import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 *
 * Public health check endpoint for monitoring and debugging.
 * Returns status of all critical services.
 */
export async function GET() {
  const checks = {
    database: false,
    databaseLatency: 0,
    stripe: false,
    resend: false,
    timestamp: new Date().toISOString(),
  };

  // Check database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
    checks.databaseLatency = Date.now() - dbStart;
  } catch {
    checks.database = false;
  }

  // Check Stripe (if configured)
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const { stripe } = await import("@/lib/stripe");
      await stripe.customers.list({ limit: 1 });
      checks.stripe = true;
    } catch {
      checks.stripe = false;
    }
  }

  // Check Resend (if configured)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "HEAD",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      checks.resend = res.status === 404; // 404 is expected for HEAD, means API is up
    } catch {
      checks.resend = false;
    }
  }

  const allHealthy = checks.database;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      ...checks,
    },
    { status: allHealthy ? 200 : 503 }
  );
}