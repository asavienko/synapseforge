import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getManagerForSession(sessionUserId: string) {
  return prisma.manager.findUnique({ where: { id: sessionUserId } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; noteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const manager = await getManagerForSession(session.user.id);
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { noteId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  const existing = await prisma.clientNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.managerId !== manager.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.clientNote.update({
    where: { id: noteId },
    data: { content: content.trim() },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; noteId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const manager = await getManagerForSession(session.user.id);
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { noteId } = await params;
  const existing = await prisma.clientNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.managerId !== manager.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.clientNote.delete({ where: { id: noteId } });

  return NextResponse.json({ ok: true });
}
