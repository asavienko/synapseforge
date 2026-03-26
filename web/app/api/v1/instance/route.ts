import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, CORS_HEADERS } from "@/lib/api-auth";
import { parseInstanceConfig } from "@/lib/llm";
import { rateLimit } from "@/lib/ratelimit";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/v1/instance
 *
 * Returns metadata about the instance associated with the API key.
 * Useful for checking status, model, and capabilities before sending chat requests.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const rawKey = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  // Rate limiting by API key (120 requests per minute for metadata)
  if (rawKey) {
    const rateLimitAllowed = await rateLimit(`instance:${rawKey}`, 120, 60 * 1000);
    if (!rateLimitAllowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter: 60 },
        { status: 429, headers: CORS_HEADERS }
      );
    }
  }

  const ctx = await validateApiKey(req);
  if (!ctx) {
    return NextResponse.json(
      { error: "Invalid or missing API key." },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const instance = await prisma.aIInstance.findUnique({
    where: { id: ctx.instanceId },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      tier: true,
      config: true,
      healthStatus: true,
      lastCheckedAt: true,
      credentials: { select: { key: true } },
    },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404, headers: CORS_HEADERS });
  }

  const config = parseInstanceConfig(instance.config);
  const credKeys = instance.credentials.map((c) => c.key);

  const channels = {
    telegram: credKeys.includes("telegram_bot_token"),
    discord: credKeys.includes("discord_bot_token"),
    slack: credKeys.includes("slack_app_token") || credKeys.includes("slack_bot_token"),
  };

  const llmProvider = credKeys.includes("openai_api_key")
    ? "openai"
    : credKeys.includes("anthropic_api_key")
    ? "anthropic"
    : credKeys.includes("openrouter_api_key")
    ? "openrouter"
    : null;

  return NextResponse.json(
    {
      id: instance.id,
      name: instance.name,
      type: instance.type,
      status: instance.status,
      tier: instance.tier,
      model: config.model,
      llmProvider,
      channels,
      health: {
        status: instance.healthStatus ?? "unknown",
        lastCheckedAt: instance.lastCheckedAt,
      },
    },
    { headers: CORS_HEADERS }
  );
}
