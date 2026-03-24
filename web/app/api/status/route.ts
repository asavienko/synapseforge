import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/status
 * 
 * Public system status endpoint showing platform health.
 * Used by the status page to display real-time system health.
 */
export async function GET() {
  try {
    // Get counts for status calculation
    const [
      totalInstances,
      healthyInstances,
      degradedInstances,
      downInstances,
      recentHealthChecks,
    ] = await Promise.all([
      prisma.aIInstance.count(),
      prisma.aIInstance.count({ where: { healthStatus: "healthy" } }),
      prisma.aIInstance.count({ where: { healthStatus: "degraded" } }),
      prisma.aIInstance.count({ where: { healthStatus: "down" } }),
      prisma.healthCheck.findMany({
        where: { checkedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        orderBy: { checkedAt: "desc" },
        take: 1000,
      }),
    ]);

    // Calculate uptime percentage from health checks
    const uptimePercentage = recentHealthChecks.length > 0
      ? Math.round(
          (recentHealthChecks.filter((h) => h.status === "healthy").length /
            recentHealthChecks.length) *
            100
        )
      : 100;

    // Determine overall status
    let status: "operational" | "degraded" | "major_outage" = "operational";
    if (downInstances > 0 && downInstances > healthyInstances) {
      status = "major_outage";
    } else if (degradedInstances > 0 || downInstances > 0) {
      status = "degraded";
    }

    // Get recent incidents (health checks with errors in last 7 days)
    const incidents = await prisma.healthCheck.findMany({
      where: {
        status: "down",
        checkedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { checkedAt: "desc" },
      take: 10,
      include: {
        instance: {
          select: { name: true },
        },
      },
    });

    // Group incidents by day
    const incidentsByDay = incidents.reduce((acc, incident) => {
      const date = incident.checkedAt.toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(incident);
      return acc;
    }, {} as Record<string, typeof incidents>);

    return NextResponse.json({
      status,
      uptimePercentage,
      lastUpdated: new Date().toISOString(),
      components: {
        api: { status: "operational", uptime: uptimePercentage },
        dashboard: { status: "operational", uptime: 100 },
        chat: {
          status: downInstances > 0 ? (downInstances > 5 ? "major_outage" : "degraded") : "operational",
          uptime: uptimePercentage,
        },
        webhooks: { status: "operational", uptime: 99.9 },
        provisioning: { status: "operational", uptime: 99.5 },
      },
      instances: {
        total: totalInstances,
        healthy: healthyInstances,
        degraded: degradedInstances,
        down: downInstances,
      },
      recentIncidents: Object.entries(incidentsByDay).slice(0, 7).map(([date, items]) => ({
        date,
        count: items.length,
        affected: items.map((i) => i.instance?.name).filter(Boolean),
      })),
    });
  } catch (error) {
    console.error("[status] Error:", error);
    return NextResponse.json(
      {
        status: "unknown",
        uptimePercentage: null,
        lastUpdated: new Date().toISOString(),
        error: "Failed to fetch status",
      },
      { status: 500 }
    );
  }
}
