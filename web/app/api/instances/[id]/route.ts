import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Live health check for instances with VPS configured
  let liveHealthStatus = instance.healthStatus;
  let liveLastCheckedAt = instance.lastCheckedAt;
  
  if (instance.vpsUrl && instance.gatewayToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch(`${instance.vpsUrl}/hooks/wake`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${instance.gatewayToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "health-check", mode: "next-heartbeat" }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      const healthy = res.status !== 401 && res.status !== 503 && res.status !== 0;
      liveHealthStatus = healthy ? "healthy" : "down";
      liveLastCheckedAt = new Date();
      
      // Update DB if status changed (fire-and-forget)
      if (instance.healthStatus !== liveHealthStatus) {
        prisma.aIInstance.update({
          where: { id: instance.id },
          data: { healthStatus: liveHealthStatus, lastCheckedAt: liveLastCheckedAt },
        }).catch(() => {});
      }
    } catch {
      // Gateway unreachable - mark as down if not checked recently
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (!instance.lastCheckedAt || instance.lastCheckedAt < fiveMinutesAgo) {
        liveHealthStatus = "down";
        liveLastCheckedAt = new Date();
        prisma.aIInstance.update({
          where: { id: instance.id },
          data: { healthStatus: "down", lastCheckedAt: liveLastCheckedAt },
        }).catch(() => {});
      }
    }
  }

  // Return instance but never expose gatewayToken; expose hasGateway flag
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gatewayToken: _token, vpsUrl: _vps, sshPrivateKey: _ssh, ...safeInstance } = instance;
  return NextResponse.json({ 
    ...safeInstance, 
    hasGateway: !!instance.vpsUrl,
    healthStatus: liveHealthStatus,
    lastCheckedAt: liveLastCheckedAt?.toISOString(),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  const logEvents: { event: string; details?: string }[] = [];

  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.autoUpdate !== undefined) data.autoUpdate = Boolean(body.autoUpdate);

  if (body.status !== undefined && body.status !== instance.status) {
    const newStatus = body.status as string;

    // Check plan allows running this many instances
    if (newStatus === "running") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
      });
      const plan = PLANS[(user?.plan ?? "free") as keyof typeof PLANS] ?? PLANS.free;
      if (plan.instances !== -1) {
        const runningCount = await prisma.aIInstance.count({
          where: { userId: session.user.id, status: "running", id: { not: id } },
        });
        if (runningCount >= plan.instances) {
          return NextResponse.json(
            { error: `Your ${user?.plan ?? "free"} plan allows ${plan.instances} running instance${plan.instances !== 1 ? "s" : ""}. Stop another instance first or upgrade your plan.` },
            { status: 403 }
          );
        }
      }
    }

    // Create command for start/stop operations
    if ((newStatus === "running" || newStatus === "stopped") && instance.vpsUrl && instance.gatewayToken) {
      const commandType = newStatus === "running" ? "start" : "stop";
      
      // Check if there's already a pending start/stop command
      const existingPending = await prisma.instanceCommand.findFirst({
        where: { 
          instanceId: id, 
          type: { in: ["start", "stop"] },
          status: "pending" 
        },
      });
      
      if (existingPending) {
        return NextResponse.json(
          { error: `A ${existingPending.type} command is already pending` },
          { status: 409 }
        );
      }

      // Create the command
      const command = await prisma.instanceCommand.create({
        data: {
          instanceId: id,
          type: commandType,
          status: "pending",
          payload: JSON.stringify({ requestedBy: session.user.id }),
          requestedBy: session.user.id,
        },
      });

      // For start commands, try to wake the gateway with a short timeout
      if (newStatus === "running") {
        const startMs = Date.now();
        try {
          const res = await fetch(`${instance.vpsUrl}/hooks/wake`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${instance.gatewayToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: "ping", mode: "next-heartbeat" }),
            signal: AbortSignal.timeout(8000),
          });

          if (res.status === 401) {
            // Mark command as failed
            await prisma.instanceCommand.update({
              where: { id: command.id },
              data: { status: "failed", errorMsg: "Invalid gateway token", completedAt: new Date() },
            });
            return NextResponse.json(
              { error: "Invalid gateway token. Contact your manager.", gatewayError: true },
              { status: 503 }
            );
          }

          // Success — record health check and update command to running
          const responseMs = Date.now() - startMs;
          await prisma.healthCheck.create({
            data: { instanceId: id, status: "healthy", responseMs, error: null },
          });
          await prisma.aIInstance.update({
            where: { id },
            data: { healthStatus: "healthy", lastCheckedAt: new Date() },
          });
          await prisma.instanceCommand.update({
            where: { id: command.id },
            data: { status: "running", startedAt: new Date() },
          });
        } catch {
          // Gateway unreachable — mark command as failed
          await prisma.instanceCommand.update({
            where: { id: command.id },
            data: { status: "failed", errorMsg: "Gateway unreachable", completedAt: new Date() },
          });
          return NextResponse.json(
            { error: "Gateway unreachable. Check VPS is running.", gatewayError: true },
            { status: 503 }
          );
        }
      }

      // For stop commands, we just create the command - VPS will poll and execute
      // Update status in DB
      data.status = newStatus;
      logEvents.push({ event: newStatus === "running" ? "started" : "stopped", details: `Command ${command.id} created` });
    } else {
      // No VPS configured — just update the status directly
      data.status = newStatus;
      logEvents.push({ event: newStatus === "running" ? "started" : "stopped" });
    }
  }

  if (body.config !== undefined) {
    data.config = typeof body.config === "string" ? body.config : JSON.stringify(body.config);
    logEvents.push({ event: "config_changed", details: "Configuration updated" });
  }

  const updated = await prisma.aIInstance.update({ where: { id }, data });

  if (logEvents.length > 0) {
    await prisma.activityLog.createMany({
      data: logEvents.map((e) => ({ ...e, instanceId: id })),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gatewayToken: _token, vpsUrl: _vps, ...safeUpdated } = updated;
  return NextResponse.json({ ...safeUpdated, hasGateway: !!updated.vpsUrl });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true, vpsServerId: true, vpsProvider: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Decommission VPS before removing DB record ────────────────────────────
  // If we skip this, the Hetzner server keeps running and charges accumulate.
  let vpsNote = "no VPS to decommission";
  if (instance.vpsServerId && instance.vpsProvider === "hetzner") {
    const hetznerKey = process.env.HETZNER_API_KEY;
    if (hetznerKey) {
      try {
        const res = await fetch(
          `https://api.hetzner.cloud/v1/servers/${instance.vpsServerId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${hetznerKey}` },
            signal: AbortSignal.timeout(15000),
          }
        );
        if (res.ok || res.status === 404) {
          // 200/204 = deleted; 404 = already gone — both are fine
          vpsNote = `Hetzner server ${instance.vpsServerId} decommissioned (HTTP ${res.status})`;
        } else {
          // Non-fatal: log and continue — better to orphan the DB record than block deletion
          const errText = await res.text().catch(() => "");
          vpsNote = `Hetzner DELETE returned ${res.status}: ${errText.slice(0, 120)}`;
          console.error(`[delete-instance] ${vpsNote}`);
        }
      } catch (err) {
        // Network failure: log but don't block the user
        vpsNote = `Hetzner DELETE failed: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[delete-instance] ${vpsNote}`);
      }
    } else {
      vpsNote = `vpsServerId=${instance.vpsServerId} but HETZNER_API_KEY not set — VPS NOT decommissioned`;
      console.warn(`[delete-instance] ${vpsNote}`);
    }
  }

  // Log the decommission before deleting (cascade will remove logs too, but
  // this gives a brief window for audit if delete is rolled back)
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "deleted",
      details: `Instance "${instance.name}" deleted. ${vpsNote}`,
    },
  }).catch(() => {
    // If cascade already removed logs table entries that's fine — best effort
  });

  await prisma.aIInstance.delete({ where: { id } });
  return NextResponse.json({ ok: true, vpsNote });
}
