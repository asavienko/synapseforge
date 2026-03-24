import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { generateOpenClawConfig, InstanceConfig, CredentialMap } from "@/lib/openclaw-config";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
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

  const appUrl = process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "https://openhelixai.com";
  const adminApiKey = process.env.ADMIN_API_KEY ?? "";

  // Extract VPS IP from vpsUrl
  const vpsIp = instance.vpsUrl
    ? instance.vpsUrl.replace("http://", "").replace("https://", "").split(":")[0]
    : null;

  const syncCommand = vpsIp
    ? `curl -sf -H "Authorization: Bearer ${adminApiKey}" ${appUrl}/api/admin/instances/${id}/config-file | ssh root@${vpsIp} "cat > /opt/openclaw/openclaw.json && docker compose -f /opt/openclaw/docker-compose.yml restart"`
    : null;

  // Mark as synced
  await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: true },
  });

  return NextResponse.json({
    ok: true,
    config,
    instanceId: id,
    vpsUrl: instance.vpsUrl,
    syncCommand,
  });
}
