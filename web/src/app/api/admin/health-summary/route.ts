import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Internal API key auth
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey || token !== internalKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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