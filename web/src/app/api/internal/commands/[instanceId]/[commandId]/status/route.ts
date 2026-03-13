import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string; commandId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const { instanceId, commandId } = await params;

  const instance = await prisma.aIInstance.findFirst({
    where: { id: instanceId, gatewayToken: token },
  });
  if (!instance) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, errorMsg } = await req.json();
  const validStatuses = ["running", "done", "failed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.instanceCommand.update({
    where: { id: commandId },
    data: {
      status,
      errorMsg: errorMsg ?? null,
      startedAt: status === "running" ? new Date() : undefined,
      completedAt: ["done", "failed"].includes(status) ? new Date() : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
