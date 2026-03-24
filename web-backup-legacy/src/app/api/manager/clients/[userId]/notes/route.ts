import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

async function getManagerForSession(sessionUserId: string) {
  return prisma.manager.findUnique({ where: { id: sessionUserId } });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const manager = await getManagerForSession(session.user.id);
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const notes = await prisma.clientNote.findMany({
    where: { managerId: manager.id, userId },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const manager = await getManagerForSession(session.user.id);
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

  const note = await prisma.clientNote.create({
    data: { managerId: manager.id, userId, content: content.trim() },
  });

  return NextResponse.json(note);
}
