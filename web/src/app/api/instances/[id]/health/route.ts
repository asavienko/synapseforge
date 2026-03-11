import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify user owns this instance
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, healthStatus: true, lastCheckedAt: true, vpsUrl: true },
  });

  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const checks = await prisma.healthCheck.findMany({
    where: { instanceId: id },
    orderBy: { checkedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    healthStatus: instance.healthStatus,
    lastCheckedAt: instance.lastCheckedAt?.toISOString() ?? null,
    vpsUrl: instance.vpsUrl,
    checks: checks.map((c) => ({
      id: c.id,
      status: c.status,
      responseMs: c.responseMs,
      error: c.error,
      checkedAt: c.checkedAt.toISOString(),
    })),
  });
}
