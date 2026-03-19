import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

// How long (in minutes) before a "provisioning" instance is considered failed.
const TIMEOUT_MINUTES = 15;

/**
 * POST /api/internal/provision-timeout
 *
 * Runs on a schedule (Vercel Cron: every 10 minutes).
 * Finds instances stuck in "provisioning" for more than TIMEOUT_MINUTES and
 * marks them as failed, notifies the user via email, and logs the event.
 *
 * Also accepts GET so Vercel Cron invocations work (Vercel uses GET for cron by default).
 */
async function handler(req: NextRequest) {
  // Validate internal API key or Vercel Cron header
  const authHeader = req.headers.get("authorization") ?? "";
  const cronHeader = req.headers.get("x-vercel-cron");
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  // Allow Vercel Cron invocations (they send x-vercel-cron: 1) OR internal key
  const isVercelCron = cronHeader === "1";
  const isAuthorized = isVercelCron || (internalKey && token === internalKey);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

  // Find instances stuck in provisioning past the timeout window
  const stuckInstances = await prisma.aIInstance.findMany({
    where: {
      provisionStatus: "provisioning",
      updatedAt: { lt: cutoff },
    },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  if (stuckInstances.length === 0) {
    return NextResponse.json({ ok: true, timedOut: 0 });
  }

  const results: string[] = [];

  for (const instance of stuckInstances) {
    try {
      // Mark as failed
      await prisma.aIInstance.update({
        where: { id: instance.id },
        data: {
          provisionStatus: "failed",
          status: "error",
          healthStatus: "down",
        },
      });

      // Log the failure
      await prisma.activityLog.create({
        data: {
          instanceId: instance.id,
          event: "config_changed",
          details: `Provisioning timed out after ${TIMEOUT_MINUTES} minutes — marked as failed. You can retry deployment.`,
        },
      });

      // Email the user so they know to retry
      if (instance.user?.email) {
        emailService
          .instanceProvisionFailed(
            instance.user.email,
            instance.user.name ?? instance.user.email,
            instance.name
          )
          .catch(console.error);
      }

      results.push(`✓ ${instance.id} (${instance.name})`);
      console.log(`[provision-timeout] Marked ${instance.id} ("${instance.name}") as failed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push(`✗ ${instance.id}: ${msg}`);
      console.error(`[provision-timeout] Failed to process ${instance.id}:`, err);
    }
  }

  return NextResponse.json({ ok: true, timedOut: stuckInstances.length, results });
}

export const GET = handler;
export const POST = handler;
