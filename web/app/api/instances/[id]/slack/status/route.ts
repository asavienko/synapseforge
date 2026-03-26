import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

/**
 * GET /api/instances/[id]/slack/status
 *
 * Return Slack bot connection status
 * Shows bot info, workspace, connection health
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify instance ownership and get bot metadata
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      slackBotName: true,
      slackTeamName: true,
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get the bot token from credentials
  const credential = await prisma.instanceCredential.findFirst({
    where: { instanceId: id, key: "slack_bot_token" },
  });

  // If no bot token configured, return disconnected status
  if (!credential) {
    return NextResponse.json({
      enabled: false,
      status: "disconnected",
      botName: instance.slackBotName,
      teamName: instance.slackTeamName,
    });
  }

  // Check bot health with Slack API
  const health = {
    healthy: false,
    error: null as string | null,
    botName: instance.slackBotName,
    teamName: instance.slackTeamName,
  };

  try {
    const token = decrypt(credential.value);

    // Validate token via Slack auth.test
    const authRes = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!authRes.ok) {
      health.error = `Slack API returned HTTP ${authRes.status}`;
    } else {
      const authData = await authRes.json();
      if (authData.ok) {
        health.healthy = true;
        health.botName = authData.user ?? authData.user_id ?? health.botName;
        health.teamName = authData.team ?? health.teamName;

        // Update stored metadata if it changed
        if (health.botName !== instance.slackBotName || health.teamName !== instance.slackTeamName) {
          await prisma.aIInstance.update({
            where: { id },
            data: {
              slackBotName: health.botName,
              slackTeamName: health.teamName,
            },
          }).catch(() => {}); // Non-critical, ignore errors
        }
      } else {
        health.error = authData.error ?? "Invalid Slack token";
      }
    }
  } catch (err) {
    health.error = err instanceof Error ? err.message : "Health check failed";
  }

  return NextResponse.json({
    enabled: health.healthy,
    status: health.healthy ? "connected" : "degraded",
    botName: health.botName,
    teamName: health.teamName,
    health: health.healthy ? "healthy" : "unhealthy",
    error: health.error,
  });
}