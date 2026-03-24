import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

interface TelegramGetMeResult {
  ok: boolean;
  result?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
  description?: string;
}

interface TelegramSetWebhookResult {
  ok: boolean;
  description?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { token, setWebhook } = body as { token: string; setWebhook?: boolean };

  if (!token?.trim()) {
    return NextResponse.json({ error: "Bot token is required" }, { status: 400 });
  }

  // ── Validate token via Telegram getMe ─────────────────────────────────────
  let getMeResult: TelegramGetMeResult;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token.trim()}/getMe`,
      { signal: AbortSignal.timeout(8000) }
    );
    getMeResult = (await res.json()) as TelegramGetMeResult;
  } catch (err) {
    return NextResponse.json(
      { error: `Telegram API unreachable: ${err instanceof Error ? err.message : "Network error"}` },
      { status: 502 }
    );
  }

  if (!getMeResult.ok || !getMeResult.result) {
    return NextResponse.json(
      { error: getMeResult.description ?? "Invalid bot token — check it was copied correctly from @BotFather" },
      { status: 400 }
    );
  }

  const bot = getMeResult.result;
  const botUsername = bot.username ? `@${bot.username}` : bot.first_name;

  // ── Save encrypted credential ─────────────────────────────────────────────
  let encrypted: string;
  try {
    encrypted = encrypt(token.trim());
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Encryption failed" },
      { status: 500 }
    );
  }

  await prisma.instanceCredential.upsert({
    where: { instanceId_key: { instanceId: id, key: "telegram_bot_token" } },
    create: { instanceId: id, key: "telegram_bot_token", value: encrypted },
    update: { value: encrypted },
  });

  // ── Store bot username on instance ────────────────────────────────────────
  await prisma.aIInstance.update({
    where: { id },
    data: {
      telegramBotUsername: botUsername,
      configSynced: false, // credentials changed → needs sync
    },
  });

  // ── Log the event ─────────────────────────────────────────────────────────
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "config_changed",
      details: `Telegram channel connected: ${botUsername}`,
    },
  });

  // ── Generate gateway token for webhook secret (if not already set) ─────────
  let { gatewayToken } = instance;
  if (!gatewayToken) {
    const { randomBytes } = await import("crypto");
    gatewayToken = randomBytes(32).toString("hex");
    await prisma.aIInstance.update({
      where: { id },
      data: { gatewayToken },
    });
  }

  // ── Register Vercel webhook (serverless bot — no VPS needed) ─────────────
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "https://openhelixai.com";
  const webhookUrl = `${appUrl}/api/telegram/${id}`;
  let webhookSet = false;
  try {
    const webhookRes = await fetch(
      `https://api.telegram.org/bot${token.trim()}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: gatewayToken,
          allowed_updates: ["message", "edited_message"],
          drop_pending_updates: true,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );
    const webhookData = (await webhookRes.json()) as TelegramSetWebhookResult;
    webhookSet = webhookData.ok === true;
  } catch {
    // Non-fatal: token saved, webhook can be retried
  }

  // ── Also notify VPS if provisioned (belt-and-suspenders) ────────────────
  if (instance.vpsUrl && instance.gatewayToken) {
    fetch(`${instance.vpsUrl}/hooks/wake`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${instance.gatewayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "credential_updated", mode: "next-heartbeat" }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    botUsername,
    botName: bot.first_name,
    webhookSet,
    webhookUrl: webhookSet ? webhookUrl : undefined,
  });
}
