import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { generateOpenClawConfig, InstanceConfig, CredentialMap } from "@/lib/openclaw-config";
import { createHash } from "crypto";

/**
 * GET /api/internal/instance-config/[instanceId]
 *
 * Called by the VPS polling script to get the latest OpenClaw config.
 * Authenticated by the instance's gateway token.
 *
 * Response headers:
 *   X-Config-Hash: sha256 of the config content — VPS compares to detect changes.
 *
 * The VPS polling script:
 *   1. Calls this endpoint with Authorization: Bearer <gatewayToken>
 *   2. Compares X-Config-Hash to stored hash
 *   3. If different: writes new config to disk + restarts Docker
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const token = authHeader.slice(7);

  const { instanceId } = await params;
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    include: {
      credentials: true,
      user: { select: { id: true, onboardingData: true } },
    },
  });

  if (!instance) return new NextResponse("Not found", { status: 404 });

  // Auth: must match the gateway token
  if (!instance.gatewayToken || instance.gatewayToken !== token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Decrypt instance-level credentials
  const credMap: Partial<CredentialMap> = {};
  for (const cred of instance.credentials) {
    try {
      (credMap as Record<string, string>)[cred.key] = decrypt(cred.value);
    } catch {
      // skip malformed
    }
  }

  // Fallback: read LLM keys from user's global credential vault if not set at instance level
  const LLM_KEY_MAP: Record<string, string> = {
    openai: "openai_api_key",
    anthropic: "anthropic_api_key",
    openrouter: "openrouter_api_key",
  };

  const userCredentials = await prisma.userCredential.findMany({
    where: { userId: instance.user.id },
  });

  for (const userCred of userCredentials) {
    const instanceKey = LLM_KEY_MAP[userCred.provider];
    // Only use user credential if instance doesn't have this key set
    if (instanceKey && !(credMap as Record<string, string>)[instanceKey]) {
      try {
        (credMap as Record<string, string>)[instanceKey] = decrypt(userCred.encryptedKey);
      } catch {
        // skip malformed
      }
    }
  }

  // Parse config
  let instanceConfig: InstanceConfig;
  try {
    const parsed = instance.config ? JSON.parse(instance.config) : {};
    instanceConfig = {
      model: parsed.model ?? "openai/gpt-4o",
      systemPrompt: parsed.systemPrompt ?? "You are a helpful AI assistant.",
      temperature: parsed.temperature ?? 0.7,
      maxTokens: parsed.maxTokens ?? 1024,
    };
  } catch {
    instanceConfig = {
      model: "openai/gpt-4o",
      systemPrompt: "You are a helpful AI assistant.",
      temperature: 0.7,
      maxTokens: 1024,
    };
  }

  const fullCredMap: CredentialMap = {
    ...credMap,
    gateway_token: instance.gatewayToken,
  };

  // Parse onboarding data from user profile
  let onboardingData: { business?: string; industry?: string; useCase?: string } | undefined;
  try {
    const raw = (instance.user as { onboardingData?: string | null } | null)?.onboardingData;
    if (raw) onboardingData = JSON.parse(raw);
  } catch {
    // ignore parse errors
  }

  const configContent = generateOpenClawConfig(instanceConfig, fullCredMap, onboardingData);
  const configHash = createHash("sha256").update(configContent).digest("hex").slice(0, 16);

  // Mark as synced now that VPS fetched latest
  await prisma.aIInstance.update({
    where: { id: instanceId },
    data: { configSynced: true },
  });

  return new NextResponse(configContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Config-Hash": configHash,
      "Cache-Control": "no-store",
    },
  });
}
