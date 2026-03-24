// POST { snapshotId: "...", type: "restic" }
// Queues pre-rollback snapshot + rollback command
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { queueCommand } from "@/lib/command-queue";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const manager = await prisma.manager.findUnique({ where: { id: session.user.id } });
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, user: { manager: { id: manager.id } } },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { snapshotId } = await req.json();
  if (!snapshotId) return NextResponse.json({ error: "snapshotId required" }, { status: 400 });

  // Queue pre-rollback snapshot first for safety
  await queueCommand(id, "take_restic_snapshot", {}, `manager:${manager.id}`, "pre-rollback");
  await queueCommand(
    id,
    "rollback_restic",
    { snapshotId },
    `manager:${manager.id}`,
    "Rollback to snapshot"
  );

  return NextResponse.json({ ok: true });
}
