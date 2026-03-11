// Supported providers
export type LLMProvider = "openai" | "anthropic" | "openrouter";

// Supported channels
export type ChannelType = "telegram" | "discord" | "slack";

// Template presets
export type InstanceTemplate = "general" | "customer_support" | "faq_bot" | "lead_qualification";

export interface InstanceConfig {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  template?: InstanceTemplate;
}

export interface CredentialMap {
  openai_api_key?: string;
  anthropic_api_key?: string;
  openrouter_api_key?: string;
  telegram_bot_token?: string;
  discord_bot_token?: string;
  slack_app_token?: string;
  slack_bot_token?: string;
  gateway_token: string;
}

/**
 * Generates openclaw.json config (valid JSON, not JSON5) for a deployed VPS.
 *
 * Key design decisions:
 * - Uses JSON.stringify for safe serialization — no injection via special chars in tokens
 * - LLM API keys go in `env` section so OpenAI/Anthropic SDKs pick them up via process.env
 * - Channel tokens go directly in channel config
 * - dmPolicy: "open" — business bots must be reachable without QR code pairing
 * - gateway.auth.token set directly (OPENCLAW_GATEWAY_TOKEN env var is also set in
 *   docker-compose as a backup/override)
 */
export function generateOpenClawConfig(
  config: InstanceConfig,
  creds: CredentialMap
): string {
  // Build env section for LLM keys
  const env: Record<string, string> = {};
  if (creds.openai_api_key) env.OPENAI_API_KEY = creds.openai_api_key;
  if (creds.anthropic_api_key) env.ANTHROPIC_API_KEY = creds.anthropic_api_key;
  if (creds.openrouter_api_key) env.OPENROUTER_API_KEY = creds.openrouter_api_key;

  // Build channels section
  const channels: Record<string, unknown> = {};

  if (creds.telegram_bot_token) {
    channels.telegram = {
      enabled: true,
      botToken: creds.telegram_bot_token,
      // "open" = anyone can message the bot without QR code pairing
      // Required for deployed business bots (pairing is for personal use only)
      dmPolicy: "open",
      groups: {
        // Allow all groups the bot is added to
        "*": { requireMention: false, groupPolicy: "open" },
      },
    };
  }

  if (creds.discord_bot_token) {
    channels.discord = {
      enabled: true,
      token: creds.discord_bot_token,
    };
  }

  if (creds.slack_app_token) {
    channels.slack = {
      enabled: true,
      mode: "socket",
      appToken: creds.slack_app_token,
      ...(creds.slack_bot_token ? { botToken: creds.slack_bot_token } : {}),
    };
  }

  const configObj = {
    ...(Object.keys(env).length > 0 ? { env } : {}),

    agents: {
      defaults: {
        model: { primary: config.model },
        systemPrompt: config.systemPrompt,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        thinking: "adaptive",
      },
    },

    ...(Object.keys(channels).length > 0 ? { channels } : {}),

    gateway: {
      bind: "lan",
      port: 18789,
      auth: {
        mode: "token",
        token: creds.gateway_token,
      },
      http: {
        endpoints: {
          chatCompletions: { enabled: true },
        },
      },
    },
  };

  return JSON.stringify(configObj, null, 2);
}

export const TEMPLATE_PROMPTS: Record<InstanceTemplate, string> = {
  general: "You are a helpful AI assistant. Answer questions clearly and concisely.",
  customer_support: "You are a friendly customer support agent. Help customers resolve their issues efficiently and empathetically. If you cannot resolve an issue, escalate to a human agent.",
  faq_bot: "You are a FAQ bot. Answer questions based on your knowledge base. If a question is outside your knowledge, say so clearly and offer to connect them with a human.",
  lead_qualification: "You are a sales assistant. Your job is to qualify leads by understanding their needs, budget, and timeline. Ask relevant questions and gather contact information for follow-up.",
};

export const MODEL_OPTIONS: Record<LLMProvider, { value: string; label: string }[]> = {
  openai: [
    { value: "openai/gpt-4o", label: "GPT-4o (recommended)" },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini (fast, cheap)" },
    { value: "openai/gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  anthropic: [
    { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6 (recommended)" },
    { value: "anthropic/claude-haiku-4-5", label: "Claude Haiku 4.5 (fast, cheap)" },
    { value: "anthropic/claude-opus-4-6", label: "Claude Opus 4.6 (most capable)" },
  ],
  openrouter: [
    { value: "openrouter/anthropic/claude-sonnet-4-5", label: "Claude Sonnet via OpenRouter" },
    { value: "openrouter/openai/gpt-4o", label: "GPT-4o via OpenRouter" },
    { value: "openrouter/meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B (free tier)" },
  ],
};
