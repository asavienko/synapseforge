import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  // Internal API key auth
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey || token !== internalKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { instanceId } = await params;

  // Fetch instance and latest health check
  const [instance, latestCheck] = await Promise.all([
    prisma.aIInstance.findUnique({
      where: { id: instanceId },
      select: {
        healthStatus: true,
        lastCheckedAt: true,
        provisionStatus: true,
        status: true,
        vpsUrl: true,
        currentVersion: true,
      },
    }),
    prisma.healthCheck.findFirst({
      where: { instanceId },
      orderBy: { checkedAt: "desc" },
      select: {
        status: true,
        responseMs: true,
        error: true,
        checkedAt: true,
      },
    }),
  ]);

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  return NextResponse.json({
    healthStatus: instance.healthStatus,
    lastCheckedAt: instance.lastCheckedAt,
    provisionStatus: instance.provisionStatus,
    status: instance.status,
    vpsUrl: instance.vpsUrl,
    currentVersion: instance.currentVersion,
    latestCheck: latestCheck
      ? {
          status: latestCheck.status,
          responseMs: latestCheck.responseMs,
          error: latestCheck.error,
          checkedAt: latestCheck.checkedAt,
        }
      : null,
  });
}