import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueCommand } from "@/lib/command-queue";
import { auth } from "@/lib/auth";

function isAdmin(email: string | null | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  return !!email && adminEmails.includes(email);
}

/**
 * POST /api/admin/instances/[id]/restic-rollback
 * 
 * Triggers a Restic rollback for an instance.
 * Admin-only endpoint.
 * 
 * Body: {
 *   snapshotId?: string;  // Specific snapshot to restore (optional, defaults to latest)
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Verify instance exists and has VPS
  const instance = await prisma.aIInstance.findUnique({
    where: { id },
    select: { 
      id: true, 
      name: true, 
      vpsUrl: true,
      user: { select: { email: true, name: true } }
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  if (!instance.vpsUrl) {
    return NextResponse.json(
      { error: "Instance has no VPS configured" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { snapshotId } = body;

    // Queue rollback command
    await queueCommand(
      id,
      "rollback_restic",
      { 
        snapshotId: snapshotId ?? null,
        adminTriggered: true,
        timestamp: new Date().toISOString()
      },
      "system",
      `Admin-triggered rollback${snapshotId ? ` to ${snapshotId}` : " to latest snapshot"}`
    );

    return NextResponse.json({
      ok: true,
      message: `Rollback queued for instance ${instance.name}`,
      instanceId: id,
    });
  } catch (error) {
    console.error("[admin/restic-rollback] Error:", error);
    return NextResponse.json(
      { error: "Failed to queue rollback" },
      { status: 500 }
    );
  }
}