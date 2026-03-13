import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt, maskValue } from "@/lib/crypto";
import { sshSyncConfig } from "@/lib/ssh-sync";
import { captureServerEvent } from "@/lib/posthog-server";

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

// ─── LLM Key Validation ──────────────────────────────────────────────────────

async function validateLLMKey(key: string, value: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (key === "openai_api_key") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${value}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { valid: true };
      const d = await res.json().catch(() => ({}));
      return { valid: false, error: (d as { error?: { message?: string } })?.error?.message ?? `OpenAI returned ${res.status}` };
    }

    if (key === "anthropic_api_key") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": value,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-20240307",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok || res.status === 529) return { valid: true }; // 529 = overloaded but key valid
      if (res.status === 401) return { valid: false, error: "Invalid API key" };
      const d = await res.json().catch(() => ({}));
      return { valid: false, error: (d as { error?: { message?: string } })?.error?.message ?? `Anthropic returned ${res.status}` };
    }

    if (key === "openrouter_api_key") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${value}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { valid: true };
      return { valid: false, error: `OpenRouter returned ${res.status}` };
    }

    return { valid: true }; // non-LLM keys skip validation
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Validation request failed" };
  }
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

  // ?validate=true — test the key without saving
  const validateOnly = req.nextUrl.searchParams.get("validate") === "true";
  if (validateOnly) {
    const result = await validateLLMKey(key, value);
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
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

  // Track credential addition in PostHog (fire-and-forget)
  captureServerEvent(session.user.id, "credential_added", { provider: key }).catch(() => {});

  // Mark configSynced = false since credentials changed
  const updatedInstance = await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: false },
  });

  // If a VPS is provisioned and SSH key is available, attempt immediate config sync (non-blocking)
  if (updatedInstance.vpsUrl && updatedInstance.gatewayToken && updatedInstance.sshPrivateKey) {
    const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "";
    const { vpsUrl, gatewayToken, sshPrivateKey } = updatedInstance;

    // Fire and forget — don't await, don't block the user response
    Promise.resolve().then(async () => {
      try {
        const decryptedKey = decrypt(sshPrivateKey);
        const result = await sshSyncConfig({
          privateKey: decryptedKey,
          vpsUrl,
          gatewayToken,
          appUrl,
          instanceId: id,
        });
        if (result.success) {
          await prisma.aIInstance.update({
            where: { id },
            data: { configSynced: true, syncRequested: false },
          });
          await prisma.activityLog.create({
            data: {
              instanceId: id,
              event: "config_synced",
              details: "Config auto-synced after credential save",
            },
          });
        } else {
          await prisma.activityLog.create({
            data: {
              instanceId: id,
              event: "config_sync_requested",
              details: `Auto-sync after credential save failed (${result.error ?? "unknown"}) — queued`,
            },
          });
        }
      } catch {
        // Silently ignore — VPS will pick up on next cron poll
      }
    });
  } else if (updatedInstance.vpsUrl && updatedInstance.gatewayToken) {
    // No SSH key — just ping the wake hook as before (non-blocking)
    const { vpsUrl, gatewayToken } = updatedInstance;
    fetch(`${vpsUrl}/hooks/wake`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gatewayToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: "credential_updated", mode: "next-heartbeat" }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      // Gateway may be offline — that's fine, VPS will pick up on next 5-min poll
    });
  }

  return NextResponse.json({ ok: true, maskedValue: maskValue(value) });
}
