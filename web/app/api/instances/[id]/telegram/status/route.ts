import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

/**
 * GET /api/instances/[id]/telegram/status
 * 
 * Return Telegram bot connection status
 * Shows bot info, webhook status, connection health
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  
  // Verify instance ownership and get bot username
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      telegramBotUsername: true,
    },
  });
  
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get the bot token from credentials
  const credential = await prisma.instanceCredential.findFirst({
    where: { instanceId: id, key: "telegram_bot_token" },
  });

  // If no bot token configured, return disconnected status
  if (!credential) {
    return NextResponse.json({
      enabled: false,
      status: "disconnected",
      botUsername: instance.telegramBotUsername,
      webhookSet: false,
    });
  }

  // Check bot health with Telegram API
  const health = {
    healthy: false,
    error: null as string | null,
    botUsername: instance.telegramBotUsername,
    webhookSet: false,
  };

  try {
    const token = decrypt(credential.value);
    
    // Get bot info from Telegram
    const botInfoRes = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!botInfoRes.ok) {
      const errorData = await botInfoRes.json().catch(() => ({ description: "Unknown error" }));
      health.error = errorData.description || `Telegram API returned ${botInfoRes.status}`;
    } else {
      const botInfo = await botInfoRes.json();
      if (botInfo.ok) {
        health.healthy = true;
        health.botUsername = botInfo.result.username;
        
        // Update stored bot username if it changed
        if (health.botUsername !== instance.telegramBotUsername) {
          await prisma.aIInstance.update({
            where: { id },
            data: { telegramBotUsername: health.botUsername },
          }).catch(() => {}); // Non-critical, ignore errors
        }
      } else {
        health.error = botInfo.description || "Bot info request failed";
      }
    }

    // Check webhook status if bot is healthy
    if (health.healthy) {
      const webhookRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
        signal: AbortSignal.timeout(10000),
      });
      
      if (webhookRes.ok) {
        const webhookInfo = await webhookRes.json();
        if (webhookInfo.ok) {
          health.webhookSet = !!webhookInfo.result.url;
          
          // Check for webhook errors
          if (webhookInfo.result.last_error_message) {
            health.error = webhookInfo.result.last_error_message;
            health.healthy = false;
          }
        }
      }
    }
  } catch (err) {
    health.error = err instanceof Error ? err.message : "Health check failed";
  }

  return NextResponse.json({
    enabled: health.healthy,
    status: health.healthy ? (health.webhookSet ? "connected" : "bot_ready") : "degraded",
    botUsername: health.botUsername,
    webhookSet: health.webhookSet,
    health: health.healthy ? "healthy" : "unhealthy",
    error: health.error,
  });
}