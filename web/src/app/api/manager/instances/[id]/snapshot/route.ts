// POST — queue a manual Restic snapshot
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

  await queueCommand(id, "take_restic_snapshot", {}, `manager:${manager.id}`, "manual");

  return NextResponse.json({ ok: true });
}
