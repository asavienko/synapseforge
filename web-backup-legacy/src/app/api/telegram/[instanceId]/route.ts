/**
 * POST /api/telegram/[instanceId]
 *
 * Serverless Telegram bot webhook — handles all Telegram updates for an instance.
 * Registered automatically when a Telegram bot token is saved via setup-telegram.
 *
 * This makes AI agents work on Telegram WITHOUT any VPS provisioning.
 * Users only need: API key + Telegram bot token = live bot in minutes.
 *
 * Security: Telegram sends a secret token in X-Telegram-Bot-Api-Secret-Token
 * which we verify against instance.gatewayToken.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { callLLM, parseInstanceConfig } from "@/lib/llm";
import { isSandboxExhausted } from "@/lib/sandbox";

export const maxDuration = 60;

// ── Telegram API types ──────────────────────────────────────────────────────

interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  username?: string;
  language_code?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number; type: string; title?: string };
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
}

// ── Send a Telegram message ────────────────────────────────────────────────

async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  replyToMessageId?: number
): Promise<void> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
  };
  if (replyToMessageId) body.reply_to_message_id = replyToMessageId;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
}

// ── Typing action ──────────────────────────────────────────────────────────

async function sendTyping(token: string, chatId: number): Promise<void> {
  await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {});
}

// ── Main handler ──────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  // ── Load instance ────────────────────────────────────────────────────────
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    include: { credentials: true },
  });

  if (!instance || instance.status !== "running") {
    // Acknowledge to Telegram even if we can't process (prevents retries)
    return NextResponse.json({ ok: true });
  }

  // ── Verify webhook secret ────────────────────────────────────────────────
  const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
  if (instance.gatewayToken && secretHeader !== instance.gatewayToken) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 403 });
  }

  // ── Parse update ─────────────────────────────────────────────────────────
  let update: TelegramUpdate;
  try {
    update = (await req.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true }); // bad JSON — ack and move on
  }

  const msg = update.message ?? update.edited_message;
  if (!msg?.text || !msg.from || msg.from.is_bot) {
    return NextResponse.json({ ok: true }); // no text or from a bot — ignore
  }

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // ── Decrypt bot token ─────────────────────────────────────────────────────
  const tokenCred = instance.credentials.find((c) => c.key === "telegram_bot_token");
  if (!tokenCred) return NextResponse.json({ ok: true });

  let botToken: string;
  try {
    botToken = decrypt(tokenCred.value);
  } catch {
    return NextResponse.json({ ok: true });
  }

  // ── Handle /start ────────────────────────────────────────────────────────
  if (text === "/start") {
    const config = parseInstanceConfig(instance.config);
    const greeting = `👋 Hello! I'm *${instance.name}*.\n\n${config.systemPrompt.slice(0, 200)}${config.systemPrompt.length > 200 ? "…" : ""}\n\nHow can I help you today?`;
    await sendTelegramMessage(botToken, chatId, greeting);
    await prisma.chatMessage.createMany({
      data: [
        { instanceId, role: "user", content: "/start", source: "telegram" },
        { instanceId, role: "assistant", content: greeting, source: "telegram" },
      ],
    });
    return NextResponse.json({ ok: true });
  }

  // ── Check sandbox / credentials ──────────────────────────────────────────
  const llmKeys = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
  const hasLLMCreds = instance.credentials.some((c) => llmKeys.includes(c.key));

  if (!hasLLMCreds) {
    if (instance.sandboxMode && !isSandboxExhausted(instance.sandboxUsed ?? 0)) {
      // Sandbox mode — allowed, will use platform key via callLLM
    } else if (isSandboxExhausted(instance.sandboxUsed ?? 0)) {
      await sendTelegramMessage(
        botToken,
        chatId,
        "⚠️ Free messages used up. The agent owner needs to add an API key to continue."
      );
      return NextResponse.json({ ok: true });
    } else {
      // No creds and not sandbox — bot not configured
      return NextResponse.json({ ok: true });
    }
  }

  // ── Persist incoming message ──────────────────────────────────────────────
  await prisma.chatMessage.create({
    data: { instanceId, role: "user", content: text, source: "telegram" },
  });

  // ── Show typing indicator ────────────────────────────────────────────────
  await sendTyping(botToken, chatId);

  // ── Fetch recent conversation history ─────────────────────────────────────
  const history = await prisma.chatMessage.findMany({
    where: { instanceId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const contextMessages = history
    .reverse()
    .slice(0, -1) // exclude the just-created user message
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  // ── Call LLM ──────────────────────────────────────────────────────────────
  const result = await callLLM(instanceId, [
    ...contextMessages,
    { role: "user", content: text },
  ]);

  if ("error" in result) {
    await sendTelegramMessage(botToken, chatId, "⚠️ Sorry, I couldn't process that. Please try again.");
    return NextResponse.json({ ok: true });
  }

  const reply = result.response;

  // ── Send reply ────────────────────────────────────────────────────────────
  await sendTelegramMessage(botToken, chatId, reply, msg.message_id);

  // ── Persist assistant reply ───────────────────────────────────────────────
  await prisma.chatMessage.create({
    data: { instanceId, role: "assistant", content: reply, source: "telegram" },
  });

  // ── Increment sandbox usage if in sandbox mode ───────────────────────────
  if (instance.sandboxMode && !hasLLMCreds) {
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { sandboxUsed: { increment: 1 } },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
