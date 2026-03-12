import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { generateOpenClawConfig, InstanceConfig, CredentialMap } from "@/lib/openclaw-config";
import { randomBytes } from "crypto";

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
      user: { select: { onboardingData: true } },
    },
  });

  if (!instance) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!instance.bootstrapToken || instance.bootstrapToken !== token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (instance.bootstrapUsed) {
    return new NextResponse("Bootstrap token already used", { status: 410 });
  }

  // Decrypt all credentials
  const credMap: Partial<CredentialMap> = {};
  for (const cred of instance.credentials) {
    try {
      const decrypted = decrypt(cred.value);
      (credMap as Record<string, string>)[cred.key] = decrypted;
    } catch {
      // Skip invalid credentials
    }
  }

  // Parse instance config
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

  // Use existing gateway token or generate a new one
  const gatewayToken = instance.gatewayToken ?? randomBytes(32).toString("hex");
  if (!instance.gatewayToken) {
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { gatewayToken },
    });
  }

  const fullCredMap: CredentialMap = {
    ...credMap,
    gateway_token: gatewayToken,
  };

  // Parse onboarding data from user profile
  let onboardingData: { business?: string; industry?: string; useCase?: string } | undefined;
  try {
    const raw = (instance.user as { onboardingData?: string | null } | null)?.onboardingData;
    if (raw) onboardingData = JSON.parse(raw);
  } catch {
    // ignore parse errors
  }

  // Generate config
  const configContent = generateOpenClawConfig(instanceConfig, fullCredMap, onboardingData);

  // Mark bootstrap token as used
  await prisma.aIInstance.update({
    where: { id: instanceId },
    data: { bootstrapUsed: true },
  });

  return new NextResponse(configContent, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
