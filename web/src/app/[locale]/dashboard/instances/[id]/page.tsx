"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bot, ArrowLeft, Play, Square, Trash2, Loader2,
  Settings2, Key, Activity, Copy, Check, Eye, EyeOff,
  Plus, X, Zap, AlertCircle, Terminal, Server, Database,
  Wifi, WifiOff, MessageSquare, Send, ShieldCheck, Download,
  Pencil, Trash,
} from "lucide-react";
import Link from "next/link";
import { STATUS_COLORS, INSTANCE_TYPES, formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Instance {
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
}

interface CredentialRow {
  key: string;
  maskedValue: string;
  updatedAt: string;
}

interface HealthCheckRow {
  id: string;
  status: string;
  responseMs?: number | null;
  error?: string | null;
  checkedAt: string;
}

interface SnapshotRow {
  id: string;
  snapshotId: string;
  sizeBytes?: number | null;
  healthy: boolean;
  createdAt: string;
}

interface HealthData {
  healthStatus: string | null;
  lastCheckedAt: string | null;
  vpsUrl: string | null;
  provisionStatus: string | null;
  liveCheck: { healthy: boolean; latencyMs: number; error?: string } | null;
  checks: HealthCheckRow[];
}

interface SnapshotsData {
  lastBackupAt: string | null;
  snapshots: SnapshotRow[];
}

interface Config {
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

interface ApiKeyRow {
  id: string;
  name: string;
  preview: string;
  createdAt: string;
  lastUsedAt?: string;
  key?: string; // only present right after creation
}

interface LogRow {
  id: string;
  event: string;
  details?: string;
  createdAt: string;
}

interface GatewayStatus {
  connected: boolean;
  latencyMs?: number;
  httpStatus?: number;
  error?: string;
  vpsUrl?: string;
  reason?: string;
}

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  { value: "llama-3-70b", label: "Llama 3 70B" },
];

const DEFAULT_CONFIG: Config = {
  model: "gpt-4o",
  systemPrompt: "You are a helpful AI assistant.",
  temperature: 0.7,
  maxTokens: 1024,
};

const LOG_ICONS: Record<string, { icon: string; color: string }> = {
  started:        { icon: "▶", color: "text-emerald-400" },
  stopped:        { icon: "■", color: "text-zinc-400" },
  config_changed: { icon: "⚙", color: "text-blue-400" },
  key_generated:  { icon: "🔑", color: "text-violet-400" },
  key_revoked:    { icon: "✕", color: "text-red-400" },
  created:        { icon: "✦", color: "text-violet-400" },
  deleted:        { icon: "✕", color: "text-red-400" },
  chat_message:   { icon: "💬", color: "text-sky-400" },
};

const TABS = ["Overview", "Chat", "Deploy", "Configuration", "API Keys", "Activity Log", "Infrastructure", "Credentials"] as const;
type Tab = (typeof TABS)[number];

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  latencyMs?: number;
  isError?: boolean;
}

const CREDENTIAL_KEY_LABELS: Record<string, string> = {
  openai_api_key: "OpenAI API Key",
  anthropic_api_key: "Anthropic API Key",
  openrouter_api_key: "OpenRouter API Key",
  telegram_bot_token: "Telegram Bot Token",
  discord_bot_token: "Discord Bot Token",
  slack_app_token: "Slack App Token",
  slack_bot_token: "Slack Bot Token",
  gateway_token: "Gateway Token",
};

const ALLOWED_CREDENTIAL_KEYS = [
  "openai_api_key",
  "anthropic_api_key",
  "openrouter_api_key",
  "telegram_bot_token",
  "discord_bot_token",
  "slack_app_token",
  "slack_bot_token",
] as const;

// ─── Deploy Tab Component ─────────────────────────────────────────────────────

interface DeployTabProps {
  instance: Instance;
  credentials: CredentialRow[];
  credsLoading: boolean;
  deploying: boolean;
  deployError: string | null;
  syncing: boolean;
  syncDone: boolean;
  onDeploy: () => void;
  onSync: () => void;
  onGoToCredentials: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string) => string;
}

