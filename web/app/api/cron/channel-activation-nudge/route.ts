/**
 * Channel activation nudge — runs daily.
 *
 * Targets users who:
 *   1. Have a running instance with their own LLM key (not in sandbox mode), AND
 *   2. Have NOT connected any channel (no Telegram/Discord/Slack/WhatsApp token), AND
 *   3. Have been in this state for 24–72h
 *
 * These are users at the highest intent moment — they added their own API key,
 * they're serious, but they haven't completed activation (connecting a channel).
 * This email converts them from "working agent nobody can reach" to "live agent".
 *
 * Deduplicated via ActivityLog event: "channel_activation_nudge_sent"
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WINDOW_MIN_HOURS = 24;
const WINDOW_MAX_HOURS = 72;

const CHANNEL_CRED_KEYS = [
  "telegram_bot_token",
  "discord_bot_token",
  "slack_app_token",
  "slack_bot_token",
  "whatsapp_business_token",
];

export async function GET(req: Request) {
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const windowStart = new Date(now - WINDOW_MAX_HOURS * 3600 * 1000);
  const windowEnd   = new Date(now - WINDOW_MIN_HOURS * 3600 * 1000);

  // Find instances that:
  // - are running
  // - not in sandbox mode (user added their own LLM key)
  // - updated (LLM key added) within the 24–72h window
  // - have an LLM credential but NO channel credential
  const candidates = await prisma.aIInstance.findMany({
    where: {
      status: "running",
      sandboxMode: false,
      updatedAt: { gte: windowStart, lte: windowEnd },
      // Has at least one LLM key
      credentials: {
        some: { key: { in: ["openai_api_key", "anthropic_api_key", "openrouter_api_key"] } },
      },
    },
    include: {
      credentials: { select: { key: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const instance of candidates) {
    if (!instance.user?.email) { skipped++; continue; }

    // Skip if they already have a channel connected
    const hasChannel = instance.credentials.some((c) =>
      CHANNEL_CRED_KEYS.includes(c.key)
    );
    if (hasChannel) { skipped++; continue; }

    // Skip if we already sent this email
    const alreadySent = await prisma.activityLog.findFirst({
      where: { instanceId: instance.id, event: "channel_activation_nudge_sent" },
    });
    if (alreadySent) { skipped++; continue; }

    const ok = await email.channelActivationNudge(
      instance.user.email,
      instance.user.name ?? "there",
      instance.name,
      instance.id,
    ).catch(() => false);

    if (ok) {
      await prisma.activityLog.create({
        data: {
          instanceId: instance.id,
          event: "channel_activation_nudge_sent",
          details: `Channel activation nudge sent to ${instance.user.email} — no channel connected after ${WINDOW_MIN_HOURS}h`,
        },
      });
      sent++;
    } else {
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    checked: candidates.length,
  });
}
