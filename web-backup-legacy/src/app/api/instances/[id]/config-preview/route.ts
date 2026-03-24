import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, maskValue } from "@/lib/crypto";
import { generateOpenClawConfig, InstanceConfig, CredentialMap } from "@/lib/openclaw-config";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    include: { credentials: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Decrypt credentials, then re-mask them for display
  const credMap: Partial<CredentialMap> = {};
  for (const cred of instance.credentials) {
    try {
      const decrypted = decrypt(cred.value);
      // Mask the value for user display
      (credMap as Record<string, string>)[cred.key] = maskValue(decrypted);
    } catch {
      // Skip invalid credentials
    }
  }

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
    gateway_token: instance.gatewayToken ? maskValue(instance.gatewayToken) : "not-configured",
  };

  const configContent = generateOpenClawConfig(instanceConfig, fullCredMap);

  return new NextResponse(configContent, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
