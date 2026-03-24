// POST — client requests rollback, sends message to manager
// Does NOT queue command directly — creates a manager message instead
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: { user: { select: { managerId: true } } },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const managerId = instance.user.managerId;
  if (!managerId) return NextResponse.json({ error: "No manager assigned" }, { status: 400 });

  const { snapshotId, reason } = await req.json();
  const body = snapshotId
    ? `Rollback request for instance "${instance.name}" (${id}) to snapshot ${snapshotId}.${reason ? ` Reason: ${reason}` : ""}`
    : `Rollback request for instance "${instance.name}" (${id}).${reason ? ` Reason: ${reason}` : ""}`;

  await prisma.message.create({
    data: {
      body,
      senderType: "user",
      userId: session.user.id,
      managerId,
    },
  });

  return NextResponse.json({ ok: true });
}
