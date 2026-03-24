import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { generateOpenClawConfig, InstanceConfig, CredentialMap } from "@/lib/openclaw-config";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify the session user is the manager responsible for this instance's user
  const manager = await prisma.manager.findFirst({
    where: {
      email: session.user.email,
      users: { some: { instances: { some: { id } } } },
    },
    select: { id: true, email: true },
  });
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const instance = await prisma.aIInstance.findUnique({
    where: { id },
    include: { credentials: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

  const gatewayToken = instance.gatewayToken ?? "not-set";
  const fullCredMap: CredentialMap = { ...credMap, gateway_token: gatewayToken };

  const config = generateOpenClawConfig(instanceConfig, fullCredMap);

  // Queue the sync_config command for the instance agent to pick up
  await prisma.instanceCommand.create({
    data: {
      instanceId: id,
      type: "sync_config",
      payload: JSON.stringify({ config }),
      requestedBy: manager.email,
      note: "Pushed by manager via portal",
    },
  });

  // Mark config as not yet synced (pending execution of the queued command)
  await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: false },
  });

  return NextResponse.json({ ok: true, instanceId: id });
}
