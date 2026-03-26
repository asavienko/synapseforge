import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

/**
 * GET /api/instances/[id]/discord/status
 *
 * Return Discord bot connection status
 * Shows bot info, connection health
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
      discordBotUsername: true,
      discordBotId: true,
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get the bot token from credentials
  const credential = await prisma.instanceCredential.findFirst({
    where: { instanceId: id, key: "discord_bot_token" },
  });

  // If no bot token configured, return disconnected status
  if (!credential) {
    return NextResponse.json({
      enabled: false,
      status: "disconnected",
      botUsername: instance.discordBotUsername,
      botId: instance.discordBotId,
    });
  }

  // Check bot health with Discord API
  const health = {
    healthy: false,
    error: null as string | null,
    botUsername: instance.discordBotUsername,
    botId: instance.discordBotId,
  };

  try {
    const token = decrypt(credential.value);

    // Get bot info from Discord
    const botInfoRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!botInfoRes.ok) {
      const errorData = await botInfoRes.json().catch(() => ({ message: "Unknown error" }));
      health.error = errorData.message || `Discord API returned ${botInfoRes.status}`;
    } else {
      const botInfo = await botInfoRes.json();
      if (botInfo.id) {
        health.healthy = true;
        health.botUsername = botInfo.username;
        health.botId = botInfo.id;

        // Update stored bot metadata if it changed
        if (health.botUsername !== instance.discordBotUsername || health.botId !== instance.discordBotId) {
          await prisma.aIInstance.update({
            where: { id },
            data: {
              discordBotUsername: health.botUsername,
              discordBotId: health.botId,
            },
          }).catch(() => {}); // Non-critical, ignore errors
        }
      } else {
        health.error = "Invalid response from Discord API";
      }
    }
  } catch (err) {
    health.error = err instanceof Error ? err.message : "Health check failed";
  }

  return NextResponse.json({
    enabled: health.healthy,
    status: health.healthy ? "connected" : "degraded",
    botUsername: health.botUsername,
    botId: health.botId,
    health: health.healthy ? "healthy" : "unhealthy",
    error: health.error,
  });
}