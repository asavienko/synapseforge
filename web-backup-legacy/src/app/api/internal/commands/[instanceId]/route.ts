import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  // Authenticate via gateway token (same as other /api/internal routes)
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { instanceId } = await params;

  // Verify token belongs to this instance
  const instance = await prisma.aIInstance.findFirst({
    where: { id: instanceId, gatewayToken: token },
  });
  if (!instance) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get next pending command
  const command = await prisma.instanceCommand.findFirst({
    where: { instanceId, status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  if (!command) {
    return NextResponse.json({ command: null });
  }

  return NextResponse.json({
    command: {
      id: command.id,
      type: command.type,
      payload: command.payload ? JSON.parse(command.payload) : null,
      note: command.note,
    },
  });
}
