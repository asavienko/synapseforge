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

export function generateOpenClawConfig(
  config: InstanceConfig,
  creds: CredentialMap
): string {
  // Build env section
  const envEntries: string[] = [];
  if (creds.openai_api_key) envEntries.push(`OPENAI_API_KEY: "${creds.openai_api_key}"`);
  if (creds.anthropic_api_key) envEntries.push(`ANTHROPIC_API_KEY: "${creds.anthropic_api_key}"`);
  if (creds.openrouter_api_key) envEntries.push(`OPENROUTER_API_KEY: "${creds.openrouter_api_key}"`);
  if (creds.telegram_bot_token) envEntries.push(`TELEGRAM_BOT_TOKEN: "${creds.telegram_bot_token}"`);
  if (creds.discord_bot_token) envEntries.push(`DISCORD_BOT_TOKEN: "${creds.discord_bot_token}"`);
  if (creds.slack_app_token) envEntries.push(`SLACK_APP_TOKEN: "${creds.slack_app_token}"`);
  if (creds.slack_bot_token) envEntries.push(`SLACK_BOT_TOKEN: "${creds.slack_bot_token}"`);
  envEntries.push(`OPENCLAW_GATEWAY_TOKEN: "${creds.gateway_token}"`);

  // Build channels section
  const channelParts: string[] = [];

  if (creds.telegram_bot_token) {
    channelParts.push(`    telegram: {
      enabled: true,
      botToken: "\${TELEGRAM_BOT_TOKEN}",
      dmPolicy: "pairing",
    }`);
  }

  if (creds.discord_bot_token) {
    channelParts.push(`    discord: {
      enabled: true,
      token: "\${DISCORD_BOT_TOKEN}",
    }`);
  }

  if (creds.slack_app_token && creds.slack_bot_token) {
    channelParts.push(`    slack: {
      enabled: true,
      mode: "socket",
      appToken: "\${SLACK_APP_TOKEN}",
      botToken: "\${SLACK_BOT_TOKEN}",
    }`);
  }

  // Escape special chars in systemPrompt
  const escapedPrompt = config.systemPrompt
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");

  return `{
  env: {
${envEntries.map(e => `    ${e}`).join(",\n")},
  },

  agents: {
    defaults: {
      model: { primary: "${config.model}" },
      systemPrompt: "${escapedPrompt}",
      thinking: "adaptive",
    },
  },

  channels: {
${channelParts.join(",\n")},
  },

  gateway: {
    bind: "lan",
    port: 18789,
    auth: {
      mode: "token",
      token: "\${OPENCLAW_GATEWAY_TOKEN}",
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
