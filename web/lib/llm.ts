/**
 * Shared LLM routing logic.
 * Used by both the internal /api/instances/[id]/chat route
 * and the public /api/v1/chat endpoint.
 */

import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText, StreamTextResult, ToolSet, LanguageModel } from "ai";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface InstanceConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  /** Platform API key injected for sandbox mode — not stored in DB */
  sandboxApiKey?: string;
}

export const DEFAULT_CONFIG: InstanceConfig = {
  model: "gpt-4o",
  systemPrompt: "You are a helpful AI assistant.",
  temperature: 0.7,
  maxTokens: 1024,
};

// Map our short model names to provider + canonical model ID
export const MODEL_MAP: Record<string, { provider: "openai" | "anthropic" | "openrouter"; modelId: string }> = {
  "gpt-4o":            { provider: "openai",    modelId: "gpt-4o" },
  "gpt-4-turbo":       { provider: "openai",    modelId: "gpt-4-turbo" },
  "gpt-3.5-turbo":     { provider: "openai",    modelId: "gpt-3.5-turbo" },
  "gpt-4o-mini":       { provider: "openai",    modelId: "gpt-4o-mini" },
  "claude-3-5-sonnet": { provider: "anthropic", modelId: "claude-3-5-sonnet-20241022" },
  "claude-3-haiku":    { provider: "anthropic", modelId: "claude-3-haiku-20240307" },
  "claude-3-opus":     { provider: "anthropic", modelId: "claude-3-opus-20240229" },
  "gemini-1.5-pro":    { provider: "openrouter", modelId: "google/gemini-1.5-pro" },
  "llama-3-70b":       { provider: "openrouter", modelId: "meta-llama/llama-3-70b-instruct" },
  // Handle prefixed model names from openclaw-config.ts MODEL_OPTIONS
  "openai/gpt-4o":                 { provider: "openai",    modelId: "gpt-4o" },
  "openai/gpt-4o-mini":            { provider: "openai",    modelId: "gpt-4o-mini" },
  "openai/gpt-4-turbo":            { provider: "openai",    modelId: "gpt-4-turbo" },
  "anthropic/claude-sonnet-4-6":   { provider: "anthropic", modelId: "claude-sonnet-4-6" },
  "anthropic/claude-haiku-4-5":    { provider: "anthropic", modelId: "claude-haiku-4-5" },
  "anthropic/claude-opus-4-6":     { provider: "anthropic", modelId: "claude-opus-4-6" },
  "openrouter/anthropic/claude-sonnet-4-5": { provider: "openrouter", modelId: "anthropic/claude-sonnet-4-5" },
  "openrouter/openai/gpt-4o":      { provider: "openrouter", modelId: "openai/gpt-4o" },
  "openrouter/meta-llama/llama-3.3-70b-instruct": { provider: "openrouter", modelId: "meta-llama/llama-3.3-70b-instruct" },
};

const CRED_KEY_FOR_PROVIDER: Record<string, string> = {
  openai:     "openai_api_key",
  anthropic:  "anthropic_api_key",
  openrouter: "openrouter_api_key",
};

export interface LLMResult {
  response: string;
  latencyMs: number;
  model: string;
  provider: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface LLMError {
  error: string;
  missingCredential?: boolean;
  requiredKey?: string;
}

// ─── Credential resolution ────────────────────────────────────────────────────

type CredentialResult =
  | { ok: true; resolvedProvider: "openai" | "anthropic" | "openrouter"; resolvedModelId: string; resolvedApiKey: string }
  | { ok: false; error: LLMError };

/**
 * Resolves the provider, model ID, and API key for a given instance + config.
 * Tries instance credentials first, then falls back to user's global credential vault.
 */
export async function resolveCredentials(
  instanceId: string,
  config: InstanceConfig,
): Promise<CredentialResult> {
  // Sandbox mode: platform injects its own API key — bypass DB credential lookup
  if (config.sandboxApiKey) {
    return {
      ok: true,
      resolvedProvider: "openai",
      resolvedModelId: "gpt-4o-mini",
      resolvedApiKey: config.sandboxApiKey,
    };
  }

  // Get instance and user ID
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { userId: true },
  });
  if (!instance) {
    return {
      ok: false,
      error: { error: "Instance not found." },
    };
  }

  // Read instance-level credentials
  const credRows = await prisma.instanceCredential.findMany({ where: { instanceId } });
  const credMap: Record<string, string> = {};
  for (const row of credRows) {
    try { credMap[row.key] = decrypt(row.value); } catch { /* skip malformed */ }
  }

  // Fallback: read from user's global credential vault for LLM keys
  const userCreds = await prisma.userCredential.findMany({ where: { userId: instance.userId } });
  const USER_CRED_MAP: Record<string, string> = {
    openai: "openai_api_key",
    anthropic: "anthropic_api_key",
    openrouter: "openrouter_api_key",
  };
  for (const uc of userCreds) {
    const keyName = USER_CRED_MAP[uc.provider];
    if (keyName && !credMap[keyName]) {
      try { credMap[keyName] = decrypt(uc.encryptedKey); } catch { /* skip malformed */ }
    }
  }

  const modelKey = config.model;
  const modelInfo = MODEL_MAP[modelKey] ?? { provider: "openrouter" as const, modelId: modelKey };
  const { provider, modelId } = modelInfo;

  // Try primary provider first, then fallbacks
  const providerOrder: Array<"openai" | "anthropic" | "openrouter"> = [
    provider as "openai" | "anthropic" | "openrouter",
    ...["openai", "anthropic", "openrouter"].filter((p) => p !== provider) as Array<"openai" | "anthropic" | "openrouter">,
  ];

  let resolvedProvider: "openai" | "anthropic" | "openrouter" | null = null;
  let resolvedApiKey: string | null = null;
  let resolvedModelId = modelId;

  for (const p of providerOrder) {
    const credKey = CRED_KEY_FOR_PROVIDER[p];
    if (credMap[credKey]) {
      resolvedProvider = p;
      resolvedApiKey = credMap[credKey];
      if (p !== provider) {
        if (p === "openai") resolvedModelId = "gpt-4o";
        else if (p === "anthropic") resolvedModelId = "claude-3-haiku-20240307";
        else resolvedModelId = modelKey;
      }
      break;
    }
  }

  if (!resolvedProvider || !resolvedApiKey) {
    return {
      ok: false,
      error: {
        error: "No API key configured for this instance.",
        missingCredential: true,
        requiredKey: CRED_KEY_FOR_PROVIDER[provider],
      },
    };
  }

  return { ok: true, resolvedProvider, resolvedModelId, resolvedApiKey };
}

