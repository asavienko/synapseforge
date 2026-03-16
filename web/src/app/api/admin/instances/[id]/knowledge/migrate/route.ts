import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { migrateEmbeddings } from "@/lib/migrate-embeddings";

/**
 * POST /api/admin/instances/[id]/knowledge/migrate
 * Migrates knowledge embeddings from JSON to pgvector.
 * Runs synchronously and returns when complete.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify instance belongs to user
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  try {
    const result = await migrateEmbeddings();
    return NextResponse.json({ ok: true, status: "completed", result });
  } catch (error) {
    console.error("[migration] failed:", error);
    return NextResponse.json({
      error: "Migration failed",
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
