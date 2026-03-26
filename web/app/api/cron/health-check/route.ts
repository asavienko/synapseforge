import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes timeout

/**
 * GET /api/cron/health-check
 * 
 * Performs health checks on all instances with VPS configured.
 * Runs every 5 minutes via Vercel Cron.
 * Sends alerts when instances go down or recover.
 */
export async function GET(req: Request) {
  // Allow Vercel Cron invocations (x-vercel-cron: 1) OR explicit Bearer CRON_SECRET
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all instances with VPS configured
  const instances = await prisma.aIInstance.findMany({
    where: {
      vpsUrl: { not: null },
      gatewayToken: { not: null },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          manager: { select: { email: true, name: true } },
        },
      },
    },
  });

  const results = {
    checked: 0,
    healthy: 0,
    down: 0,
    errors: 0,
    alerted: 0,
  };

  for (const instance of instances) {
    if (!instance.vpsUrl || !instance.gatewayToken) continue;

    const previousStatus = instance.healthStatus;
    const startMs = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${instance.vpsUrl}/hooks/wake`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${instance.gatewayToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "health-check", mode: "next-heartbeat" }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const latencyMs = Date.now() - startMs;
      const healthy = res.status !== 401 && res.status !== 503 && res.status !== 0;
      const newStatus = healthy ? "healthy" : "down";

      results.checked++;
      if (healthy) results.healthy++;
      else results.down++;

      // Persist result
      await prisma.$transaction([
        prisma.aIInstance.update({
          where: { id: instance.id },
          data: {
            healthStatus: newStatus,
            lastCheckedAt: new Date(),
            consecutiveFailures: healthy ? 0 : { increment: 1 },
          },
        }),
        prisma.healthCheck.create({
          data: {
            instanceId: instance.id,
            status: newStatus,
            responseMs: latencyMs,
            error: healthy ? null : `Gateway returned HTTP ${res.status}`,
          },
        }),
      ]);

      // Send alerts only after 3 consecutive failures (or on recovery)
      const shouldAlert = 
        (newStatus === "down" && (instance.consecutiveFailures + 1) >= 3) ||
        (newStatus === "healthy" && previousStatus === "down");
      
      if (shouldAlert) {
        await sendHealthAlerts(instance, previousStatus, newStatus);
        results.alerted++;
      }
    } catch (err) {
      const latencyMs = Date.now() - startMs;
      const errorMsg = err instanceof Error ? err.message : "Request failed";

      results.checked++;
      results.down++;

      // Persist failure
      await prisma.$transaction([
        prisma.aIInstance.update({
          where: { id: instance.id },
          data: {
            healthStatus: "down",
            lastCheckedAt: new Date(),
            consecutiveFailures: { increment: 1 },
          },
        }),
        prisma.healthCheck.create({
          data: {
            instanceId: instance.id,
            status: "down",
            responseMs: latencyMs,
            error: errorMsg,
          },
        }),
      ]);

      // Send alert only after 3 consecutive failures
      if ((instance.consecutiveFailures + 1) >= 3) {
        await sendHealthAlerts(instance, previousStatus ?? "unknown", "down", errorMsg);
        results.alerted++;
      }
    }
  }

  return NextResponse.json({ ok: true, results });
}

async function sendHealthAlerts(
  instance: {
    id: string;
    name: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      manager: { email: string; name: string } | null;
    };
  },
  previousStatus: string,
  newStatus: string,
  errorDetail?: string
) {
  const userName = instance.user.name ?? "there";
  const userEmail = instance.user.email;
  const manager = instance.user.manager;

  // In-app notification for client
  await createNotification({
    userId: instance.user.id,
    type: newStatus === "down" ? "instance.down" : "instance.recovered",
    title: newStatus === "down" 
      ? `🔴 "${instance.name}" is down` 
      : `✅ "${instance.name}" recovered`,
    body: newStatus === "down"
      ? `Your AI agent failed its health check and appears to be unreachable.`
      : `Your AI agent is back online and responding normally.`,
    href: `/dashboard/instances/${instance.id}`,
  }).catch(console.error);

  // Email client
  if (newStatus === "down") {
    await email.instanceDown(
      userEmail,
      userName,
      instance.name,
      instance.id,
      errorDetail
    ).catch(console.error);
  } else if (newStatus === "healthy" && previousStatus === "down") {
    await email.instanceRecovered(
      userEmail,
      userName,
      instance.name,
      instance.id
    ).catch(console.error);
  }

  // Notify manager if assigned
  if (manager) {
    await email.managerInstanceAlert(
      manager.email,
      manager.name,
      userName,
      userEmail,
      instance.name,
      instance.id,
      newStatus as "down" | "recovered" | "degraded",
      errorDetail
    ).catch(console.error);
  }
}
