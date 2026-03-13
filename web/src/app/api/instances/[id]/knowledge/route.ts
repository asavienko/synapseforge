import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET — list documents in knowledge base for this instance
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: {
      knowledgeBase: {
        include: { documents: { orderBy: { createdAt: "desc" } } },
      },
    },
  });
  if (!instance)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    documents: instance.knowledgeBase?.documents ?? [],
    knowledgeBaseId: instance.knowledgeBase?.id ?? null,
  });
}
