import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/instances/[id]/restart
 *
 * Sends a restart/wake signal to the VPS gateway so it re-fetches config.
 * The VPS-side sync script pulls latest config from /api/internal/instance-config
 * on each Docker container restart.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!instance.vpsUrl) {
    return NextResponse.json({ error: "No VPS configured for this instance" }, { status: 400 });
  }

  // Mark configSynced optimistically — the VPS will pull fresh config on restart
  await prisma.aIInstance.update({ where: { id }, data: { configSynced: true } });

  // Send restart signal to gateway
  try {
    const res = await fetch(`${instance.vpsUrl}/hooks/restart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${instance.gatewayToken ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "config_sync" }),
      signal: AbortSignal.timeout(10000),
    });

    const ok = res.status < 500;

    await prisma.activityLog.create({
      data: {
        instanceId: id,
        event: "config_changed",
        details: `Config sync triggered (gateway ${ok ? "acknowledged" : `status ${res.status}`})`,
      },
    });

    return NextResponse.json({ ok: true, gatewayStatus: res.status });
  } catch (err) {
    // Gateway unreachable — still mark synced in DB, VPS will pick up on next poll
    await prisma.activityLog.create({
      data: {
        instanceId: id,
        event: "config_changed",
        details: `Config sync queued (gateway unreachable: ${err instanceof Error ? err.message : String(err)})`,
      },
    });

    return NextResponse.json({ ok: true, queued: true, note: "Config will sync on next VPS poll" });
  }
}
