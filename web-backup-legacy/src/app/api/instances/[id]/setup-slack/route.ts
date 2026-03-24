import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

interface SlackAuthTestResponse {
  ok: boolean;
  user_id?: string;
  user?: string;
  team?: string;
  error?: string;
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
  const { appToken, botToken } = body as { appToken: string; botToken: string };

  if (!botToken?.trim()) {
    return NextResponse.json({ ok: false, error: "Bot token is required" }, { status: 400 });
  }
  if (!appToken?.trim()) {
    return NextResponse.json({ ok: false, error: "App token is required" }, { status: 400 });
  }

  // ── Validate botToken via Slack auth.test ─────────────────────────────────
  let slackData: SlackAuthTestResponse;
  try {
    const res = await fetch("https://slack.com/api/auth.test", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken.trim()}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Slack API returned HTTP ${res.status}` },
        { status: 502 }
      );
    }

    slackData = (await res.json()) as SlackAuthTestResponse;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Slack API unreachable: ${err instanceof Error ? err.message : "Network error"}` },
      { status: 502 }
    );
  }

  if (!slackData.ok) {
    return NextResponse.json(
      { ok: false, error: slackData.error ?? "Invalid Slack bot token" },
      { status: 400 }
    );
  }

  const botName = slackData.user ?? slackData.user_id ?? "Unknown Bot";
  const teamName = slackData.team ?? "Unknown Workspace";

  // ── Save encrypted credentials ────────────────────────────────────────────
  let encryptedAppToken: string;
  let encryptedBotToken: string;
  try {
    encryptedAppToken = encrypt(appToken.trim());
    encryptedBotToken = encrypt(botToken.trim());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Encryption failed" },
      { status: 500 }
    );
  }

  await Promise.all([
    prisma.instanceCredential.upsert({
      where: { instanceId_key: { instanceId: id, key: "slack_app_token" } },
      create: { instanceId: id, key: "slack_app_token", value: encryptedAppToken },
      update: { value: encryptedAppToken },
    }),
    prisma.instanceCredential.upsert({
      where: { instanceId_key: { instanceId: id, key: "slack_bot_token" } },
      create: { instanceId: id, key: "slack_bot_token", value: encryptedBotToken },
      update: { value: encryptedBotToken },
    }),
  ]);

  // ── Store bot metadata + mark configSynced = false ───────────────────────
  await prisma.aIInstance.update({
    where: { id },
    data: {
      slackBotName: botName,
      slackTeamName: teamName,
      configSynced: false,
    },
  });

  // ── Log the event ─────────────────────────────────────────────────────────
  await prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "config_changed",
      details: `Slack channel connected: ${botName} in ${teamName}`,
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

  return NextResponse.json({
    ok: true,
    botName,
    teamName,
  });
}
