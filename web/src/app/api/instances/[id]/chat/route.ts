import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface InstanceConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_CONFIG: InstanceConfig = {
  model: "gpt-4o",
  systemPrompt: "You are a helpful AI assistant.",
  temperature: 0.7,
  maxTokens: 1024,
};

// Map our model names to provider-specific model IDs
const MODEL_MAP: Record<string, { provider: "openai" | "anthropic" | "openrouter"; modelId: string }> = {
  "gpt-4o":          { provider: "openai",    modelId: "gpt-4o" },
  "gpt-4-turbo":     { provider: "openai",    modelId: "gpt-4-turbo" },
  "gpt-3.5-turbo":   { provider: "openai",    modelId: "gpt-3.5-turbo" },
  "claude-3-5-sonnet": { provider: "anthropic", modelId: "claude-3-5-sonnet-20241022" },
  "claude-3-haiku":  { provider: "anthropic", modelId: "claude-3-haiku-20240307" },
  "gemini-1.5-pro":  { provider: "openrouter", modelId: "google/gemini-1.5-pro" },
  "llama-3-70b":     { provider: "openrouter", modelId: "meta-llama/llama-3-70b-instruct" },
};

const CREDENTIAL_KEY_FOR_PROVIDER: Record<string, string> = {
  openai:    "openai_api_key",
  anthropic: "anthropic_api_key",
  openrouter: "openrouter_api_key",
};

async function callOpenAI(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  config: InstanceConfig,
  baseUrl = "https://api.openai.com/v1"
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callAnthropic(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  config: InstanceConfig
): Promise<string> {
  // Anthropic separates system from messages
  const userMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: config.maxTokens,
      system: config.systemPrompt,
      messages: userMessages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (instance.status !== "running") {
    return NextResponse.json({ error: "Instance is not running" }, { status: 400 });
  }

  // Parse request body — accept either `messages` array or single `message`
  const body = await req.json();
  let messages: ChatMessage[] = [];

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages as ChatMessage[];
  } else if (typeof body.message === "string" && body.message.trim()) {
    messages = [{ role: "user", content: body.message.trim() }];
  } else {
    return NextResponse.json({ error: "messages or message is required" }, { status: 400 });
  }

  // Parse instance config
  let config: InstanceConfig = { ...DEFAULT_CONFIG };
  if (instance.config) {
    try {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(instance.config) };
    } catch {
      // use defaults
    }
  }

  // Determine provider + model
  const modelKey = config.model;
  const modelInfo = MODEL_MAP[modelKey] ?? { provider: "openrouter" as const, modelId: modelKey };
  const { provider, modelId } = modelInfo;

  // Load all credentials for this instance
  const credRows = await prisma.instanceCredential.findMany({
    where: { instanceId: id },
  });

  const credMap: Record<string, string> = {};
  for (const row of credRows) {
    try {
      credMap[row.key] = decrypt(row.value);
    } catch {
      // skip malformed
    }
  }

  // Find the right credential — try primary provider first, then fallbacks
  const providerOrder: Array<"openai" | "anthropic" | "openrouter"> = [
    provider,
    ...(["openai", "anthropic", "openrouter"] as const).filter((p) => p !== provider),
  ];

  let resolvedProvider: string | null = null;
  let resolvedApiKey: string | null = null;
  let resolvedModelId = modelId;

  for (const p of providerOrder) {
    const credKey = CREDENTIAL_KEY_FOR_PROVIDER[p];
    if (credMap[credKey]) {
      resolvedProvider = p;
      resolvedApiKey = credMap[credKey];
      // Remap model if we're using a fallback provider
      if (p !== provider) {
        if (p === "openrouter") {
          resolvedModelId = modelKey; // pass as-is and let OpenRouter handle it
        } else if (p === "openai") {
          resolvedModelId = "gpt-4o";
        } else if (p === "anthropic") {
          resolvedModelId = "claude-3-haiku-20240307";
        }
      }
      break;
    }
  }

  if (!resolvedProvider || !resolvedApiKey) {
    return NextResponse.json(
      {
        error: "No API key configured for this instance.",
        missingCredential: true,
        requiredKey: CREDENTIAL_KEY_FOR_PROVIDER[provider],
      },
      { status: 400 }
    );
  }

  // Build message array with system prompt prepended (for OpenAI/OpenRouter)
  const fullMessages: ChatMessage[] = [
    { role: "system", content: config.systemPrompt },
    ...messages,
  ];

  const startMs = Date.now();
  let responseText: string;

  try {
    if (resolvedProvider === "anthropic") {
      responseText = await callAnthropic(resolvedApiKey, resolvedModelId, fullMessages, config);
    } else if (resolvedProvider === "openrouter") {
      responseText = await callOpenAI(
        resolvedApiKey,
        resolvedModelId,
        fullMessages,
        config,
        "https://openrouter.ai/api/v1"
      );
    } else {
      // openai
      responseText = await callOpenAI(resolvedApiKey, resolvedModelId, fullMessages, config);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const latencyMs = Date.now() - startMs;

  // Log to activity log
  try {
    await prisma.activityLog.create({
      data: {
        instanceId: id,
        event: "chat_message",
        details: `Model: ${resolvedModelId}, provider: ${resolvedProvider}, latency: ${latencyMs}ms`,
      },
    });
  } catch {
    // Non-fatal — don't fail the response
  }

  return NextResponse.json({
    response: responseText,
    latencyMs,
    model: resolvedModelId,
    provider: resolvedProvider,
  });
}
