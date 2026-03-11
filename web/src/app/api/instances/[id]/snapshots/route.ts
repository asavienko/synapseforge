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
    select: { id: true, lastBackupAt: true },
  });

  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const snapshots = await prisma.snapshot.findMany({
    where: { instanceId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    lastBackupAt: instance.lastBackupAt?.toISOString() ?? null,
    snapshots: snapshots.map((s) => ({
      id: s.id,
      snapshotId: s.snapshotId,
      sizeBytes: s.sizeBytes,
      healthy: s.healthy,
      createdAt: s.createdAt.toISOString(),
    })),
  });
}
