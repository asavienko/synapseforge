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

  const command = await prisma.instanceCommand.update({
    where: { id: commandId },
    data: {
      status,
      errorMsg: errorMsg ?? null,
      startedAt: status === "running" ? new Date() : undefined,
      completedAt: ["done", "failed"].includes(status) ? new Date() : undefined,
    },
  });

  // Create in-app notification when a version update completes
  if (command.type === "update_version" && status === "done") {
    const fullInstance = await prisma.aIInstance.findUnique({
      where: { id: instanceId },
      select: { userId: true, name: true },
    });
    if (fullInstance?.userId) {
      let targetVersion: string | undefined;
      try {
        const payload = command.payload ? JSON.parse(command.payload as string) : null;
        targetVersion = payload?.tag ?? payload?.targetVersion;
      } catch {
        // ignore parse errors
      }
      await prisma.notification.create({
        data: {
          userId: fullInstance.userId,
          title: "Agent updated",
          body: `${fullInstance.name} was updated to ${targetVersion ?? "new version"}`,
          type: "info",
          href: `/dashboard/instances/${instanceId}?tab=infrastructure`,
        },
      }).catch(console.error);
    }
  }

  return NextResponse.json({ ok: true });
}
