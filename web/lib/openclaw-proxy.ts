/**
 * openclaw-proxy.ts
 *
 * Proxies chat requests to a client's real OpenClaw VPS when provisioned.
 * Falls back to direct LLM call if the VPS is unreachable.
 *
 * OpenClaw exposes an OpenAI-compatible API at:
 *   POST <vpsUrl>/api/v1/chat/completions
 * Auth: Authorization: Bearer <gatewayToken>
 */

import { ChatMessage, InstanceConfig, LLMResult } from "@/lib/llm";

interface AiInstanceVps {
  vpsUrl: string;
  gatewayToken: string;
}

interface OpenAICompatResponse {
  choices?: Array<{
    message?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  model?: string;
}

/**
 * Proxy a chat request to the client's OpenClaw VPS.
 *
 * Returns an LLMResult on success, or throws so the caller can fall back.
 */
export async function callOpenClawVps(
  instance: AiInstanceVps,
  messages: ChatMessage[],
  config: InstanceConfig
): Promise<LLMResult> {
  const url = `${instance.vpsUrl.replace(/\/$/, "")}/api/v1/chat/completions`;

  const startMs = Date.now();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${instance.gatewayToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: false,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenClaw VPS returned ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data: OpenAICompatResponse = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  return {
    response: content,
    latencyMs: Date.now() - startMs,
    model: data.model ?? config.model,
    provider: "openclaw",
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
  };
}
