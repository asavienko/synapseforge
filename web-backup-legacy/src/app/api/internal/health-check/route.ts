import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Validate API key
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey || token !== internalKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { instanceId, status, responseMs, error } = body as {
    instanceId: string;
    status: "healthy" | "degraded" | "down";
    responseMs?: number;
    error?: string;
  };

  if (!instanceId || !status) {
    return NextResponse.json({ error: "instanceId and status are required" }, { status: 400 });
  }

  // Fetch current instance state — we need healthStatus to detect transitions
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: {
      provisionStatus: true,
      status: true,
      healthStatus: true,
      lastCheckedAt: true,
      name: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          manager: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404 });
  }

  // Create HealthCheck record
  await prisma.healthCheck.create({
    data: {
      instanceId,
      status,
      responseMs: responseMs ?? null,
      error: error ?? null,
    },
  });

  // ── Transition detection ──────────────────────────────────────────────────
  const prevStatus = instance.healthStatus;     // e.g. "healthy", "down", null
  const statusChanged = prevStatus !== status;

  // First health check after provisioning → go live
  const justWentLive = instance.provisionStatus === "provisioning" && status === "healthy";

  // Went from healthy/null → down (first outage or new outage)
  const justWentDown =
    !justWentLive &&
    status === "down" &&
    (prevStatus === "healthy" || prevStatus === "degraded" || prevStatus == null);

  // Went from healthy/null → degraded
  const justWentDegraded =
    !justWentLive &&
    status === "degraded" &&
    prevStatus === "healthy";

  // Recovered from down/degraded → healthy
  const justRecovered =
    !justWentLive &&
    status === "healthy" &&
    (prevStatus === "down" || prevStatus === "degraded");

  // ── Update instance record ────────────────────────────────────────────────
  const updates: Record<string, unknown> = {
    healthStatus: status,
    lastCheckedAt: new Date(),
  };

  if (justWentLive) {
    updates.provisionStatus = "ready";
    updates.status = "running";
  }

  await prisma.aIInstance.update({ where: { id: instanceId }, data: updates });

  // ── Activity log for status changes ──────────────────────────────────────
  const logEntries: { event: string; details: string }[] = [];

  if (justWentLive) {
    logEntries.push({ event: "started", details: "Instance went live after provisioning." });
  } else if (justWentDown) {
    logEntries.push({
      event: "config_changed",
      details: `Health status changed: ${prevStatus ?? "unknown"} → down${error ? ` — ${error}` : ""}`,
    });
  } else if (justWentDegraded) {
    logEntries.push({
      event: "config_changed",
      details: `Health status changed: healthy → degraded${responseMs != null ? ` (${responseMs}ms)` : ""}`,
    });
  } else if (justRecovered) {
    // Estimate downtime in minutes from lastCheckedAt
    const downtimeMs = instance.lastCheckedAt
      ? Date.now() - new Date(instance.lastCheckedAt).getTime()
      : 0;
    const downtimeMinutes = Math.round(downtimeMs / 60_000);
    logEntries.push({
      event: "started",
      details: `Health recovered: ${prevStatus} → healthy${downtimeMinutes > 0 ? ` (was down ~${downtimeMinutes}m)` : ""}`,
    });
  } else if (statusChanged) {
    // Any other status change
    logEntries.push({
      event: "config_changed",
      details: `Health status changed: ${prevStatus ?? "unknown"} → ${status}`,
    });
  }

  if (logEntries.length > 0) {
    await prisma.activityLog.createMany({
      data: logEntries.map((e) => ({ ...e, instanceId })),
    });
  }

  // ── Email alerts ──────────────────────────────────────────────────────────
  const userEmail = instance.user?.email;
  const userName = instance.user?.name ?? userEmail ?? "there";
  const instanceName = instance.name;
  const manager = instance.user?.manager;

  if (userEmail) {
    if (justWentLive) {
      // "Instance is live" email — fetch credentials for channel list
      const fullInstance = await prisma.aIInstance.findUnique({
        where: { id: instanceId },
        include: { credentials: { select: { key: true } } },
      });
      const channels: string[] = [];
      const credKeys = fullInstance?.credentials.map((c) => c.key) ?? [];
      if (credKeys.includes("telegram_bot_token")) channels.push("Telegram");
      if (credKeys.includes("discord_bot_token")) channels.push("Discord");
      if (credKeys.includes("slack_app_token") || credKeys.includes("slack_bot_token")) channels.push("Slack");

      emailService
        .instanceReady(userEmail, userName, instanceName, channels)
        .catch(console.error);
    }

    if (justWentDown) {
      // Alert user
      emailService
        .instanceDown(userEmail, userName, instanceName, instanceId, error)
        .catch(console.error);

      // Alert manager (if assigned)
      if (manager?.email) {
        emailService
          .managerInstanceAlert(
            manager.email, manager.name,
            userName, userEmail,
            instanceName, instanceId,
            "down", error
          )
          .catch(console.error);
      }
    }

    if (justWentDegraded) {
      emailService
        .instanceDegraded(userEmail, userName, instanceName, instanceId, responseMs)
        .catch(console.error);

      // Alert manager for degraded too
      if (manager?.email) {
        emailService
          .managerInstanceAlert(
            manager.email, manager.name,
            userName, userEmail,
            instanceName, instanceId,
            "degraded"
          )
          .catch(console.error);
      }
    }

    if (justRecovered) {
      const downtimeMs = instance.lastCheckedAt
        ? Date.now() - new Date(instance.lastCheckedAt).getTime()
        : 0;
      const downtimeMinutes = Math.round(downtimeMs / 60_000);
      emailService
        .instanceRecovered(userEmail, userName, instanceName, instanceId, downtimeMinutes > 0 ? downtimeMinutes : undefined)
        .catch(console.error);

      // Notify manager of recovery too
      if (manager?.email) {
        emailService
          .managerInstanceAlert(
            manager.email, manager.name,
            userName, userEmail,
            instanceName, instanceId,
            "recovered"
          )
          .catch(console.error);
      }
    }
  }

  // ── Keep only last 100 health checks per instance ─────────────────────────
  const checks = await prisma.healthCheck.findMany({
    where: { instanceId },
    orderBy: { checkedAt: "desc" },
    skip: 100,
    select: { id: true },
  });

  if (checks.length > 0) {
    await prisma.healthCheck.deleteMany({
      where: { id: { in: checks.map((c) => c.id) } },
    });
  }

  return NextResponse.json({
    ok: true,
    transition: justWentLive ? "went_live"
      : justWentDown ? "went_down"
      : justWentDegraded ? "went_degraded"
      : justRecovered ? "recovered"
      : statusChanged ? "status_changed"
      : "no_change",
  });
}
