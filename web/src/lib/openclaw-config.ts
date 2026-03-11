// Supported providers
export type LLMProvider = "openai" | "anthropic" | "openrouter";

// Supported channels
export type ChannelType = "telegram" | "discord" | "slack";

// Template presets
export type InstanceTemplate = "general" | "customer_support" | "faq_bot" | "lead_qualification";

export interface InstanceConfig {
  // From AIInstance.config JSON
  model: string;           // e.g. "openai/gpt-4o"
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  template?: InstanceTemplate;
}

export interface CredentialMap {
  // LLM
  openai_api_key?: string;
  anthropic_api_key?: string;
  openrouter_api_key?: string;
  // Channels
  telegram_bot_token?: string;
  discord_bot_token?: string;
  slack_app_token?: string;
  slack_bot_token?: string;
  // Gateway
  gateway_token: string;  // Always set
}

/**
 * Generates openclaw.json5 config for a deployed VPS instance.
 *
 * Key design decisions:
 * - LLM API keys go in `env:` so OpenAI/Anthropic SDKs pick them up automatically
 * - Channel tokens (Telegram, Discord, Slack) are set directly in the channel config
 * - Gateway token is set directly in gateway.auth.token (not via env)
 * - dmPolicy is "open" for all channels — business bots must be reachable by customers
 *   without requiring QR code pairing (pairing is for personal use only)
 */
export function generateOpenClawConfig(
  config: InstanceConfig,
  creds: CredentialMap
): string {
  // Build env section (LLM API keys only — SDKs read these from env)
  const envLines: string[] = [];
  if (creds.openai_api_key) envLines.push(`    OPENAI_API_KEY: "${esc(creds.openai_api_key)}"`);
  if (creds.anthropic_api_key) envLines.push(`    ANTHROPIC_API_KEY: "${esc(creds.anthropic_api_key)}"`);
  if (creds.openrouter_api_key) envLines.push(`    OPENROUTER_API_KEY: "${esc(creds.openrouter_api_key)}"`);

  // Build channels section — use direct token values, not env var references
  const channelParts: string[] = [];

  if (creds.telegram_bot_token) {
    channelParts.push(`    telegram: {
      enabled: true,
      botToken: "${esc(creds.telegram_bot_token)}",
      // open: anyone can message the bot (required for deployed business bots)
      dmPolicy: "open",
      groups: {
        // Allow all groups the bot is added to
        "*": { requireMention: false, groupPolicy: "open" },
      },
    }`);
  }

  if (creds.discord_bot_token) {
    channelParts.push(`    discord: {
      enabled: true,
      token: "${esc(creds.discord_bot_token)}",
    }`);
  }

  if (creds.slack_app_token && creds.slack_bot_token) {
    channelParts.push(`    slack: {
      enabled: true,
      mode: "socket",
      appToken: "${esc(creds.slack_app_token)}",
      botToken: "${esc(creds.slack_bot_token)}",
    }`);
  } else if (creds.slack_app_token) {
    // OAuth / Web API flow with just app token
    channelParts.push(`    slack: {
      enabled: true,
      mode: "socket",
      appToken: "${esc(creds.slack_app_token)}",
    }`);
  }

  // Escape special chars in systemPrompt for JSON5 string
  const escapedPrompt = config.systemPrompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");

  const envSection = envLines.length > 0
    ? `  env: {\n${envLines.join(",\n")},\n  },\n\n`
    : "";

  const channelsSection = channelParts.length > 0
    ? `  channels: {\n${channelParts.join(",\n")},\n  },\n\n`
    : "";

  return `{
${envSection}  agents: {
    defaults: {
      model: { primary: "${esc(config.model)}" },
      systemPrompt: "${escapedPrompt}",
      temperature: ${config.temperature},
      maxTokens: ${config.maxTokens},
      thinking: "adaptive",
    },
  },

${channelsSection}  gateway: {
    bind: "lan",
    port: 18789,
    auth: {
      mode: "token",
      token: "${esc(creds.gateway_token)}",
    },
    http: {
      endpoints: {
        chatCompletions: { enabled: true },
      },
    },
  },
}
`;
}

/** Escape a string value for embedding in a JSON5 quoted string */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
