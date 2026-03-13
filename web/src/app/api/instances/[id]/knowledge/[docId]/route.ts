import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE — delete a document (chunks cascade via DB)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, docId } = await params;

  // Verify the instance belongs to this user
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify the doc belongs to this instance's knowledge base
  const doc = await prisma.knowledgeDoc.findFirst({
    where: {
      id: docId,
      knowledgeBase: { instanceId: id },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.knowledgeDoc.delete({ where: { id: docId } });

  return NextResponse.json({ ok: true });
}
