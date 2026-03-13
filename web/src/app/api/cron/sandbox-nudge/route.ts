/**
 * Sandbox re-engagement cron — runs every 6 hours.
 *
 * Finds users who:
 *  1. Signed up 20–52h ago (roughly T+24h, 32h window to avoid missing anyone between runs)
 *  2. Still in sandbox mode (haven't added their own API key yet)
 *  3. Have used at least 1 sandbox message (they tried it — worth re-engaging)
 *  4. Have NOT exhausted the sandbox (there's still value to demonstrate)
 *  5. Haven't already received this nudge (checked via ActivityLog)
 *
 * The email shows how many messages they've used, how many remain, and what to try next.
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
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const windowStart = new Date(now - WINDOW_MAX_HOURS * 3600 * 1000);
  const windowEnd   = new Date(now - WINDOW_MIN_HOURS * 3600 * 1000);

  // Users created in the window, still in sandbox, with at least 1 message used
  const candidates = await prisma.user.findMany({
    where: {
      createdAt: { gte: windowStart, lte: windowEnd },
      instances: {
        some: {
          sandboxMode: true,
          sandboxUsed: { gt: 0, lt: SANDBOX_LIMIT },
        },
      },
    },
    include: {
      instances: {
        where: {
          sandboxMode: true,
          sandboxUsed: { gt: 0, lt: SANDBOX_LIMIT },
        },
        orderBy: { createdAt: "asc" },
        take: 1, // primary instance
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const user of candidates) {
    if (!user.email || user.instances.length === 0) { skipped++; continue; }

    const instance = user.instances[0];

    // Check if already nudged — use ActivityLog as state store (no schema change needed)
    const alreadySent = await prisma.activityLog.findFirst({
      where: {
        instanceId: instance.id,
        event: "sandbox_nudge_sent",
      },
    });
    if (alreadySent) { skipped++; continue; }

    // Send the nudge
    const ok = await email.sandboxNudge(
      user.email,
      user.name ?? "there",
      instance.name,
      instance.id,
      instance.sandboxUsed,
      SANDBOX_LIMIT,
    ).catch(() => false);

    if (ok) {
      // Mark as sent so we don't re-send on next cron run
      await prisma.activityLog.create({
        data: {
          instanceId: instance.id,
          event: "sandbox_nudge_sent",
          details: `Re-engagement email sent to ${user.email} (sandboxUsed: ${instance.sandboxUsed})`,
        },
      });
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    checked: candidates.length,
  });
}