function DeployTab({
  instance,
  credentials,
  credsLoading,
  deploying,
  deployError,
  syncing,
  syncDone,
  onDeploy,
  onSync,
  onGoToCredentials,
  t,
}: DeployTabProps) {
  const credKeys = credentials.map((c) => c.key);
  const hasLLM = credKeys.some((k) => ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(k));
  const hasTelegram = credKeys.includes("telegram_bot_token");
  const hasDiscord = credKeys.includes("discord_bot_token");
  const hasSlack = credKeys.includes("slack_app_token") || credKeys.includes("slack_bot_token");
  const hasChannel = hasTelegram || hasDiscord || hasSlack;

  const isProvisioning = instance.provisionStatus === "provisioning";
  const isReady = instance.hasGateway && (instance.provisionStatus === "ready" || (instance.hasGateway && !isProvisioning));
  const isFailed = instance.provisionStatus === "failed";
  const isNotDeployed = !instance.hasGateway && !isProvisioning;

  const activeChannels = [
    hasTelegram && t("deploy.channelTelegram"),
    hasDiscord && t("deploy.channelDiscord"),
    hasSlack && t("deploy.channelSlack"),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {/* ── Not yet deployed ── */}
      {(isNotDeployed || isFailed) && (
        <>
          {/* Hero card */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Server className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{t("deploy.sectionTitle")}</h2>
                <p className="text-sm text-zinc-400">{t("deploy.sectionDesc")}</p>
              </div>
            </div>

            {/* Readiness checklist */}
            <div className="space-y-3 mb-6">
              {/* LLM check */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                hasLLM ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  hasLLM ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {hasLLM ? "✓" : "!"}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${hasLLM ? "text-emerald-300" : "text-red-300"}`}>
                    {t("deploy.checkLLM")}
                  </div>
                  {!hasLLM && (
                    <div className="text-xs text-zinc-500 mt-0.5">OpenAI, Anthropic or OpenRouter key required</div>
                  )}
                </div>
                {!hasLLM && (
                  <button
                    onClick={onGoToCredentials}
                    className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg transition-colors shrink-0"
                  >
                    Add key
                  </button>
                )}
              </div>

              {/* Channel check */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                hasChannel ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-800/50 border-white/5"
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  hasChannel ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-500"
                }`}>
                  {hasChannel ? "✓" : "○"}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${hasChannel ? "text-emerald-300" : "text-zinc-400"}`}>
                    {t("deploy.checkChannel")}
                  </div>
                  {hasChannel ? (
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {activeChannels.join(", ")}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-600 mt-0.5">
                      Add Telegram, Discord or Slack tokens to reach users on those platforms
                    </div>
                  )}
                </div>
                {!hasChannel && (
                  <button
                    onClick={onGoToCredentials}
                    className="text-xs text-zinc-500 hover:text-white bg-white/5 px-2 py-1 rounded-lg transition-colors shrink-0"
                  >
                    Add channel
                  </button>
                )}
              </div>
            </div>

            {/* Deploy error */}
            {(deployError || isFailed) && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-300">
                    {isFailed && !deployError ? t("deploy.failedTitle") : t("deploy.failedTitle")}
                  </div>
                  <div className="text-xs text-red-400/80 mt-0.5">{deployError ?? t("deploy.failedDesc")}</div>
                </div>
              </div>
            )}

            {/* Deploy button */}
            <button
              onClick={onDeploy}
              disabled={!hasLLM || deploying || credsLoading}
              data-testid="deploy-btn"
              className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-6 py-4 rounded-xl text-base font-semibold text-white"
            >
              {deploying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {t("deploy.deploying")}</>
              ) : (
                <><Zap className="w-5 h-5" /> {isFailed ? t("deploy.retryBtn") : t("deploy.deployBtn")}</>
              )}
            </button>

            {!hasLLM && (
              <p className="text-xs text-zinc-600 text-center mt-3">
                {t("deploy.notReadyDesc")}
              </p>
            )}
          </div>

          {/* What happens next */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-5">
            <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">What happens when you deploy</h3>
            <div className="space-y-3">
              {[
                { icon: "1", text: "A dedicated cloud server is provisioned in under 3 minutes" },
                { icon: "2", text: "OpenClaw is installed and configured with your credentials" },
                { icon: "3", text: "Your AI agent goes live on all configured channels (Telegram, Discord, Slack)" },
                { icon: "4", text: "When you update credentials, config syncs automatically within 5 minutes" },
              ].map((step) => (
                <div key={step.icon} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0 mt-0.5">
                    {step.icon}
                  </div>
                  <p className="text-sm text-zinc-400">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Provisioning in progress ── */}
      {isProvisioning && (
        <div className="glow-border rounded-2xl bg-white/[0.02] p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-5">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">{t("deploy.provisioningTitle")}</h2>
          <p className="text-zinc-400 text-sm mb-4">{t("deploy.provisioningDesc")}</p>
          <div className="flex items-center gap-2 bg-violet-500/5 border border-violet-500/10 rounded-xl px-4 py-3 text-xs text-zinc-500 justify-center">
            <Loader2 className="w-3 h-3 animate-spin" />
            {t("deploy.provisioningNote")}
          </div>
          <p className="text-xs text-zinc-600 mt-4">This page will update automatically when your agent is ready.</p>
        </div>
      )}

      {/* ── Live & running ── */}
      {isReady && (
        <div className="space-y-4">
          {/* Status card */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{t("deploy.runningTitle")}</h2>
                <p className="text-sm text-zinc-400">{t("deploy.runningDesc")}</p>
              </div>
              <span className="ml-auto text-xs px-3 py-1.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-5">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("deploy.serverLabel")}</div>
                <div className="text-zinc-300 font-mono text-xs">
                  {instance.hasGateway ? "Connected" : "—"}
                </div>
                {instance.tier && (
                  <div className="text-xs text-zinc-600 mt-1">
                    {{
                      minimal: "cx22 · 2 vCPU · 4 GB",
                      standard: "cx32 · 4 vCPU · 8 GB",
                      pro: "cx42 · 8 vCPU · 16 GB",
                    }[instance.tier] ?? instance.tier}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("deploy.channelsLabel")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeChannels.length > 0
                    ? activeChannels.map((ch) => (
                        <span key={ch} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                          {ch}
                        </span>
                      ))
                    : <span className="text-xs text-zinc-600">None configured</span>
                  }
                </div>
              </div>
            </div>

            {/* Config out of sync banner */}
            {instance.configSynced === false && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-sm text-amber-300 flex-1">{t("deploy.syncOutOfDate")}</span>
                <button
                  onClick={onSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                >
                  {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                  {syncing ? t("deploy.syncing") : t("deploy.syncNow")}
                </button>
              </div>
            )}

            {syncDone && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-300">
                <Check className="w-4 h-4" /> {t("deploy.syncDone")}
              </div>
            )}

            {/* Chat hint */}
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <MessageSquare className="w-3.5 h-3.5" />
              {t("deploy.chatAvailable")}
            </div>
          </div>

          {/* Channel integrations detail */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Connected integrations</h3>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { key: "telegram_bot_token", label: "Telegram", icon: "✈", desc: "Users can message your bot on Telegram" },
                { key: "discord_bot_token", label: "Discord", icon: "🎮", desc: "Bot joins your Discord server" },
                { key: "slack_app_token", label: "Slack", icon: "💬", desc: "Bot connects to your Slack workspace" },
              ].map(({ key, label, icon, desc }) => {
                const active = credKeys.includes(key);
                return (
                  <div key={key} className="flex items-center gap-4 p-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                      active ? "bg-violet-600/15 border border-violet-500/20" : "bg-zinc-800/50 border border-white/5"
                    }`}>
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${active ? "text-white" : "text-zinc-500"}`}>{label}</div>
                      <div className="text-xs text-zinc-600">{desc}</div>
                    </div>
                    {active ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={onGoToCredentials}
                        className="text-xs text-zinc-600 hover:text-white bg-white/5 px-2 py-1 rounded-lg transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InstanceDetailPage() {
  const t = useTranslations("instanceDetail");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("Overview");
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; type?: "success" | "error" } | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  // Config state
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [configDirty, setConfigDirty] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // API Keys state
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [keysLoading, setKeysLoading] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Logs state
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Usage stats state
  type UsageData = {
    totalMessages: number;
    messagesThisMonth: number;
    todayMessages: number;
    avgLatencyMs: number | null;
    topModel: string | null;
    modelCounts: Record<string, number>;
    modelBreakdown: { model: string; messages: number; inputTokens: number; outputTokens: number; totalTokens: number }[];
    daily: { date: string; count: number; tokens: number }[];
    // Tokens
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    monthTokens: number;
    // Cost
    estimatedCostUsd: number;
    estimatedCostUsdThisMonth: number;
    // Source breakdown
    sourceCounts: Record<string, number>;
  };
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Infrastructure state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [snapshotsData, setSnapshotsData] = useState<SnapshotsData | null>(null);
  const [infraLoading, setInfraLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resyncLoading, setResyncLoading] = useState(false);

  // Gateway status
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [checkingGateway, setCheckingGateway] = useState(false);

  // Test chat (legacy — infrastructure tab)
  const [chatMessage, setChatMessage] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatResponse, setChatResponse] = useState<{ text: string; latencyMs?: number } | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Deploy tab state
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  // Full chat tab state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatNoCredentials, setChatNoCredentials] = useState(false);
  const [chatProvider, setChatProvider] = useState<string | null>(null);
  const [inlineKeyValue, setInlineKeyValue] = useState("");
  const [inlineKeyProvider, setInlineKeyProvider] = useState<"openai" | "anthropic" | "openrouter">("openai");
  const [inlineKeySaving, setInlineKeySaving] = useState(false);
  const [inlineKeyError, setInlineKeyError] = useState("");
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Credentials state
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [credsLoading, setCredsLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingCred, setSavingCred] = useState(false);
  const [validatingCred, setValidatingCred] = useState(false);
  const [credValidState, setCredValidState] = useState<Record<string, "valid" | "invalid">>({});
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");
  const [configPreviewText, setConfigPreviewText] = useState<string | null>(null);
  const [configPreviewLoading, setConfigPreviewLoading] = useState(false);

  // Telegram setup state
  const [telegramTokenInput, setTelegramTokenInput] = useState("");
  const [telegramConnecting, setTelegramConnecting] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [telegramConnected, setTelegramConnected] = useState<{ username: string; name: string } | null>(null);

  // Sync request state
  const [syncRequesting, setSyncRequesting] = useState(false);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  const loadInstance = useCallback(async () => {
    const res = await fetch(`/api/instances/${id}`);
    if (!res.ok) { router.push("/dashboard/instances"); return; }
    const data = await res.json();
    setInstance(data);
    if (data.config) {
      try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(data.config) }); } catch {}
    }
    setLoading(false);
  }, [id, router]);

  const loadKeys = useCallback(async () => {
    setKeysLoading(true);
    const res = await fetch(`/api/instances/${id}/keys`);
    if (res.ok) setKeys(await res.json());
    setKeysLoading(false);
  }, [id]);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    const res = await fetch(`/api/instances/${id}/logs`);
    if (res.ok) setLogs(await res.json());
    setLogsLoading(false);
  }, [id]);

  const loadUsage = useCallback(async () => {
    if (!id) return;
    setUsageLoading(true);
    try {
      const res = await fetch(`/api/instances/${id}/usage`);
      if (res.ok) setUsageData(await res.json());
    } finally {
      setUsageLoading(false);
    }
  }, [id]);

  const loadInfra = useCallback(async () => {
    setInfraLoading(true);
    const [healthRes, snapshotsRes] = await Promise.all([
      fetch(`/api/instances/${id}/health`),
      fetch(`/api/instances/${id}/snapshots`),
    ]);
    if (healthRes.ok) setHealthData(await healthRes.json());
    if (snapshotsRes.ok) setSnapshotsData(await snapshotsRes.json());
    setInfraLoading(false);
  }, [id]);

  const loadCredentials = useCallback(async () => {
    setCredsLoading(true);
    const res = await fetch(`/api/instances/${id}/credentials`);
    if (res.ok) setCredentials(await res.json());
    setCredsLoading(false);
  }, [id]);

  useEffect(() => { loadInstance(); }, [loadInstance]);

  // Auto-poll while provisioning
  useEffect(() => {
    if (instance?.provisionStatus !== "provisioning") return;
    const interval = setInterval(() => { loadInstance(); }, 10000);
    return () => clearInterval(interval);
  }, [instance?.provisionStatus, loadInstance]);

  // Fetch admin status once on mount
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  // Poll health every 30s when on Infrastructure tab
  useEffect(() => {
    if (tab !== "Infrastructure") return;
    const pollHealth = async () => {
      const res = await fetch(`/api/instances/${id}/health`);
      if (res.ok) setHealthData(await res.json());
    };
    const interval = setInterval(pollHealth, 30_000);
    return () => clearInterval(interval);
  }, [tab, id]);

  const loadChatHistory = useCallback(async () => {
    if (chatHistoryLoaded) return;
    try {
      const res = await fetch(`/api/instances/${id}/chat`);
      if (res.ok) {
        const history = await res.json();
        if (Array.isArray(history) && history.length > 0) {
          setChatMessages(history.map((m: { role: string; content: string; isError?: boolean; latencyMs?: number; provider?: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            isError: m.isError ?? false,
            latencyMs: m.latencyMs,
            provider: m.provider,
          })));
          if (history[history.length - 1]?.provider) {
            setChatProvider(history[history.length - 1].provider);
          }
        }
      }
    } catch { /* ignore */ }
    setChatHistoryLoaded(true);
  }, [id, chatHistoryLoaded]);

  // Proactively detect missing LLM credentials when Chat tab opens
  useEffect(() => {
    if (tab !== "Chat" || chatHistoryLoaded) return;
    // If instance is running and no chat messages yet, check if LLM key exists
    // We fetch credentials (masked) and show the inline setup if none found
    fetch(`/api/instances/${id}/credentials`)
      .then((r) => r.ok ? r.json() : [])
      .then((creds: { key: string }[]) => {
        const llmKeys = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];
        const hasLLM = creds.some((c) => llmKeys.includes(c.key));
        if (!hasLLM && chatMessages.length === 0) {
          setChatNoCredentials(true);
        }
      })
      .catch(() => {/* ignore */});
  }, [tab, id, chatHistoryLoaded, chatMessages.length]);

  useEffect(() => {
    if (tab === "API Keys" && keys.length === 0) loadKeys();
    if (tab === "Activity Log") loadLogs();
    if (tab === "Overview") loadUsage();
    if (tab === "Infrastructure") loadInfra();
    if (tab === "Credentials") loadCredentials();
    if (tab === "Deploy" && credentials.length === 0) loadCredentials();
    if (tab === "Chat") loadChatHistory();
  }, [tab]);

  async function toggleStatus() {
    if (!instance) return;
    setSaving(true);
    setGatewayError(null);
    const newStatus = instance.status === "running" ? "stopped" : "running";
    const res = await fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.gatewayError) {
        setGatewayError(data.error);
      } else if (res.status === 403) {
        showToast(`${data.error ?? "Plan limit reached."} → Go to Billing to upgrade.`, "error");
      } else {
        showToast(data.error ?? "Failed to update status", "error");
      }
      setSaving(false);
      return;
    }
    setInstance(data);
    showToast(`Instance ${newStatus === "running" ? "started" : "stopped"}.`);
    if (tab === "Activity Log") loadLogs();
    setSaving(false);
  }

  async function deleteInstance() {
    if (!confirm("Delete this instance? This cannot be undone.")) return;
    await fetch(`/api/instances/${id}`, { method: "DELETE" });
    router.push("/dashboard/instances");
  }

  async function saveConfig() {
    setSavingConfig(true);
    const res = await fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });
    if (res.ok) {
      setInstance(await res.json());
      setConfigDirty(false);
      showToast(t("activity.configSaved"));
      if (tab === "Activity Log") loadLogs();
    } else {
      showToast(t("activity.configFailed"), "error");
    }
    setSavingConfig(false);
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    const res = await fetch(`/api/instances/${id}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName.trim() }),
    });
    if (res.ok) {
      const newKey = await res.json();
      setKeys((prev) => [{ ...newKey, key: newKey.key }, ...prev]);
      setRevealedKey(newKey.key); // show once
      setNewKeyName("");
      showToast(t("activity.keyCreated"), "success");
    }
    setCreatingKey(false);
  }

  async function revokeKey(keyId: string) {
    if (!confirm(t("apiKeys.revokeConfirm"))) return;
    const res = await fetch(`/api/instances/${id}/keys`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId }),
    });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      if (revealedKey) setRevealedKey(null);
      showToast(t("activity.keyRevoked"));
      loadLogs();
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function checkGatewayNow() {
    setCheckingGateway(true);
    const res = await fetch(`/api/instances/${id}/gateway-status`);
    if (res.ok) setGatewayStatus(await res.json());
    setCheckingGateway(false);
  }

  async function resyncConfig() {
    setResyncLoading(true);
    const res = await fetch(`/api/admin/instances/${id}/sync-config`, { method: "POST" });
    if (res.ok) {
      showToast("Config sync triggered — VPS will pick up changes within 5 minutes.");
      await loadInstance();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Sync failed", "error");
    }
    setResyncLoading(false);
  }

  async function saveCredential(key: string, value: string) {
    setSavingCred(true);
    const res = await fetch(`/api/instances/${id}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      setEditingKey(null);
      setEditValue("");
      setAddingKey(null);
      setAddValue("");
      await loadCredentials();
      // Reload instance to get updated configSynced
      await loadInstance();
      showToast("Credential saved.");
    } else {
      const data = await res.json();
      showToast(data.error ?? "Failed to save credential", "error");
    }
    setSavingCred(false);
  }

  const LLM_CRED_KEYS = ["openai_api_key", "anthropic_api_key", "openrouter_api_key"];

  async function testAndSaveCredential(key: string, value: string) {
    if (!value.trim()) return;
    setValidatingCred(true);
    setCredValidState((p) => { const n = { ...p }; delete n[key]; return n; });

    const validateRes = await fetch(`/api/instances/${id}/credentials?validate=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const validateData = await validateRes.json() as { valid: boolean; error?: string };

    if (!validateData.valid) {
      setCredValidState((p) => ({ ...p, [key]: "invalid" }));
      setValidatingCred(false);
      showToast(validateData.error ?? "API key validation failed", "error");
      return;
    }

    setCredValidState((p) => ({ ...p, [key]: "valid" }));
    setValidatingCred(false);
    // Now save for real
    await saveCredential(key, value);
  }

  async function deleteCredential(key: string) {
    if (!confirm(`Remove ${CREDENTIAL_KEY_LABELS[key] ?? key}? This cannot be undone.`)) return;
    const res = await fetch(`/api/instances/${id}/credentials/${key}`, { method: "DELETE" });
    if (res.ok) {
      await loadCredentials();
      await loadInstance();
      showToast("Credential removed.");
    }
  }

  async function setupTelegram(token: string) {
    if (!token.trim()) return;
    setTelegramConnecting(true);
    setTelegramError(null);
    setTelegramConnected(null);

    const res = await fetch(`/api/instances/${id}/setup-telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim(), setWebhook: true }),
    });
    const data = await res.json() as { ok?: boolean; botUsername?: string; botName?: string; error?: string };

    if (!res.ok || !data.ok) {
      setTelegramError(data.error ?? "Failed to connect Telegram bot");
    } else {
      setTelegramConnected({ username: data.botUsername ?? "", name: data.botName ?? "" });
      setTelegramTokenInput("");
      await loadCredentials();
      await loadInstance();
      showToast(`Telegram connected: ${data.botUsername}`);
    }
    setTelegramConnecting(false);
  }

  async function requestSync() {
    setSyncRequesting(true);
    const res = await fetch(`/api/instances/${id}/sync-request`, { method: "POST" });
    if (res.ok) {
      showToast("Sync requested — your config will update within 5 minutes");
      await loadInstance();
    } else {
      showToast("Failed to request sync", "error");
    }
    setSyncRequesting(false);
  }

  async function loadConfigPreview() {
    setConfigPreviewLoading(true);
    const res = await fetch(`/api/instances/${id}/config-preview`);
    if (res.ok) {
      setConfigPreviewText(await res.text());
    } else {
      setConfigPreviewText("// Failed to load config preview");
    }
    setConfigPreviewLoading(false);
  }

  async function sendChatMessage() {
    if (!chatMessage.trim()) return;
    setChatSending(true);
    setChatResponse(null);
    setChatError(null);

    const res = await fetch(`/api/instances/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: chatMessage.trim() }),
    });
    const data = await res.json();

    if (!res.ok) {
      setChatError(data.error ?? "Gateway error");
    } else {
      const text = data.response ?? data.text ?? data.message ?? data.content ?? JSON.stringify(data);
      setChatResponse({ text, latencyMs: data.latencyMs });
    }
    setChatSending(false);
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: chatInput.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);
    setChatNoCredentials(false);

    const res = await fetch(`/api/instances/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.missingCredential) {
        setChatNoCredentials(true);
        setChatMessages([]); // clear all messages so the full no-creds state is shown
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error ?? "Something went wrong", isError: true },
        ]);
      }
    } else {
      setChatProvider(data.provider ?? null);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, latencyMs: data.latencyMs },
      ]);
    }
    setChatLoading(false);
  }

  async function saveInlineKey() {
    if (!inlineKeyValue.trim()) return;
    setInlineKeySaving(true);
    setInlineKeyError("");
    const credKey = inlineKeyProvider === "openai" ? "openai_api_key"
      : inlineKeyProvider === "anthropic" ? "anthropic_api_key"
      : "openrouter_api_key";
    const res = await fetch(`/api/instances/${id}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: credKey, value: inlineKeyValue.trim() }),
    });
    if (res.ok) {
      setChatNoCredentials(false);
      setInlineKeyValue("");
      // Auto-focus the chat input so user can immediately type
      setTimeout(() => {
        document.querySelector<HTMLTextAreaElement>("textarea[placeholder]")?.focus();
      }, 100);
    } else {
      const data = await res.json();
      setInlineKeyError(data.error ?? "Failed to save key");
    }
    setInlineKeySaving(false);
  }

  async function deployInstance() {
    setDeploying(true);
    setDeployError(null);
    const res = await fetch(`/api/instances/${id}/deploy`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setDeployError(data.error ?? "Deployment failed");
    } else {
      // Reload instance to reflect provisioning status
      await loadInstance();
    }
    setDeploying(false);
  }

  async function syncConfig() {
    setSyncing(true);
    setSyncDone(false);
    const res = await fetch(`/api/instances/${id}/restart`, { method: "POST" });
    if (res.ok) {
      setSyncDone(true);
      await loadInstance();
      setTimeout(() => setSyncDone(false), 3000);
    }
    setSyncing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }
  if (!instance) return null;

  const typeLabel = INSTANCE_TYPES.find((t) => t.value === instance.type)?.label ?? instance.type;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border ${
          toast.type === "error" ? "bg-red-600/90 border-red-500 text-white" : "bg-emerald-600/90 border-emerald-500 text-white"
        }`}>{toast.text}</div>
      )}

      {/* Back */}
      <Link href="/dashboard/instances" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to instances
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
          <Bot className="w-7 h-7 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white truncate">{instance.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[instance.status]}`}>
              {instance.status}
            </span>
          </div>
          <p className="text-zinc-400 text-sm">{typeLabel} · {instance.tier} tier</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={toggleStatus} disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
              instance.status === "running" ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : instance.status === "running" ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {instance.status === "running" ? t("stop") : t("start")}
          </button>
          <button onClick={deleteInstance} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gateway error banner */}
      {gatewayError && (
        <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-amber-300">
            <span className="font-semibold">{t("infrastructure.gateway.gatewayError")}:</span> {gatewayError}
          </div>
          <button onClick={() => setGatewayError(null)} className="text-amber-500 hover:text-amber-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs — scrollable on mobile so all 8 tabs are always reachable */}
      <div className="relative mb-6">
        <div className="flex gap-1 border-b border-white/5 overflow-x-auto scrollbar-none">
          {TABS.map((tabKey) => {
            const tabLabels: Record<string, string> = {
              "Overview": t("tabs.overview"),
              "Chat": t("chat.tab"),
              "Deploy": t("deploy.tab"),
              "Configuration": t("tabs.configuration"),
              "API Keys": t("tabs.apiKeys"),
              "Activity Log": t("tabs.activityLog"),
              "Infrastructure": t("infrastructure.tab"),
              "Credentials": t("credentials.tab"),
            };
            return (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={cn("px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap",
                  tab === tabKey ? "border-violet-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                )}>
                {tabLabels[tabKey]}
              </button>
            );
          })}
        </div>
        {/* Right fade hint to indicate more tabs are scrollable */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent" />
      </div>

      {/* ── Overview ── */}
      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="glow-border rounded-2xl bg-white/[0.02] divide-y divide-white/5">
            {instance.description && (
              <div className="p-5">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Description</div>
                <p className="text-zinc-300 text-sm">{instance.description}</p>
              </div>
            )}
            <div className="p-5 grid grid-cols-2 gap-5">
              {[
                { label: t("overview.created"), value: formatDate(instance.createdAt) },
                { label: t("overview.lastUpdated"), value: formatDate(instance.updatedAt) },
                { label: t("overview.type"), value: typeLabel },
                { label: t("overview.tier"), value: instance.tier.charAt(0).toUpperCase() + instance.tier.slice(1) },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{f.label}</div>
                  <div className="text-sm text-zinc-300">{f.value}</div>
                </div>
              ))}
            </div>
            {instance.config && (() => {
              try {
                const c = JSON.parse(instance.config);
                return (
                  <div className="p-5">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Active Configuration</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {c.agentTemplateName && (
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="text-zinc-500">Template</span>
                          <span className="text-violet-300 font-medium ml-2">{c.agentTemplateName}</span>
                        </div>
                      )}
                      <div><span className="text-zinc-500">Model</span> <span className="text-zinc-200 ml-2">{c.model ?? "—"}</span></div>
                      <div><span className="text-zinc-500">Temperature</span> <span className="text-zinc-200 ml-2">{c.temperature ?? "—"}</span></div>
                      <div><span className="text-zinc-500">Max Tokens</span> <span className="text-zinc-200 ml-2">{c.maxTokens ?? "—"}</span></div>
                    </div>
                  </div>
                );
              } catch { return null; }
            })()}
          </div>
          {/* Usage Stats Panel */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden" data-testid="usage-panel">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-white">{t("usage.title")}</h3>
              </div>
              {usageLoading && <Loader2 className="w-3.5 h-3.5 text-zinc-600 animate-spin" />}
            </div>
            <div className="p-5 space-y-5">
              {/* Message counts */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("usage.allTime")}</div>
                  <div className="text-2xl font-bold text-white">{usageData?.totalMessages ?? "—"}</div>
                  <div className="text-xs text-zinc-600">{t("usage.messages")}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("usage.thisMonth")}</div>
                  <div className="text-2xl font-bold text-violet-400">{usageData?.messagesThisMonth ?? "—"}</div>
                  <div className="text-xs text-zinc-600">{t("usage.messages")}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("usage.today")}</div>
                  <div className="text-2xl font-bold text-emerald-400">{usageData?.todayMessages ?? "—"}</div>
                  <div className="text-xs text-zinc-600">{t("usage.messages")}</div>
                </div>
              </div>

              {/* Token counts + cost estimate */}
              {usageData && usageData.totalTokens > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-1 border-t border-white/5">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tokens (all time)</div>
                    <div className="text-lg font-bold text-sky-400">
                      {usageData.totalTokens.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {usageData.totalInputTokens.toLocaleString()} in · {usageData.totalOutputTokens.toLocaleString()} out
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Est. cost this month</div>
                    <div className="text-lg font-bold text-amber-400">
                      ${usageData.estimatedCostUsdThisMonth.toFixed(4)}
                    </div>
                    <div className="text-xs text-zinc-600">
                      {usageData.monthTokens.toLocaleString()} tokens · ~${usageData.estimatedCostUsd.toFixed(2)} all time
                    </div>
                  </div>
                </div>
              )}

              {/* Model + latency row */}
              {usageData && (usageData.topModel || usageData.avgLatencyMs !== null) && (
                <div className="flex gap-5 pt-1 border-t border-white/5">
                  {usageData.topModel && (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("usage.topModel")}</div>
                      <div className="text-sm font-mono text-zinc-200">{usageData.topModel}</div>
                    </div>
                  )}
                  {usageData.avgLatencyMs !== null && (
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{t("usage.avgLatency")}</div>
                      <div className="text-sm font-mono text-zinc-200">{usageData.avgLatencyMs}ms</div>
                    </div>
                  )}
                  {usageData.sourceCounts && (
                    <div className="ml-auto text-right">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Sources</div>
                      <div className="text-xs text-zinc-400 space-y-0.5">
                        {usageData.sourceCounts.dashboard > 0 && (
                          <div>Dashboard: {usageData.sourceCounts.dashboard}</div>
                        )}
                        {(usageData.sourceCounts.api ?? 0) + (usageData.sourceCounts["api/openai-compat"] ?? 0) > 0 && (
                          <div>API: {(usageData.sourceCounts.api ?? 0) + (usageData.sourceCounts["api/openai-compat"] ?? 0)}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 14-day bar chart */}
              {usageData && usageData.daily.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{t("usage.last14Days")}</div>
                  {(() => {
                    const maxCount = Math.max(...usageData.daily.map((d) => d.count), 1);
                    return (
                      <div className="flex items-end gap-1 h-16">
                        {usageData.daily.map(({ date, count, tokens }) => {
                          const pct = Math.round((count / maxCount) * 100);
                          const isToday = date === new Date().toISOString().slice(0, 10);
                          const label = tokens > 0
                            ? `${date}: ${count} msg · ${tokens.toLocaleString()} tokens`
                            : `${date}: ${count} messages`;
                          return (
                            <div
                              key={date}
                              className="flex-1 flex flex-col items-center justify-end gap-0.5 group"
                              title={label}
                            >
                              <div
                                className={`w-full rounded-sm transition-all ${
                                  isToday ? "bg-violet-500" : count > 0 ? "bg-zinc-600 group-hover:bg-zinc-500" : "bg-zinc-800"
                                }`}
                                style={{ height: `${Math.max(pct, count > 0 ? 10 : 2)}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Empty state */}
              {!usageLoading && usageData?.totalMessages === 0 && (
                <p className="text-xs text-zinc-600 text-center py-2">{t("usage.noMessages")}</p>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Need a tier upgrade or custom integration? Contact your manager — they handle it for you.</span>
          </div>
        </div>
      )}

      {/* ── Chat ── */}
      {tab === "Chat" && (
        <div className="flex flex-col" style={{ minHeight: 520 }}>
          {/* Header bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Bot className="w-4 h-4" />
              <span>
                {chatProvider
                  ? `${config.model} via ${chatProvider}`
                  : config.model}
              </span>
            </div>
            {chatMessages.length > 0 && (
              <button
                onClick={async () => {
                  setChatMessages([]);
                  setChatNoCredentials(false);
                  setChatProvider(null);
                  // Also clear from DB
                  fetch(`/api/instances/${id}/chat`, { method: "DELETE" }).catch(() => {});
                }}
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg border border-white/5 hover:border-white/10"
              >
                {t("chat.clearChat")}
              </button>
            )}
          </div>

          {/* Instance stopped state */}
          {instance.status !== "running" && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-zinc-600" />
                </div>
                <h3 className="text-white font-semibold mb-2">{t("chat.stoppedTitle")}</h3>
                <p className="text-zinc-500 text-sm mb-4">{t("chat.stoppedDesc")}</p>
                <button
                  onClick={toggleStatus}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white mx-auto"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {t("start")}
                </button>
              </div>
            </div>
          )}

          {/* Inline key setup — shown when no credentials, right inside chat */}
          {instance.status === "running" && chatNoCredentials && chatMessages.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-2">
              <div className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">One step to start chatting</h3>
                    <p className="text-zinc-500 text-xs">Add your AI API key — stays private, never shared</p>
                  </div>
                </div>

                {/* Provider tabs */}
                <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-3">
                  {(["openai", "anthropic", "openrouter"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setInlineKeyProvider(p)}
                      className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                        inlineKeyProvider === p
                          ? "bg-violet-600 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "OpenRouter"}
                    </button>
                  ))}
                </div>

                {/* Key input */}
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={inlineKeyValue}
                    onChange={(e) => setInlineKeyValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveInlineKey()}
                    placeholder={
                      inlineKeyProvider === "openai" ? "sk-..." :
                      inlineKeyProvider === "anthropic" ? "sk-ant-..." : "sk-or-..."
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <button
                    onClick={saveInlineKey}
                    disabled={inlineKeySaving || !inlineKeyValue.trim()}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white shrink-0"
                  >
                    {inlineKeySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {inlineKeySaving ? "Saving…" : "Start"}
                  </button>
                </div>
                {inlineKeyError && (
                  <p className="text-red-400 text-xs mt-2">{inlineKeyError}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <a
                    href={
                      inlineKeyProvider === "openai" ? "https://platform.openai.com/api-keys" :
                      inlineKeyProvider === "anthropic" ? "https://console.anthropic.com/settings/keys" :
                      "https://openrouter.ai/keys"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Get a free API key →
                  </a>
                  <button
                    onClick={() => setTab("Credentials")}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Advanced setup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {instance.status === "running" && (!chatNoCredentials || chatMessages.length > 0) && (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" style={{ maxHeight: 400 }}>
                {chatMessages.length === 0 && !chatLoading && (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-zinc-600 text-sm">Send a message to start the conversation.</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.role === "user" ? "bg-violet-600" : "bg-zinc-700"
                    }`}>
                      {msg.role === "user"
                        ? <span className="text-xs font-bold text-white">U</span>
                        : <Bot className="w-3.5 h-3.5 text-zinc-300" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-violet-600/30 border border-violet-500/30 text-white"
                        : msg.isError
                          ? "bg-red-500/10 border border-red-500/20 text-red-300"
                          : "bg-white/[0.04] border border-white/10 text-zinc-200"
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.latencyMs != null && (
                        <p className="text-xs text-zinc-600 mt-1">{msg.latencyMs}ms</p>
                      )}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                    <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* No creds banner (inline, after first failed attempt) */}
              {chatNoCredentials && chatMessages.length > 0 && (
                <div className="mb-3 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm text-amber-300 flex-1">{t("chat.noCredsDesc")}</span>
                  <button onClick={() => setTab("Credentials")} className="text-xs text-violet-400 hover:text-violet-300 shrink-0">
                    {t("chat.goToCredentials")}
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-3">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendChat();
                    }
                  }}
                  placeholder={t("chat.placeholder")}
                  rows={2}
                  disabled={chatLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  data-testid="chat-send-btn"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white self-end"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {chatLoading ? t("chat.sending") : t("chat.send")}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Deploy ── */}
      {tab === "Deploy" && (
        <DeployTab
          instance={instance}
          credentials={credentials}
          credsLoading={credsLoading}
          deploying={deploying}
          deployError={deployError}
          syncing={syncing}
          syncDone={syncDone}
          onDeploy={deployInstance}
          onSync={syncConfig}
          onGoToCredentials={() => { setTab("Credentials"); loadCredentials(); }}
          t={t}
        />
      )}

      {/* ── Configuration ── */}
      {tab === "Configuration" && (
        <div className="space-y-5">
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6 space-y-5">
            {/* Active template badge */}
            {instance.config && (() => {
              try {
                const c = JSON.parse(instance.config);
                if (!c.agentTemplateName) return null;
                return (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <span className="text-xs text-zinc-400">Template</span>
                    <span className="text-xs font-semibold text-violet-300">{c.agentTemplateName}</span>
                  </div>
                );
              } catch { return null; }
            })()}
            {/* Model */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">AI Model</label>
              <select value={config.model}
                onChange={(e) => { setConfig((p) => ({ ...p, model: e.target.value })); setConfigDirty(true); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors">
                {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">System Prompt</label>
              <textarea value={config.systemPrompt} rows={5}
                onChange={(e) => { setConfig((p) => ({ ...p, systemPrompt: e.target.value })); setConfigDirty(true); }}
                placeholder={t("config.systemPromptPlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none" />
            </div>

            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Temperature</label>
                <span className="text-sm font-mono text-violet-300">{config.temperature.toFixed(1)}</span>
              </div>
              <input type="range" min="0" max="2" step="0.1" value={config.temperature}
                onChange={(e) => { setConfig((p) => ({ ...p, temperature: parseFloat(e.target.value) })); setConfigDirty(true); }}
                className="w-full accent-violet-500" />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>0.0 — Precise</span><span>1.0 — Balanced</span><span>2.0 — Creative</span>
              </div>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Max Tokens</label>
              <input type="number" value={config.maxTokens} min={64} max={32768} step={64}
                onChange={(e) => { setConfig((p) => ({ ...p, maxTokens: parseInt(e.target.value) || 1024 })); setConfigDirty(true); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors" />
              <p className="text-xs text-zinc-600 mt-1">Max response length. Higher = longer answers, more cost.</p>
            </div>
          </div>

          <button onClick={saveConfig} disabled={!configDirty || savingConfig}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-5 py-3 rounded-xl text-sm font-semibold text-white">
            {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
            {savingConfig ? t("config.saving") : configDirty ? t("config.save") : t("config.saved")}
          </button>
        </div>
      )}

      {/* ── API Keys ── */}
      {tab === "API Keys" && (
        <div className="space-y-5">
          {/* Create key */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-5">
            <h3 className="text-sm font-semibold text-white mb-1">{t("apiKeys.generateTitle")}</h3>
            <p className="text-xs text-zinc-500 mb-4">{t("apiKeys.generateDesc")}</p>
            <div className="flex gap-3">
              <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createKey(); }}
                placeholder={t("apiKeys.keyNamePlaceholder")}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              <button onClick={createKey} disabled={creatingKey || !newKeyName.trim()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white">
                {creatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t("apiKeys.generateBtn")}
              </button>
            </div>
          </div>

          {/* New key revealed */}
          {revealedKey && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-300">{t("apiKeys.newKeyTitle")}</span>
              </div>
              <p className="text-xs text-emerald-500/80 mb-3">{t("apiKeys.newKeyDesc")}</p>
              <div className="flex items-center gap-3 bg-black/30 rounded-xl px-4 py-3 font-mono text-sm text-emerald-200 border border-emerald-500/20">
                <span className="flex-1 break-all">{revealedKey}</span>
                <button onClick={() => copyToClipboard(revealedKey, "new")} className="text-emerald-400 hover:text-white transition-colors shrink-0">
                  {copiedId === "new" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Keys list */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white">Active keys</h3>
            </div>
            {keysLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
            ) : keys.length === 0 ? (
              <div className="p-8 text-center">
                <Key className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">{t("apiKeys.noKeysYet")}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {keys.map((k) => (
                  <div key={k.id} className="flex items-center gap-4 p-4">
                    <Key className="w-4 h-4 text-zinc-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{k.name}</div>
                      <div className="text-xs font-mono text-zinc-500 mt-0.5">{k.preview}</div>
                    </div>
                    <div className="text-xs text-zinc-600 hidden sm:block">
                      Created {formatDate(k.createdAt)}
                      {k.lastUsedAt && <span className="ml-2">· Used {formatDate(k.lastUsedAt)}</span>}
                    </div>
                    <button onClick={() => revokeKey(k.id)} className="text-zinc-600 hover:text-red-400 transition-colors ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage example */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Usage examples</span>
              </div>
              <a
                href="/api/v1"
                target="_blank"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                API docs ↗
              </a>
            </div>

            {/* Simple chat endpoint */}
            <p className="text-xs text-zinc-600 mb-1.5 font-medium">Simple chat (SynapseForge API)</p>
            <pre className="text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed bg-black/30 rounded-lg px-4 py-3 mb-4">{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello!"}'`}</pre>

            {/* OpenAI-compatible endpoint */}
            <p className="text-xs text-zinc-600 mb-1.5 font-medium">OpenAI-compatible (drop-in replacement)</p>
            <pre className="text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed bg-black/30 rounded-lg px-4 py-3 mb-4">{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'`}</pre>

            {/* Python SDK example */}
            <p className="text-xs text-zinc-600 mb-1.5 font-medium">Python (OpenAI SDK)</p>
            <pre className="text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed bg-black/30 rounded-lg px-4 py-3">{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${typeof window !== "undefined" ? window.location.origin : ""}/api/v1",
)

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
)
print(resp.choices[0].message.content)`}</pre>
          </div>
        </div>
      )}

      {/* ── Activity Log ── */}
      {tab === "Activity Log" && (
        <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{t("activity.title")}</h3>
            <button onClick={loadLogs} className="text-xs text-zinc-500 hover:text-white transition-colors">Refresh</button>
          </div>
          {logsLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">{t("activity.noActivity")}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {logs.map((log) => {
                const meta = LOG_ICONS[log.event] ?? { icon: "·", color: "text-zinc-400" };
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4">
                    <span className={`text-base mt-0.5 shrink-0 ${meta.color}`}>{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-200 capitalize">{log.event.replace(/_/g, " ")}</div>
                      {log.details && <div className="text-xs text-zinc-500 mt-0.5">{log.details}</div>}
                    </div>
                    <div className="text-xs text-zinc-600 shrink-0">{formatDate(log.createdAt)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Infrastructure ── */}
      {tab === "Infrastructure" && (
        <div className="space-y-6">
          {infraLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* ── Provision Status card ── */}
              {(instance.provisionStatus || instance.hasGateway) && (
                <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-zinc-500" />
                      <h3 className="text-sm font-semibold text-white">VPS Provisioning</h3>
                    </div>
                    {/* Re-sync Config button */}
                    {isAdmin ? (
                      <button
                        onClick={resyncConfig}
                        disabled={resyncLoading}
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {resyncLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Re-sync Config
                      </button>
                    ) : (
                      instance.configSynced === false && (
                        <span className="text-xs text-amber-400">Contact your manager to sync config</span>
                      )
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    {/* Provision status */}
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">Status</div>
                      {(() => {
                        const ps = instance.provisionStatus;
                        if (ps === "provisioning") return (
                          <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium bg-amber-500/20 text-amber-300 border-amber-500/30">
                            <Loader2 className="w-3 h-3 animate-spin" /> Provisioning…
                          </span>
                        );
                        if (ps === "ready") return (
                          <span className="text-sm px-3 py-1 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            Ready
                          </span>
                        );
                        if (ps === "failed") return (
                          <span className="text-sm px-3 py-1 rounded-full border font-medium bg-red-500/20 text-red-300 border-red-500/30">
                            Failed
                          </span>
                        );
                        if (instance.hasGateway) return (
                          <span className="text-sm px-3 py-1 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            Ready
                          </span>
                        );
                        return (
                          <span className="text-sm px-3 py-1 rounded-full border font-medium bg-zinc-700/30 text-zinc-400 border-zinc-600/30">
                            {ps ?? "Unknown"}
                          </span>
                        );
                      })()}
                    </div>
                    {/* VPS URL */}
                    {healthData?.vpsUrl && (
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">VPS URL</div>
                        <span className="text-sm text-zinc-300 font-mono">{healthData.vpsUrl}</span>
                      </div>
                    )}
                    {/* Config sync status */}
                    {instance.configSynced === false && (
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">Config</div>
                        <span className="flex items-center gap-1.5 text-xs text-amber-400">
                          <AlertCircle className="w-3 h-3" /> Out of sync — VPS will auto-sync within 5 min
                        </span>
                      </div>
                    )}
                    {/* Live check result */}
                    {healthData?.liveCheck && (
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">Last Check</div>
                        <div className="flex items-center gap-2">
                          {healthData.liveCheck.healthy ? (
                            <>
                              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-sm text-emerald-300">{healthData.liveCheck.latencyMs}ms</span>
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-sm text-red-400">{healthData.liveCheck.error ?? "Unreachable"}</span>
                            </>
                          )}
                          {healthData.lastCheckedAt && (
                            <span className="text-xs text-zinc-600">· {formatRelativeTime(healthData.lastCheckedAt)}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* VPS Gateway Status */}
              <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-white">{t("infrastructure.gateway.title")}</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">Status</div>
                    {instance.hasGateway ? (
                      <span className="text-sm px-3 py-1 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        {t("infrastructure.gateway.connected")}
                      </span>
                    ) : (
                      <span className="text-sm px-3 py-1 rounded-full border font-medium bg-zinc-700/30 text-zinc-400 border-zinc-600/30">
                        {t("infrastructure.gateway.notConfigured")}
                      </span>
                    )}
                  </div>

                  {instance.hasGateway && (
                    <>
                      {/* Live check result */}
                      {gatewayStatus && (
                        <div className="flex items-center gap-4">
                          <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.gateway.latency")}</div>
                          <div className="flex items-center gap-2">
                            {gatewayStatus.connected ? (
                              <>
                                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-sm text-emerald-300">
                                  {gatewayStatus.latencyMs}{t("infrastructure.gateway.ms")}
                                </span>
                              </>
                            ) : (
                              <>
                                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                                <span className="text-sm text-red-400">{gatewayStatus.error ?? "Unreachable"}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <button
                          onClick={checkGatewayNow}
                          disabled={checkingGateway}
                          className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {checkingGateway ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> {t("infrastructure.gateway.checking")}</>
                          ) : (
                            <><Wifi className="w-3 h-3" /> {t("infrastructure.gateway.checkNow")}</>
                          )}
                        </button>
                      </div>
                    </>
                  )}

                  {!instance.hasGateway && (
                    <p className="text-xs text-zinc-600">Contact your manager to connect a VPS gateway to this instance.</p>
                  )}
                </div>
              </div>

              {/* Health Status */}
              <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                  <Server className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-white">{t("infrastructure.health.title")}</h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Status badge */}
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.health.status")}</div>
                    {(() => {
                      const hs = healthData?.healthStatus ?? null;
                      const colorMap: Record<string, string> = {
                        healthy: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                        degraded: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                        down: "bg-red-500/20 text-red-300 border-red-500/30",
                      };
                      const labelMap: Record<string, string> = {
                        healthy: t("infrastructure.health.healthy"),
                        degraded: t("infrastructure.health.degraded"),
                        down: t("infrastructure.health.down"),
                      };
                      return (
                        <span className={`text-sm px-3 py-1 rounded-full border font-medium ${hs ? colorMap[hs] : "bg-zinc-700/30 text-zinc-400 border-zinc-600/30"}`}>
                          {hs ? labelMap[hs] ?? hs : t("infrastructure.health.unknown")}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.health.lastChecked")}</div>
                    <span className="text-sm text-zinc-300">{healthData?.lastCheckedAt ? formatRelativeTime(healthData.lastCheckedAt) : t("infrastructure.health.noData")}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.health.vpsUrl")}</div>
                    <span className="text-sm text-zinc-300 font-mono">{healthData?.vpsUrl ?? t("infrastructure.health.notConfigured")}</span>
                  </div>
                </div>
                {/* Health history */}
                <div className="border-t border-white/5">
                  <div className="p-5 pb-3">
                    <h4 className="text-xs text-zinc-500 uppercase tracking-wider">{t("infrastructure.health.history")}</h4>
                  </div>
                  {!healthData || healthData.checks.length === 0 ? (
                    <div className="px-5 pb-8 text-center">
                      <p className="text-zinc-500 text-sm">{t("infrastructure.health.noData")}</p>
                      <p className="text-zinc-600 text-xs mt-1">{t("infrastructure.health.noDataDesc")}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-zinc-500 border-b border-white/5">
                            <th className="text-left px-5 py-2">{t("infrastructure.health.time")}</th>
                            <th className="text-left px-5 py-2">{t("infrastructure.health.status")}</th>
                            <th className="text-left px-5 py-2">{t("infrastructure.health.responseTime")}</th>
                            <th className="text-left px-5 py-2">{t("infrastructure.health.error")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {healthData.checks.map((c) => (
                            <tr key={c.id} className="hover:bg-white/[0.02]">
                              <td className="px-5 py-2.5 text-zinc-400 text-xs">{formatRelativeTime(c.checkedAt)}</td>
                              <td className="px-5 py-2.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  c.status === "healthy" ? "bg-emerald-500/20 text-emerald-300" :
                                  c.status === "degraded" ? "bg-yellow-500/20 text-yellow-300" :
                                  "bg-red-500/20 text-red-300"
                                }`}>{c.status}</span>
                              </td>
                              <td className="px-5 py-2.5 text-zinc-400 text-xs">{c.responseMs != null ? `${c.responseMs}ms` : "—"}</td>
                              <td className="px-5 py-2.5 text-zinc-500 text-xs">{c.error ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Backups */}
              <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-sm font-semibold text-white">{t("infrastructure.backups.title")}</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.backups.lastBackup")}</div>
                    <span className="text-sm text-zinc-300">
                      {snapshotsData?.lastBackupAt ? formatRelativeTime(snapshotsData.lastBackupAt) : t("infrastructure.backups.never")}
                    </span>
                  </div>
                </div>
                {!snapshotsData || snapshotsData.snapshots.length === 0 ? (
                  <div className="px-5 pb-8 text-center">
                    <p className="text-zinc-500 text-sm">{t("infrastructure.backups.noSnapshots")}</p>
                    <p className="text-zinc-600 text-xs mt-1">{t("infrastructure.backups.noSnapshotsDesc")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border-t border-white/5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-zinc-500 border-b border-white/5">
                          <th className="text-left px-5 py-2">{t("infrastructure.health.time")}</th>
                          <th className="text-left px-5 py-2">{t("infrastructure.backups.snapshotId")}</th>
                          <th className="text-left px-5 py-2">{t("infrastructure.backups.size")}</th>
                          <th className="text-left px-5 py-2">{t("infrastructure.health.status")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {snapshotsData.snapshots.map((s) => (
                          <tr key={s.id} className="hover:bg-white/[0.02]">
                            <td className="px-5 py-2.5 text-zinc-400 text-xs">{formatRelativeTime(s.createdAt)}</td>
                            <td className="px-5 py-2.5 text-zinc-300 text-xs font-mono">{s.snapshotId}</td>
                            <td className="px-5 py-2.5 text-zinc-400 text-xs">
                              {s.sizeBytes != null ? `${(s.sizeBytes / 1024 / 1024).toFixed(1)} MB` : "—"}
                            </td>
                            <td className="px-5 py-2.5">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                s.healthy ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                              }`}>{s.healthy ? t("infrastructure.health.healthy") : t("infrastructure.health.down")}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="p-5 border-t border-white/5">
                  <p className="text-xs text-zinc-600">{t("infrastructure.backups.note")}</p>
                </div>
              </div>

              {/* Test Chat */}
              {instance.hasGateway && instance.status === "running" && (
                <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-sm font-semibold text-white">{t("infrastructure.testChat.title")}</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-zinc-500">{t("infrastructure.testChat.note")}</p>
                    <div className="flex gap-3">
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                        placeholder={t("infrastructure.testChat.placeholder")}
                        rows={2}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                      />
                      <button
                        onClick={sendChatMessage}
                        disabled={chatSending || !chatMessage.trim()}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white self-end"
                      >
                        {chatSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {chatSending ? t("infrastructure.testChat.sending") : t("infrastructure.testChat.send")}
                      </button>
                    </div>
                    {chatError && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-red-300">{chatError}</span>
                      </div>
                    )}
                    {chatResponse && (
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("infrastructure.testChat.responseLabel")}</span>
                          {chatResponse.latencyMs != null && (
                            <span className="text-xs text-zinc-600">{chatResponse.latencyMs}{t("infrastructure.gateway.ms")}</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-200 whitespace-pre-wrap">{chatResponse.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Credentials ── */}
      {tab === "Credentials" && (
        <div className="space-y-5">
          {/* Out of sync banner — with Sync Now button if VPS is provisioned */}
          {instance.configSynced === false && (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm text-amber-300 flex-1">{t("credentials.configOutOfSync")}</span>
              {instance.hasGateway && (
                <button
                  onClick={requestSync}
                  disabled={syncRequesting}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                >
                  {syncRequesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                  Sync Now
                </button>
              )}
            </div>
          )}

          {/* ── Connected Channels Overview ── */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider">Connected Channels</h3>
            </div>
            <div className="divide-y divide-white/5">
              {/* Telegram */}
              {(() => {
                const hasTelegram = credentials.some((c) => c.key === "telegram_bot_token");
                const tgUsername = instance.telegramBotUsername ?? (telegramConnected?.username ?? null);
                return (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-base shrink-0">✈</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Telegram</div>
                      {hasTelegram && tgUsername ? (
                        <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Check className="w-3 h-3" /> {tgUsername} — Connected
                        </div>
                      ) : hasTelegram ? (
                        <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Token saved
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500 mt-0.5">Not connected</div>
                      )}
                    </div>
                    {!hasTelegram && (
                      <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">Not set up</span>
                    )}
                    {hasTelegram && (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">Live</span>
                    )}
                  </div>
                );
              })()}
              {/* Discord */}
              {(() => {
                const hasDiscord = credentials.some((c) => c.key === "discord_bot_token");
                return (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-base shrink-0">🎮</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Discord</div>
                      {hasDiscord ? (
                        <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> Token saved</div>
                      ) : (
                        <div className="text-xs text-zinc-500 mt-0.5">Not connected</div>
                      )}
                      {hasDiscord && <div className="text-xs text-zinc-600 mt-0.5">Full configuration in manager portal</div>}
                    </div>
                    {hasDiscord ? (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">Live</span>
                    ) : (
                      <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">Not set up</span>
                    )}
                  </div>
                );
              })()}
              {/* Slack */}
              {(() => {
                const hasSlack = credentials.some((c) => c.key === "slack_app_token" || c.key === "slack_bot_token");
                return (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-base shrink-0">💬</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Slack</div>
                      {hasSlack ? (
                        <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> Token saved</div>
                      ) : (
                        <div className="text-xs text-zinc-500 mt-0.5">Not connected</div>
                      )}
                      {hasSlack && <div className="text-xs text-zinc-600 mt-0.5">Full configuration in manager portal</div>}
                    </div>
                    {hasSlack ? (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">Live</span>
                    ) : (
                      <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">Not set up</span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Config preview / download */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-semibold text-white">OpenClaw Config</span>
              </div>
              <button
                onClick={() => { if (!configPreviewText) loadConfigPreview(); else setConfigPreviewText(null); }}
                disabled={configPreviewLoading}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                {configPreviewLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                {configPreviewText ? "Hide" : t("credentials.viewConfig")}
              </button>
            </div>
            {configPreviewText && (
              <pre data-testid="config-preview" className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 overflow-x-auto max-h-64 font-mono">
                {configPreviewText}
              </pre>
            )}
          </div>

          {/* LLM Provider section */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.llmProvider")}</h3>
            </div>
            {credsLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
            ) : (
              <div className="divide-y divide-white/5">
                {["openai_api_key", "anthropic_api_key", "openrouter_api_key"].map((key) => {
                  const existing = credentials.find((c) => c.key === key);
                  const isEditing = editingKey === key;
                  const isAdding = addingKey === key;
                  const currentValue = isEditing ? editValue : addValue;
                  const validState = credValidState[key];
                  return (
                    <div key={key} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{CREDENTIAL_KEY_LABELS[key]}</div>
                          {existing && !isEditing && (
                            <div className="text-xs font-mono text-zinc-500 mt-0.5">{existing.maskedValue}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {existing && !isEditing && (
                            <>
                              <button
                                onClick={() => { setEditingKey(key); setEditValue(""); setCredValidState((p) => { const n = {...p}; delete n[key]; return n; }); }}
                                className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg transition-colors"
                              >
                                {t("credentials.editCredential")}
                              </button>
                              <button
                                onClick={() => deleteCredential(key)}
                                className="text-zinc-600 hover:text-red-400 transition-colors"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {!existing && !isAdding && (
                            <button
                              onClick={() => { setAddingKey(key); setAddValue(""); setCredValidState((p) => { const n = {...p}; delete n[key]; return n; }); }}
                              className="text-xs text-zinc-500 hover:text-white bg-white/5 px-2 py-1 rounded-lg transition-colors"
                            >
                              {t("credentials.addCredential")}
                            </button>
                          )}
                        </div>
                      </div>
                      {(isEditing || isAdding) && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="password"
                              value={currentValue}
                              onChange={(e) => {
                                isEditing ? setEditValue(e.target.value) : setAddValue(e.target.value);
                                if (validState) setCredValidState((p) => { const n = {...p}; delete n[key]; return n; });
                              }}
                              placeholder="Enter value..."
                              autoFocus
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                            />
                            {/* Test & Save for LLM keys */}
                            <button
                              onClick={() => LLM_CRED_KEYS.includes(key)
                                ? testAndSaveCredential(key, currentValue)
                                : saveCredential(key, currentValue)}
                              disabled={validatingCred || savingCred || !currentValue}
                              className={cn(
                                "flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40",
                                validState === "valid"
                                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                                  : validState === "invalid"
                                  ? "bg-red-600/80 hover:bg-red-500 text-white"
                                  : "bg-violet-600 hover:bg-violet-500 text-white"
                              )}
                            >
                              {(validatingCred || savingCred) && <Loader2 className="w-3 h-3 animate-spin" />}
                              {!validatingCred && !savingCred && validState === "valid" && <Check className="w-3 h-3" />}
                              {!validatingCred && !savingCred && validState !== "valid" && <Check className="w-3 h-3" />}
                              {validatingCred ? "Testing…" : savingCred ? "Saving…"
                                : LLM_CRED_KEYS.includes(key) ? "Test & Save"
                                : t("credentials.saveCredential")}
                            </button>
                            <button
                              onClick={() => { setEditingKey(null); setAddingKey(null); setCredValidState((p) => { const n = {...p}; delete n[key]; return n; }); }}
                              className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {validState === "invalid" && (
                            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                              Key validation failed — check that it&apos;s correct and has the right permissions.
                            </p>
                          )}
                          {validState === "valid" && (
                            <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
                              ✓ Key validated and saved successfully.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Telegram Connect Card ── */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider">Telegram</h3>
              {credentials.some((c) => c.key === "telegram_bot_token") && (
                <button
                  onClick={() => {
                    deleteCredential("telegram_bot_token");
                    setTelegramConnected(null);
                    setTelegramError(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
            <div className="p-5">
              {/* Connected state */}
              {credentials.some((c) => c.key === "telegram_bot_token") ? (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xl shrink-0">✈</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {instance.telegramBotUsername ?? telegramConnected?.username ?? "Bot connected"}
                      </span>
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Connected</span>
                    </div>
                    <p className="text-xs text-zinc-500">Your Telegram bot is live. Users can message it directly.</p>
                    <button
                      onClick={() => {
                        setTelegramTokenInput("");
                        setTelegramError(null);
                        setTelegramConnected(null);
                        setAddingKey("telegram_bot_token");
                      }}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Replace token
                    </button>
                  </div>
                </div>
              ) : (
                /* Not connected state */
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl shrink-0">✈</div>
                    <div>
                      <p className="text-sm font-medium text-white mb-0.5">Connect Telegram Bot</p>
                      <p className="text-xs text-zinc-500">
                        Create a bot via{" "}
                        <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                          @BotFather
                        </a>
                        , then paste the token here.
                      </p>
                    </div>
                  </div>

                  {addingKey === "telegram_bot_token" ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={telegramTokenInput}
                          onChange={(e) => { setTelegramTokenInput(e.target.value); setTelegramError(null); }}
                          placeholder="1234567890:AAFake_tokenHere..."
                          autoFocus
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                        />
                        <button
                          onClick={() => setupTelegram(telegramTokenInput)}
                          disabled={telegramConnecting || !telegramTokenInput.trim()}
                          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                        >
                          {telegramConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                          {telegramConnecting ? "Connecting…" : "Connect"}
                        </button>
                        <button
                          onClick={() => { setAddingKey(null); setTelegramTokenInput(""); setTelegramError(null); }}
                          className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {telegramError && (
                        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                          {telegramError}
                          {telegramError.includes("BotFather") || telegramError.includes("token") ? "" : " — Make sure the token is correct and was copied from @BotFather."}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingKey("telegram_bot_token"); setTelegramError(null); setTelegramTokenInput(""); }}
                      className="flex items-center gap-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      Connect Telegram Bot
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Discord / Slack tokens ── */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider">Other Channels</h3>
            </div>
            <div className="divide-y divide-white/5">
              {["discord_bot_token", "slack_app_token", "slack_bot_token"].map((key) => {
                const existing = credentials.find((c) => c.key === key);
                const isEditing = editingKey === key;
                const isAdding = addingKey === key && key !== "telegram_bot_token";
                return (
                  <div key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{CREDENTIAL_KEY_LABELS[key]}</div>
                        {existing && !isEditing && (
                          <div className="text-xs font-mono text-zinc-500 mt-0.5">{existing.maskedValue}</div>
                        )}
                        {!existing && (
                          <div className="text-xs text-zinc-600 mt-0.5">More configuration in manager portal</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {existing && !isEditing && (
                          <>
                            <button
                              onClick={() => { setEditingKey(key); setEditValue(""); }}
                              className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg transition-colors"
                            >
                              {t("credentials.editCredential")}
                            </button>
                            <button
                              onClick={() => deleteCredential(key)}
                              className="text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {!existing && !isAdding && (
                          <button
                            onClick={() => { setAddingKey(key); setAddValue(""); }}
                            className="text-xs text-zinc-500 hover:text-white bg-white/5 px-2 py-1 rounded-lg transition-colors"
                          >
                            {t("credentials.addCredential")}
                          </button>
                        )}
                      </div>
                    </div>
                    {(isEditing || isAdding) && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="password"
                          value={isEditing ? editValue : addValue}
                          onChange={(e) => isEditing ? setEditValue(e.target.value) : setAddValue(e.target.value)}
                          placeholder="Enter value..."
                          autoFocus
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                        />
                        <button
                          onClick={() => saveCredential(key, isEditing ? editValue : addValue)}
                          disabled={savingCred || (isEditing ? !editValue : !addValue)}
                          className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                        >
                          {savingCred ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          {t("credentials.saveCredential")}
                        </button>
                        <button
                          onClick={() => { setEditingKey(null); setAddingKey(null); }}
                          className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
