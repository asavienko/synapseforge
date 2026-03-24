import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

interface DiscordBotUser {
  id: string;
  username: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { token } = body as { token: string };

  if (!token?.trim()) {
    return NextResponse.json({ ok: false, error: "Bot token is required" }, { status: 400 });
  }

  // ── Validate token via Discord API ────────────────────────────────────────
  let botUser: DiscordBotUser;
  try {
    const res = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token.trim()}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `Invalid Discord bot token (HTTP ${res.status})${text ? `: ${text}` : ""}` },
        { status: 400 }
      );
    }

    botUser = (await res.json()) as DiscordBotUser;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Discord API unreachable: ${err instanceof Error ? err.message : "Network error"}` },
      { status: 502 }
    );
  }

  if (!botUser?.id || !botUser?.username) {
    return NextResponse.json(
      { ok: false, error: "Unexpected response from Discord API" },
      { status: 502 }
    );
  }

  // ── Save encrypted credential ─────────────────────────────────────────────
  let encrypted: string;
  try {
    encrypted = encrypt(token.trim());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Encryption failed" },
      { status: 500 }
    );
  }

  await prisma.instanceCredential.upsert({
    where: { instanceId_key: { instanceId: id, key: "discord_bot_token" } },
    create: { instanceId: id, key: "discord_bot_token", value: encrypted },
    update: { value: encrypted },
  });

  // ── Store bot metadata + mark configSynced = false ───────────────────────
  await prisma.aIInstance.update({
    where: { id },
    data: {
      discordBotUsername: botUser.username,
      discordBotId: botUser.id,
      configSynced: false,
    },
  });

  // ── Log the event ─────────────────────────────────────────────────────────
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "config_changed",
      details: `Discord channel connected: @${botUser.username} (${botUser.id})`,
    },
  });

  // ── Notify VPS (fire & forget) ────────────────────────────────────────────
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

  // ── Build invite URL ──────────────────────────────────────────────────────
  // Permissions: send messages, read messages, embed links, attach files, use slash commands
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botUser.id}&permissions=277025392640&scope=bot%20applications.commands`;

  return NextResponse.json({
    ok: true,
    botUsername: botUser.username,
    botId: botUser.id,
    inviteUrl,
  });
}
