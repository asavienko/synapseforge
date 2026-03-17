import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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