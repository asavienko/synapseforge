export interface Instance {
  id: string;
  name: string;
  type: string;
  status: string;
  tier: string;
  description?: string;
  config?: string;
  createdAt: string;
  updatedAt: string;
  healthStatus?: string | null;
  lastCheckedAt?: string | null;
  lastBackupAt?: string | null;
  hasGateway?: boolean;
  configSynced?: boolean;
  syncRequested?: boolean;
  provisionStatus?: string | null;
  vpsProvider?: string | null;
  telegramBotUsername?: string | null;
  discordBotUsername?: string | null;
  slackBotName?: string | null;
  slackTeamName?: string | null;
  currentVersion?: string | null;
  autoUpdate?: boolean;
  sandboxMode?: boolean;
  sandboxUsed?: number;
}

export interface CredentialRow {
  key: string;
  maskedValue: string;
  updatedAt: string;
}

export interface HealthCheckRow {
  id: string;
  status: string;
  responseMs?: number | null;
  error?: string | null;
  checkedAt: string;
}

export interface SnapshotRow {
  id: string;
  snapshotId: string;
  sizeBytes?: number | null;
  healthy: boolean;
  label?: string | null;
  createdAt: string;
}

export interface CommandRow {
  id: string;
  type: string;
  status: string;
  payload?: string | null;
  note?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMsg?: string | null;
}

export interface HealthData {
  healthStatus: string | null;
  lastCheckedAt: string | null;
  vpsUrl: string | null;
  provisionStatus: string | null;
  uptimePercentage: number | null;
  totalChecks: number | null;
  liveCheck: { healthy: boolean; latencyMs: number; error?: string } | null;
  checks: HealthCheckRow[];
}

export interface SnapshotsData {
  lastBackupAt: string | null;
  snapshots: SnapshotRow[];
}

export interface Config {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  agentName: string;
  role: string;
  traits: string[];
  customInstructions: string;
  businessName: string;
  businessContext: string;
  memoryEnabled: boolean;
  thinking: "adaptive" | "off";
  language: string;
  sandboxMode?: boolean;
}

export interface ApiKeyRow {
  id: string;
  name: string;
  preview: string;
  createdAt: string;
  lastUsedAt?: string;
  key?: string;
}

export interface LogRow {
  id: string;
  event: string;
  details?: string;
  createdAt: string;
}

export interface GatewayStatus {
  connected: boolean;
  latencyMs?: number;
  httpStatus?: number;
  error?: string;
  vpsUrl?: string;
  reason?: string;
}

export interface ChatMsg {
  id?: string;
  role: "user" | "assistant";
  content: string;
  latencyMs?: number;
  isError?: boolean;
  source?: string;
  createdAt?: string;
  provider?: string;
}

export interface UsageData {
  totalMessages: number;
  messagesThisMonth: number;
  todayMessages: number;
  avgLatencyMs: number | null;
  topModel: string | null;
  modelCounts: Record<string, number>;
  modelBreakdown: { model: string; messages: number; inputTokens: number; outputTokens: number; totalTokens: number }[];
  daily: { date: string; count: number; tokens: number }[];
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  monthTokens: number;
  estimatedCostUsd: number;
  estimatedCostUsdThisMonth: number;
  sourceCounts: Record<string, number>;
}

export interface UserCredential {
  id: string;
  provider: "openai" | "anthropic" | "openrouter";
  lastFour: string;
  createdAt: string;
}

export const TABS = ["Overview", "Credentials", "Deploy", "Chat", "Configuration", "Knowledge", "API Keys", "Webhooks", "Activity Log", "Insights", "Infrastructure", "Embed", "Analytics"] as const;
export type Tab = (typeof TABS)[number];

export const DEFAULT_CONFIG: Config = {
  model: "openai/gpt-4o",
  systemPrompt: "You are a helpful AI assistant.",
  temperature: 0.7,
  maxTokens: 1024,
  agentName: "",
  role: "",
  traits: [],
  customInstructions: "",
  businessName: "",
  businessContext: "",
  memoryEnabled: true,
  thinking: "adaptive",
  language: "English",
};

export const LOG_ICONS: Record<string, { icon: string; color: string }> = {
  started: { icon: "▶️", color: "text-emerald-400" },
  stopped: { icon: "⏹️", color: "text-zinc-400" },
  config_changed: { icon: "⚙️", color: "text-blue-400" },
  key_generated: { icon: "🔑", color: "text-violet-400" },
  key_revoked: { icon: "❌", color: "text-red-400" },
  created: { icon: "🆕", color: "text-violet-400" },
  deleted: { icon: "❌", color: "text-red-400" },
  chat_message: { icon: "💬", color: "text-sky-400" },
  config_synced: { icon: "🔄", color: "text-blue-400" },
  health_check: { icon: "💓", color: "text-rose-400" },
  provision_start: { icon: "⚙️", color: "text-amber-400" },
  provision_done: { icon: "⚙️", color: "text-emerald-400" },
  provision_failed: { icon: "❌", color: "text-red-400" },
  error: { icon: "❌", color: "text-red-400" },
};

export const CREDENTIAL_KEY_LABELS: Record<string, string> = {
  openai_api_key: "OpenAI API Key",
  anthropic_api_key: "Anthropic API Key",
  openrouter_api_key: "OpenRouter API Key",
  telegram_bot_token: "Telegram Bot Token",
  discord_bot_token: "Discord Bot Token",
  slack_app_token: "Slack App Token",
  slack_bot_token: "Slack Bot Token",
  gateway_token: "Gateway Token",
};

export const ALLOWED_CREDENTIAL_KEYS = [
  "openai_api_key",
  "anthropic_api_key",
  "openrouter_api_key",
  "telegram_bot_token",
  "discord_bot_token",
  "slack_app_token",
  "slack_bot_token",
  "twilio_account_sid",
  "twilio_auth_token",
  "twilio_whatsapp_number",
  "github_token",
  "yelp_api_key",
] as const;

export const LLM_CRED_KEYS = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
