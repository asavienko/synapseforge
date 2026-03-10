"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bot, ArrowLeft, Play, Square, Trash2, Loader2,
  Settings2, Key, Activity, Copy, Check, Eye, EyeOff,
  Plus, X, Zap, AlertCircle, Terminal,
} from "lucide-react";
import Link from "next/link";
import { STATUS_COLORS, INSTANCE_TYPES, formatDate } from "@/lib/utils";
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
};

const TABS = ["Overview", "Configuration", "API Keys", "Activity Log"] as const;
type Tab = (typeof TABS)[number];

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

  useEffect(() => { loadInstance(); }, [loadInstance]);

  useEffect(() => {
    if (tab === "API Keys" && keys.length === 0) loadKeys();
    if (tab === "Activity Log") loadLogs();
  }, [tab]);

  async function toggleStatus() {
    if (!instance) return;
    setSaving(true);
    const newStatus = instance.status === "running" ? "stopped" : "running";
    const res = await fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setInstance(await res.json());
      showToast(`Instance ${newStatus === "running" ? "started" : "stopped"}.`);
      if (tab === "Activity Log") loadLogs();
    }
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
      <div className="flex items-start gap-4 mb-6">
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 mb-6">
        {TABS.map((tabKey) => {
          const tabLabels: Record<string, string> = {
            "Overview": t("tabs.overview"),
            "Configuration": t("tabs.configuration"),
            "API Keys": t("tabs.apiKeys"),
            "Activity Log": t("tabs.activityLog"),
          };
          return (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className={cn("px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                tab === tabKey ? "border-violet-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}>
              {tabLabels[tabKey]}
            </button>
          );
        })}
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
                      <div><span className="text-zinc-500">Model</span> <span className="text-zinc-200 ml-2">{c.model ?? "—"}</span></div>
                      <div><span className="text-zinc-500">Temperature</span> <span className="text-zinc-200 ml-2">{c.temperature ?? "—"}</span></div>
                      <div><span className="text-zinc-500">Max Tokens</span> <span className="text-zinc-200 ml-2">{c.maxTokens ?? "—"}</span></div>
                    </div>
                  </div>
                );
              } catch { return null; }
            })()}
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Need a tier upgrade or custom integration? Contact your manager — they handle it for you.</span>
          </div>
        </div>
      )}

      {/* ── Configuration ── */}
      {tab === "Configuration" && (
        <div className="space-y-5">
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6 space-y-5">
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
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Usage example</span>
            </div>
            <pre className="text-xs font-mono text-zinc-400 overflow-x-auto leading-relaxed">{`curl -X POST https://api.synapseforge.ai/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello!", "instanceId": "${id}"}'`}</pre>
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
    </div>
  );
}
