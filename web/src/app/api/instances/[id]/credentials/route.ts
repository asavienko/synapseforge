import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, maskValue } from "@/lib/crypto";

export const ALLOWED_CREDENTIAL_KEYS = [
  "openai_api_key",
  "anthropic_api_key",
  "openrouter_api_key",
  "telegram_bot_token",
  "discord_bot_token",
  "slack_app_token",
  "slack_bot_token",
] as const;

type AllowedKey = (typeof ALLOWED_CREDENTIAL_KEYS)[number];

function isAllowedKey(key: string): key is AllowedKey {
  return (ALLOWED_CREDENTIAL_KEYS as readonly string[]).includes(key);
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const credentials = await prisma.instanceCredential.findMany({
    where: { instanceId: id },
    orderBy: { key: "asc" },
  });

  // Return masked values only — never expose the encrypted or decrypted value
  const masked = credentials.map((c) => ({
    key: c.key,
    maskedValue: "••••••••",
    updatedAt: c.updatedAt,
  }));

  return NextResponse.json(masked);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { key, value } = body as { key: string; value: string };

  if (!key || !value) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }

  if (!isAllowedKey(key)) {
    return NextResponse.json(
      { error: `Invalid credential key. Allowed: ${ALLOWED_CREDENTIAL_KEYS.join(", ")}` },
      { status: 400 }
    );
  }

  // Encrypt the credential value
  let encrypted: string;
  try {
    encrypted = encrypt(value);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Encryption failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Upsert the credential
  await prisma.instanceCredential.upsert({
    where: { instanceId_key: { instanceId: id, key } },
    create: { instanceId: id, key, value: encrypted },
    update: { value: encrypted },
  });

  // Mark configSynced = false since credentials changed
  const updatedInstance = await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: false },
  });

  // If a VPS is already provisioned, trigger a restart signal (non-blocking, fire & forget)
  if (updatedInstance.vpsUrl && updatedInstance.gatewayToken) {
    const vpsUrl = updatedInstance.vpsUrl;
    const gatewayToken = updatedInstance.gatewayToken;
    // Fire and forget — don't await, don't block the user response
    fetch(`${vpsUrl}/hooks/restart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gatewayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: "credential_updated" }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      // Gateway may be offline — that's fine, VPS will pick up on next 5-min poll
    });
  }

  return NextResponse.json({ ok: true, maskedValue: maskValue(value) });
}
