import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/status
 * 
 * Public status endpoint for the status page.
 * Returns system health, instance stats, and recent incidents.
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    const dbHealth = await prisma.$queryRaw`SELECT 1 as health`
      .then(() => ({ status: "operational", latencyMs: Date.now() - startTime }))
      .catch((err) => ({ status: "down", error: err.message, latencyMs: null }));

    // Get instance health stats (last 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      totalInstances,
      runningInstances,
      healthyInstances,
      recentHealthChecks,
      recentIncidents,
    ] = await Promise.all([
      prisma.aIInstance.count(),
      prisma.aIInstance.count({ where: { status: "running" } }),
      prisma.aIInstance.count({ where: { healthStatus: "healthy" } }),
      prisma.healthCheck.findMany({
        where: { checkedAt: { gte: twentyFourHoursAgo } },
        orderBy: { checkedAt: "desc" },
        take: 100,
        select: { status: true, checkedAt: true },
      }).catch(() => []),
      prisma.activityLog.findMany({
        where: {
          event: { in: ["error", "provision_failed", "health_check_failed"] },
          createdAt: { gte: twentyFourHoursAgo },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { event: true, details: true, createdAt: true, instanceId: true },
      }).catch(() => []),
    ]);

    // Calculate uptime percentage from health checks
    const uptimePercentage = recentHealthChecks.length > 0
      ? Math.round((recentHealthChecks.filter(h => h.status === "healthy").length / recentHealthChecks.length) * 100)
      : 100;

    // Determine overall status
    let overallStatus: "operational" | "degraded" | "down" = "operational";
    if (dbHealth.status !== "operational") {
      overallStatus = "down";
    } else if (uptimePercentage < 95) {
      overallStatus = "degraded";
    }

    return NextResponse.json({
      status: "ok",
      overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        api: { status: "operational", latencyMs: Date.now() - startTime },
        database: dbHealth,
      },
      stats: {
        totalInstances,
        runningInstances,
        healthyInstances,
        uptimePercentage,
      },
      incidents: recentIncidents.map(i => ({
        id: i.instanceId || "system",
        type: i.event,
        description: i.details,
        timestamp: i.createdAt.toISOString(),
      })),
    }, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[status] Error fetching status:", error);
    
    return NextResponse.json({
      status: "error",
      overallStatus: "down",
      timestamp: new Date().toISOString(),
      services: {
        api: { status: "operational", latencyMs: Date.now() - startTime },
        database: { status: "down", error: "Connection failed" },
      },
      stats: {
        totalInstances: 0,
        runningInstances: 0,
        healthyInstances: 0,
        uptimePercentage: 0,
      },
      incidents: [{
        id: "system",
        type: "status_check_failed",
        description: "Unable to fetch system status",
        timestamp: new Date().toISOString(),
      }],
    }, { status: 500 });
  }
}
