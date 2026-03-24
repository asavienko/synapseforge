import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mark sync as requested
  await prisma.aIInstance.update({
    where: { id },
    data: { syncRequested: true },
  });

  // Log the event
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "config_changed",
      details: "Config sync requested by user",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Your manager has been notified to sync your configuration",
  });
}
