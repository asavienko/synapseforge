import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Internal auth middleware
import { internalAuth } from "@/lib/internal-auth";

export async function GET(req: NextRequest) {
  // Require internal API key for manager access
  const authResult = internalAuth(req);
  if (authResult !== null) {
    return authResult;
  }

  const allInstances = await prisma.aIInstance.findMany({
    select: {
      id: true,
      name: true,
      healthStatus: true,
      lastCheckedAt: true,
      vpsUrl: true,
      user: { select: { email: true } },
    },
  });

  const healthSummary = {
    monitored: allInstances.filter((i) => i.vpsUrl).length,
    healthy: allInstances.filter((i) => i.healthStatus === "healthy").length,
    degraded: allInstances.filter((i) => i.healthStatus === "degraded").length,
    down: allInstances.filter((i) => i.healthStatus === "down").length,
    unknown: allInstances.filter((i) => !i.healthStatus).length,
    issues: allInstances
      .filter((i) => i.healthStatus === "down" || i.healthStatus === "degraded")
      .map((i) => ({
        id: i.id,
        name: i.name,
        healthStatus: i.healthStatus!,
        lastCheckedAt: i.lastCheckedAt?.toISOString() ?? null,
        userEmail: i.user.email,
      })),
  };

  return NextResponse.json(healthSummary);
}