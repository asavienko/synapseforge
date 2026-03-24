import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Validate API key
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey || token !== internalKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { instanceId, snapshotId, sizeBytes, healthy } = body as {
    instanceId: string;
    snapshotId: string;
    sizeBytes?: number;
    healthy?: boolean;
  };

  if (!instanceId || !snapshotId) {
    return NextResponse.json({ error: "instanceId and snapshotId are required" }, { status: 400 });
  }

  // Create Snapshot record
  await prisma.snapshot.create({
    data: {
      instanceId,
      snapshotId,
      sizeBytes: sizeBytes ?? null,
      healthy: healthy ?? true,
    },
  });

  // Update AIInstance lastBackupAt
  await prisma.aIInstance.update({
    where: { id: instanceId },
    data: { lastBackupAt: new Date() },
  });

  // Keep only last 50 snapshots per instance
  const snapshots = await prisma.snapshot.findMany({
    where: { instanceId },
    orderBy: { createdAt: "desc" },
    skip: 50,
    select: { id: true },
  });

  if (snapshots.length > 0) {
    await prisma.snapshot.deleteMany({
      where: { id: { in: snapshots.map((s) => s.id) } },
    });
  }

  return NextResponse.json({ ok: true });
}
