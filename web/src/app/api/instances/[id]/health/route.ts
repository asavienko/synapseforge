import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

/**
 * GET /api/instances/[id]/health
 *
 * Returns stored health history AND optionally performs a live VPS check.
 * Query params:
 *   ?live=true  — performs a live check against the VPS gateway before returning
 *
 * When called with ?live=true (or simply GET from the dashboard poller):
 *   - Calls POST <vpsUrl>/hooks/wake with the gateway token
 *   - Updates healthStatus + lastCheckedAt on the instance
 *   - Creates a HealthCheck record
 *   - Sends email alerts if status changed (down/recovered)
 *   - Returns { healthy, latencyMs, error? } plus history
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify user owns this instance (include manager for alerts)
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      name: true,
      healthStatus: true,
      lastCheckedAt: true,
      vpsUrl: true,
      gatewayToken: true,
      provisionStatus: true,
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

  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const previousStatus = instance.healthStatus;
  const live = req.nextUrl.searchParams.get("live") !== "false"; // live by default
  let liveResult: { healthy: boolean; latencyMs: number; error?: string } | null = null;

  // Perform live check if VPS is configured and we should check
  if (live && instance.vpsUrl && instance.gatewayToken) {
    const startMs = Date.now();
    try {
      const res = await fetch(`${instance.vpsUrl}/hooks/wake`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${instance.gatewayToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "health-check", mode: "next-heartbeat" }),
        signal: AbortSignal.timeout(10_000),
      });
      const latencyMs = Date.now() - startMs;
      const healthy = res.status !== 401 && res.status !== 503 && res.status !== 0;
      const errorMsg = healthy ? undefined : `Gateway returned HTTP ${res.status}`;

      liveResult = { healthy, latencyMs, error: errorMsg };

      // Persist result
      const newStatus = healthy ? "healthy" : "down";
      await prisma.$transaction([
        prisma.aIInstance.update({
          where: { id },
          data: {
            healthStatus: newStatus,
            lastCheckedAt: new Date(),
          },
        }),
        prisma.healthCheck.create({
          data: {
            instanceId: id,
            status: newStatus,
            responseMs: latencyMs,
            error: errorMsg ?? null,
          },
        }),
      ]);

      // Send alerts if status changed
      if (previousStatus && previousStatus !== newStatus) {
        await sendHealthAlerts(instance, previousStatus, newStatus, errorMsg);
      }

      // Refresh instance fields after update
      instance.healthStatus = newStatus;
      instance.lastCheckedAt = new Date();
    } catch (err) {
      const latencyMs = Date.now() - startMs;
      const errorMsg = err instanceof Error ? err.message : "Request failed";
      liveResult = { healthy: false, latencyMs, error: errorMsg };

      await prisma.$transaction([
        prisma.aIInstance.update({
          where: { id },
          data: { healthStatus: "down", lastCheckedAt: new Date() },
        }),
        prisma.healthCheck.create({
          data: {
            instanceId: id,
            status: "down",
            responseMs: latencyMs,
            error: errorMsg,
          },
        }),
      ]);

      // Send alert if transitioning to down
      if (previousStatus && previousStatus !== "down") {
        await sendHealthAlerts(instance, previousStatus, "down", errorMsg);
      }

      instance.healthStatus = "down";
      instance.lastCheckedAt = new Date();
    }
  }

  const checks = await prisma.healthCheck.findMany({
    where: { instanceId: id },
    orderBy: { checkedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    healthStatus: instance.healthStatus,
    lastCheckedAt: instance.lastCheckedAt?.toISOString() ?? null,
    vpsUrl: instance.vpsUrl,
    provisionStatus: instance.provisionStatus,
    liveCheck: liveResult,
    checks: checks.map((c) => ({
      id: c.id,
      status: c.status,
      responseMs: c.responseMs,
      error: c.error,
      checkedAt: c.checkedAt.toISOString(),
    })),
  });
}

/**
 * Send email and in-app notifications when instance health status changes
 */
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
