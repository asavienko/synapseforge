import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";

/**
 * POST /api/internal/provision-complete/[instanceId]
 *
 * Called by the VPS cloud-init script once OpenClaw is confirmed healthy.
 * Authenticated by the instance's gateway token.
 *
 * Body (all optional):
 *   { openclaw_version?: string; ip?: string }
 *
 * On success: marks instance as provisionStatus="ready", status="running",
 * records an ActivityLog entry.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const token = authHeader.slice(7);

  const { instanceId } = await params;

  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
  });

  if (!instance) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Auth: must match the gateway token
  if (!instance.gatewayToken || instance.gatewayToken !== token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: { openclaw_version?: string; ip?: string } = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const details = [
    body.openclaw_version ? `version=${body.openclaw_version}` : null,
    body.ip ? `ip=${body.ip}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  // Update vpsUrl with the reported IP if we don't have one yet
  const updateData: Record<string, unknown> = {
    provisionStatus: "ready",
    status: "running",
  };
  if (body.ip && !instance.vpsUrl) {
    updateData.vpsUrl = `http://${body.ip}:18789`;
  }

  await prisma.$transaction([
    prisma.aIInstance.update({
      where: { id: instanceId },
      data: updateData,
    }),
    prisma.activityLog.create({
      data: {
        instanceId,
        event: "provision_complete",
        details: details || "VPS provisioning completed successfully",
      },
    }),
  ]);

  // Notify client and manager that the instance is live
  const fullInstance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          manager: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (fullInstance?.user) {
    // Email the client — channels array is empty at provision time
    email
      .instanceReady(
        fullInstance.user.email,
        fullInstance.user.name ?? "there",
        fullInstance.name,
        [] // no channels connected yet; user will add them from the dashboard
      )
      .catch(console.error);

    // Email the manager if one is assigned
    if (fullInstance.user.manager) {
      email
        .managerInstanceAlert(
          fullInstance.user.manager.email,
          fullInstance.user.manager.name,
          fullInstance.user.name ?? fullInstance.user.email,
          fullInstance.user.email,
          fullInstance.name,
          instanceId,
          "recovered" // closest available status for "newly provisioned and ready"
        )
        .catch(console.error);
    }
  }

  return NextResponse.json({ ok: true });
}
