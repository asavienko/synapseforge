import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify manager access
  const manager = await prisma.manager.findFirst({
    where: { users: { some: { instances: { some: { id } } } } },
    select: { id: true },
  });
  if (!manager) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { instanceId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(messages.reverse());
}
