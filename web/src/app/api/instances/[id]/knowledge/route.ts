import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getKnowledgeBaseStorage } from "@/lib/knowledge";
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
  
  // Get instance with user plan
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: { 
      user: { select: { plan: true } },
      knowledgeBase: {
        include: { 
          documents: { 
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              filename: true,
              fileSize: true,
              type: true,
              status: true,
              chunkCount: true,
              createdAt: true,
              updatedAt: true,
            }
          } 
        },
      },
    },
  });
  
  if (!instance)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get storage usage
  const storage = await getKnowledgeBaseStorage(id);
  
  // Calculate storage limits
  const maxTotalBytes = instance.user.plan === 'free' 
    ? 50 * 1024 * 1024 
    : 100 * 1024 * 1024;

  return NextResponse.json({
    documents: instance.knowledgeBase?.documents ?? [],
    knowledgeBaseId: instance.knowledgeBase?.id ?? null,
    storage: {
      used: storage.totalBytes,
      limit: maxTotalBytes,
      percentage: Math.round((storage.totalBytes / maxTotalBytes) * 100),
    },
  });
}
