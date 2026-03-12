import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "https://synapseforge.ai";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      status: true,
      telegramBotUsername: true,
      discordBotUsername: true,
      discordBotId: true,
      slackBotName: true,
      slackTeamName: true,
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const links: {
    telegram?: { url: string; botUsername: string };
    discord?: { inviteUrl: string; botName: string };
    slack?: { botName: string; teamName: string };
    chat?: { url: string };
  } = {};

  // ── Telegram ──────────────────────────────────────────────────────────────
  if (instance.telegramBotUsername) {
    // Remove leading "@" for the t.me URL
    const username = instance.telegramBotUsername.replace(/^@/, "");
    links.telegram = {
      url: `https://t.me/${username}`,
      botUsername: instance.telegramBotUsername,
    };
  }

  // ── Discord ───────────────────────────────────────────────────────────────
  if (instance.discordBotId && instance.discordBotUsername) {
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${instance.discordBotId}&permissions=277025392640&scope=bot%20applications.commands`;
    links.discord = {
      inviteUrl,
      botName: instance.discordBotUsername,
    };
  }

  // ── Slack ─────────────────────────────────────────────────────────────────
  if (instance.slackBotName && instance.slackTeamName) {
    links.slack = {
      botName: instance.slackBotName,
      teamName: instance.slackTeamName,
    };
  }

  // ── Web chat (only when running) ──────────────────────────────────────────
  if (instance.status === "running") {
    links.chat = {
      url: `${APP_URL}/chat/${instance.id}`,
    };
  }

  return NextResponse.json(links);
}