// ─── Provider call helpers (non-streaming, used by callLLM) ──────────────────

async function callOpenAI(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  config: InstanceConfig,
  baseUrl = "https://api.openai.com/v1"
): Promise<{ text: string; inputTokens?: number; outputTokens?: number }> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
    throw new Error(`OpenAI error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return {
    text: data.choices?.[0]?.message?.content ?? "",
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
  };
}

async function callAnthropic(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  config: InstanceConfig
): Promise<{ text: string; inputTokens?: number; outputTokens?: number }> {
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
    throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return {
    text: data.content?.[0]?.text ?? "",
    inputTokens: data.usage?.input_tokens,
    outputTokens: data.usage?.output_tokens,
  };
}

// ─── Non-streaming call (used by public /api/v1/chat) ────────────────────────

export async function callLLM(
  instanceId: string,
  messages: ChatMessage[],
  configOverride?: Partial<InstanceConfig>
): Promise<LLMResult | LLMError> {
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { config: true },
  });

  let config: InstanceConfig = { ...DEFAULT_CONFIG };
  if (instance?.config) {
    try { config = { ...DEFAULT_CONFIG, ...JSON.parse(instance.config) }; } catch { /* defaults */ }
  }
  if (configOverride) config = { ...config, ...configOverride };

  const credResult = await resolveCredentials(instanceId, config);
  if (!credResult.ok) {
    const { error } = credResult as { ok: false; error: LLMError };
    return error;
  }

  const { resolvedProvider, resolvedModelId, resolvedApiKey } = credResult;

  const fullMessages: ChatMessage[] = [
    { role: "system", content: config.systemPrompt },
    ...messages,
  ];

  const startMs = Date.now();
  let result: { text: string; inputTokens?: number; outputTokens?: number };

  try {
    if (resolvedProvider === "anthropic") {
      result = await callAnthropic(resolvedApiKey, resolvedModelId, fullMessages, config);
    } else if (resolvedProvider === "openrouter") {
      result = await callOpenAI(resolvedApiKey, resolvedModelId, fullMessages, config, "https://openrouter.ai/api/v1");
    } else {
      result = await callOpenAI(resolvedApiKey, resolvedModelId, fullMessages, config);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }

  return {
    response: result.text,
    latencyMs: Date.now() - startMs,
    model: resolvedModelId,
    provider: resolvedProvider,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  };
}

// ─── Streaming call (used by dashboard /api/instances/[id]/chat) ──────────────

export interface StreamLLMOptions {
  instanceId: string;
  messages: ChatMessage[];
  config: InstanceConfig;
  apiKey: string;
  provider: "openai" | "anthropic" | "openrouter";
  modelId: string;
  onFinish?: (result: { text: string; inputTokens: number; outputTokens: number }) => Promise<void>;
}

export function streamLLM({
  messages,
  config,
  apiKey,
  provider,
  modelId,
  onFinish,
}: StreamLLMOptions): StreamTextResult<ToolSet, never> {
  const systemPrompt = config.systemPrompt || DEFAULT_CONFIG.systemPrompt;

  const aiMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  let model: LanguageModel;

  if (provider === "openai") {
    const openaiProvider = createOpenAI({ apiKey });
    model = openaiProvider(modelId);
  } else if (provider === "anthropic") {
    const anthropicProvider = createAnthropic({ apiKey });
    model = anthropicProvider(modelId);
  } else {
    const openrouterProvider = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    });
    model = openrouterProvider(modelId);
  }

  return streamText({
    model,
    system: systemPrompt,
    messages: aiMessages,
    temperature: config.temperature ?? 0.7,
    maxOutputTokens: config.maxTokens ?? 1024,
    onFinish: onFinish
      ? async ({ text, usage }) => {
          await onFinish({
            text,
            inputTokens: usage.inputTokens ?? 0,
            outputTokens: usage.outputTokens ?? 0,
          });
        }
      : undefined,
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parseInstanceConfig(configJson: string | null | undefined): InstanceConfig {
  if (!configJson) return { ...DEFAULT_CONFIG };
  try { return { ...DEFAULT_CONFIG, ...JSON.parse(configJson) }; } catch { return { ...DEFAULT_CONFIG }; }
}
