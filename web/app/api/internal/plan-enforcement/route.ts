import { NextRequest, NextResponse } from "next/server";
import { enforceExpiredSubscriptions } from "@/lib/plan-enforcement";
import { email as emailService } from "@/lib/email";

/**
 * POST/GET /api/internal/plan-enforcement
 *
 * Vercel Cron job (runs daily at 02:00 UTC).
 * Catches Stripe webhook failures: finds users whose stripeCurrentPeriodEnd
 * has passed but whose plan is still set to a paid tier, downgrade them to
 * free, stops excess instances, and emails them.
 *
 * Safe to run multiple times — idempotent (users already on free plan are skipped).
 */
async function handler(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const cronHeader = req.headers.get("x-vercel-cron");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  const isVercelCron = cronHeader === "1";
  const isAuthorized = isVercelCron || (internalKey && token === internalKey);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await enforceExpiredSubscriptions();

  // Send downgrade emails
  for (const result of results) {
    emailService.planDowngraded(
      result.userEmail,
      result.userName,
      result.newPlan === "free" ? "paid" : result.newPlan, // fromPlan not tracked here
      "free",
      result.stoppedInstances
    ).catch(console.error);
  }

  const totalStopped = results.reduce((s, r) => s + r.stoppedInstances.length, 0);

  if (results.length > 0) {
    console.log(`[plan-enforcement] Downgraded ${results.length} users, stopped ${totalStopped} instances`);
  }

  return NextResponse.json({
    ok: true,
    downgraded: results.length,
    instancesStopped: totalStopped,
    users: results.map((r) => ({
      email: r.userEmail,
      stoppedInstances: r.stoppedInstances.length,
    })),
  });
}

export const GET = handler;
export const POST = handler;
