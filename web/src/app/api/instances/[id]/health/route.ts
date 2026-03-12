import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
 *   - Returns { healthy, latencyMs, error? } plus history
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify user owns this instance
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      healthStatus: true,
      lastCheckedAt: true,
      vpsUrl: true,
      gatewayToken: true,
      provisionStatus: true,
    },
  });

  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    // live result (null when no vpsUrl or live=false)
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
