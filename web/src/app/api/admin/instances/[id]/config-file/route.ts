import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { generateOpenClawConfig, InstanceConfig, CredentialMap } from "@/lib/openclaw-config";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Support both session-based admin auth and Bearer ADMIN_API_KEY
  const authHeader = req.headers.get("authorization");
  const adminApiKey = process.env.ADMIN_API_KEY;

  let authorized = false;

  if (authHeader?.startsWith("Bearer ") && adminApiKey) {
    authorized = authHeader.slice(7) === adminApiKey;
  }

  if (!authorized) {
    const session = await auth();
    if (session?.user?.email && isAdmin(session.user.email)) {
      authorized = true;
    }
  }

  if (!authorized) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findUnique({
    where: { id },
    include: { credentials: true },
  });
  if (!instance) return new NextResponse("Not found", { status: 404 });

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

  const configContent = generateOpenClawConfig(instanceConfig, fullCredMap);

  return new NextResponse(configContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="openclaw.json"`,
    },
  });
}
