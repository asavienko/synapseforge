import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { captureServerEvent } from "@/lib/posthog-server";

// Valid LLM providers for the credential vault
const VALID_PROVIDERS = ["openai", "anthropic", "openrouter"] as const;
type ValidProvider = (typeof VALID_PROVIDERS)[number];

function isValidProvider(provider: string): provider is ValidProvider {
  return (VALID_PROVIDERS as readonly string[]).includes(provider);
}

// Provider-specific key validation patterns
const KEY_PATTERNS: Record<ValidProvider, RegExp> = {
  openai: /^sk-[a-zA-Z0-9]{48}$/,
  anthropic: /^sk-ant-[a-zA-Z0-9]{32,}$/,
  openrouter: /^sk-or-[a-zA-Z0-9]{32,}$/,
};

// Validate key format
function validateKeyFormat(provider: ValidProvider, key: string): { valid: boolean; error?: string } {
  const pattern = KEY_PATTERNS[provider];
  if (!pattern.test(key)) {
    return {
      valid: false,
      error: `Invalid ${provider} API key format. Expected: ${provider === "openai" ? "sk-..." : provider === "anthropic" ? "sk-ant-..." : "sk-or-..."}`,
    };
  }
  return { valid: true };
}

// Validate API key against provider
async function validateApiKey(provider: ValidProvider, key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { valid: true };
      const d = await res.json().catch(() => ({}));
      return { valid: false, error: (d as { error?: { message?: string } })?.error?.message ?? `OpenAI returned ${res.status}` };
    }

    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": key,
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
      if (res.ok || res.status === 529) return { valid: true };
      if (res.status === 401) return { valid: false, error: "Invalid API key" };
      const d = await res.json().catch(() => ({}));
      return { valid: false, error: (d as { error?: { message?: string } })?.error?.message ?? `Anthropic returned ${res.status}` };
    }

    if (provider === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return { valid: true };
      return { valid: false, error: `OpenRouter returned ${res.status}` };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : "Validation request failed" };
  }
}

// GET /api/user/credentials - List user's stored API keys (masked)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials = await prisma.userCredential.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      lastFour: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Return masked credentials - never expose encrypted values
  return NextResponse.json(credentials);
}

// POST /api/user/credentials - Store a new API key
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { provider, key, validate = true } = body as {
    provider: string;
    key: string;
    validate?: boolean;
  };

  // Validate provider
  if (!provider || !isValidProvider(provider)) {
    return NextResponse.json(
      { error: `Invalid provider. Allowed: ${VALID_PROVIDERS.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate key presence
  if (!key || typeof key !== "string" || key.length < 10) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  // Validate key format
  const formatCheck = validateKeyFormat(provider, key);
  if (!formatCheck.valid) {
    return NextResponse.json({ error: formatCheck.error }, { status: 400 });
  }

  // Optional: Validate key against provider API
  if (validate) {
    const validation = await validateApiKey(provider, key);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
  }

  // Encrypt the API key
  let encrypted: string;
  try {
    encrypted = encrypt(key);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Encryption failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // Extract last 4 characters for display
  const lastFour = key.slice(-4);

  // Check if user already has a credential for this provider
  const existing = await prisma.userCredential.findUnique({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider,
      },
    },
  });

  // Upsert the credential (one per provider per user)
  const credential = await prisma.userCredential.upsert({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider,
      },
    },
    create: {
      userId: session.user.id,
      provider,
      encryptedKey: encrypted,
      lastFour,
      isDefault: true,
    },
    update: {
      encryptedKey: encrypted,
      lastFour,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      provider: true,
      lastFour: true,
      isDefault: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Track credential addition in PostHog
  captureServerEvent(session.user.id, "user_credential_added", { provider }).catch(() => {});

  return NextResponse.json(credential, { status: existing ? 200 : 201 });
}
