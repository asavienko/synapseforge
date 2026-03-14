/**
 * Sandbox re-engagement cron — runs daily.
 *
 * Two cohorts:
 *
 * A) COLD START (sandboxUsed === 0): signed up 36–72h ago, never sent a message.
 *    Sends "your agent is waiting for a first message" email.
 *    Tracked via ActivityLog event: "sandbox_cold_start_sent"
 *
 * B) PARTIAL (sandboxUsed > 0, < SANDBOX_LIMIT): signed up 20–52h ago, tried it but stopped.
 *    Sends "X messages left — your AI is waiting" email.
 *    Tracked via ActivityLog event: "sandbox_nudge_sent"
 *
 * Goal: pull distracted users back before they forget about the product.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";
import { SANDBOX_LIMIT } from "@/lib/sandbox";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WINDOW_MIN_HOURS = 20; // don't email too early
const WINDOW_MAX_HOURS = 52; // don't email too late (already handled by inactivity nudge at 7d)

export async function GET(req: Request) {
  // Allow Vercel Cron invocations (x-vercel-cron: 1) OR explicit Bearer CRON_SECRET
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();

  // Cohort A: cold start — signed up 36–72h ago, never tried the sandbox
  const coldWindowStart = new Date(now - 72 * 3600 * 1000);
  const coldWindowEnd   = new Date(now - 36 * 3600 * 1000);

  // Cohort B: partial — signed up 20–52h ago, tried sandbox but didn't finish
  const nudgeWindowStart = new Date(now - 52 * 3600 * 1000);
  const nudgeWindowEnd   = new Date(now - 20 * 3600 * 1000);

  const [coldCandidates, nudgeCandidates] = await Promise.all([
    // Cohort A: sandboxUsed === 0
    prisma.user.findMany({
      where: {
        createdAt: { gte: coldWindowStart, lte: coldWindowEnd },
        instances: { some: { sandboxMode: true, sandboxUsed: 0 } },
      },
      include: {
        instances: {
          where: { sandboxMode: true, sandboxUsed: 0 },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    }),
    // Cohort B: 1 ≤ sandboxUsed < SANDBOX_LIMIT
    prisma.user.findMany({
      where: {
        createdAt: { gte: nudgeWindowStart, lte: nudgeWindowEnd },
        instances: { some: { sandboxMode: true, sandboxUsed: { gt: 0, lt: SANDBOX_LIMIT } } },
      },
      include: {
        instances: {
          where: { sandboxMode: true, sandboxUsed: { gt: 0, lt: SANDBOX_LIMIT } },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
    }),
  ]);

  let sent = 0;
  let skipped = 0;

  // ── Cohort A: cold start ───────────────────────────────────────────────────
  for (const user of coldCandidates) {
    if (!user.email || user.instances.length === 0) { skipped++; continue; }
    const instance = user.instances[0];

    const alreadySent = await prisma.activityLog.findFirst({
      where: { instanceId: instance.id, event: "sandbox_cold_start_sent" },
    });
    if (alreadySent) { skipped++; continue; }

    const ok = await email.sandboxColdStart(
      user.email,
      user.name ?? "there",
      instance.name,
      instance.id,
      SANDBOX_LIMIT,
    ).catch(() => false);

    if (ok) {
      await prisma.activityLog.create({
        data: {
          instanceId: instance.id,
          event: "sandbox_cold_start_sent",
          details: `Cold-start email sent to ${user.email} (sandboxUsed: 0)`,
        },
      });
      sent++;
    } else {
      skipped++;
    }
  }

  // ── Cohort B: partial users ────────────────────────────────────────────────
  for (const user of nudgeCandidates) {
    if (!user.email || user.instances.length === 0) { skipped++; continue; }
    const instance = user.instances[0];

    const alreadySent = await prisma.activityLog.findFirst({
      where: { instanceId: instance.id, event: "sandbox_nudge_sent" },
    });
    if (alreadySent) { skipped++; continue; }

    const ok = await email.sandboxNudge(
      user.email,
      user.name ?? "there",
      instance.name,
      instance.id,
      instance.sandboxUsed,
      SANDBOX_LIMIT,
    ).catch(() => false);

    if (ok) {
      await prisma.activityLog.create({
        data: {
          instanceId: instance.id,
          event: "sandbox_nudge_sent",
          details: `Re-engagement email sent to ${user.email} (sandboxUsed: ${instance.sandboxUsed})`,
        },
      });
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    checked: coldCandidates.length + nudgeCandidates.length,
    cohorts: { coldStart: coldCandidates.length, partial: nudgeCandidates.length },
  });
}
