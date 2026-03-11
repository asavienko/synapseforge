import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";
import { encrypt } from "@/lib/crypto";

const ALLOWED_CRED_KEYS = [
  "openai_api_key",
  "anthropic_api_key",
  "openrouter_api_key",
  "telegram_bot_token",
  "discord_bot_token",
  "slack_app_token",
  "slack_bot_token",
] as const;

type AllowedKey = (typeof ALLOWED_CRED_KEYS)[number];

function isAllowedKey(key: string): key is AllowedKey {
  return (ALLOWED_CRED_KEYS as readonly string[]).includes(key);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // { business, industry, useCase, credentials?: Record<string, string> }
  const data = await req.json();
  const { credentials } = data as { credentials?: Record<string, string> };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingDone: true,
      onboardingData: JSON.stringify({ business: data.business, industry: data.industry, useCase: data.useCase }),
    },
    include: { manager: true, instances: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  // Save credentials to the user's first instance
  const instance = user.instances[0] ?? null;
  if (instance && credentials && typeof credentials === "object") {
    for (const [key, value] of Object.entries(credentials)) {
      if (!isAllowedKey(key) || !value?.trim()) continue;
      try {
        const encrypted = encrypt(value.trim());
        await prisma.instanceCredential.upsert({
          where: { instanceId_key: { instanceId: instance.id, key } },
          create: { instanceId: instance.id, key, value: encrypted },
          update: { value: encrypted },
        });
      } catch {
        // skip — don't fail the whole request for a bad credential
      }
    }
    // Mark config as needing sync
    await prisma.aIInstance.update({
      where: { id: instance.id },
      data: { configSynced: false },
    });
  }

  // Notify manager if assigned
  if (user.manager) {
    email.newUserAlert(
      user.manager.email,
      user.manager.name,
      user.name ?? user.email,
      user.email,
      user.onboardingData ?? undefined
    ).catch(console.error);
  }

  return NextResponse.json({ ok: true, instanceId: instance?.id ?? null });
}
