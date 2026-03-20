"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Instance,
  Config,
  DEFAULT_CONFIG,
  CredentialRow,
  HealthData,
  SnapshotsData,
  CommandRow,
  ApiKeyRow,
  LogRow,
  GatewayStatus,
  ChatMsg,
  UsageData,
  Tab,
  TABS,
} from "./types";

export function useInstanceData() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>("Overview");
  const [showFirstRunBanner, setShowFirstRunBanner] = useState(false);
  const [firstRunDetected, setFirstRunDetected] = useState(false);
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

  // Logs state
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState<"all" | "config" | "chat" | "errors" | "keys" | "provision">("all");

  // Usage stats state
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Infrastructure state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [snapshotsData, setSnapshotsData] = useState<SnapshotsData | null>(null);
  const [infraLoading, setInfraLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resyncLoading, setResyncLoading] = useState(false);
  const [commands, setCommands] = useState<CommandRow[]>([]);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);
  const [restoreRequested, setRestoreRequested] = useState<string | null>(null);

  // Gateway status
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [checkingGateway, setCheckingGateway] = useState(false);

  // Version info
  const [currentVersionInfo, setCurrentVersionInfo] = useState<{ changelog?: string | null; stable?: boolean } | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatNoCredentials, setChatNoCredentials] = useState(false);
  const [chatProvider, setChatProvider] = useState<string | null>(null);
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);

  // Credentials state
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [credsLoading, setCredsLoading] = useState(false);

  // Referral code
  const [referralCode, setReferralCode] = useState<string | undefined>(undefined);
  const [referralLoading, setReferralLoading] = useState(false);

  // Modal states
  const [pendingConfirm, setPendingConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const prevSandboxModeRef = useRef<boolean | null>(null);

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

  const loadRecentLogs = useCallback(async () => {
    const res = await fetch(`/api/instances/${id}/logs?limit=5`);
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data.slice(0, 5) : [];
    }
    return [];
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
    const [healthRes, snapshotsRes, commandsRes] = await Promise.all([
      fetch(`/api/instances/${id}/health`),
      fetch(`/api/instances/${id}/snapshots`),
      fetch(`/api/instances/${id}/commands`),
    ]);
    if (healthRes.ok) setHealthData(await healthRes.json());
    if (snapshotsRes.ok) setSnapshotsData(await snapshotsRes.json());
    if (commandsRes.ok) {
      const d = await commandsRes.json();
      setCommands(d.commands ?? []);
    }
    setInfraLoading(false);
  }, [id]);

  async function requestRollback(snapshotId: string) {
    await fetch(`/api/instances/${id}/request-rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshotId }),
    });
    setRestoreConfirmId(null);
    setRestoreRequested(snapshotId);
    setTimeout(() => setRestoreRequested(null), 4000);
  }

  const loadCredentials = useCallback(async () => {
    setCredsLoading(true);
    const res = await fetch(`/api/instances/${id}/credentials`);
    if (res.ok) setCredentials(await res.json());
    setCredsLoading(false);
  }, [id]);

  const loadChatHistory = useCallback(async () => {
    if (chatHistoryLoaded) return;
    try {
      const res = await fetch(`/api/instances/${id}/chat`);
      if (res.ok) {
        const history = await res.json();
        if (Array.isArray(history) && history.length > 0) {
          setChatMessages(history.map((m: { role: string; content: string; isError?: boolean; latencyMs?: number; provider?: string; source?: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
            isError: m.isError ?? false,
            latencyMs: m.latencyMs,
            source: m.source,
          })));
          if (history[history.length - 1]?.provider) {
            setChatProvider(history[history.length - 1].provider);
          }
        }
      }
    } catch { /* ignore */ }
    setChatHistoryLoaded(true);
  }, [id, chatHistoryLoaded]);

  // Initial load
  useEffect(() => { loadInstance(); }, [loadInstance]);

  // Detect firstRun=1 param
  useEffect(() => {
    if (searchParams.get("firstRun") === "1" && !firstRunDetected) {
      setFirstRunDetected(true);
      setTab("Chat");
      setShowFirstRunBanner(true);
    }
  }, [searchParams, firstRunDetected]);

  // Detect ?tab= param
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && TABS.includes(tabParam as typeof TABS[number])) {
      setTab(tabParam as typeof TABS[number]);
    }
  }, []);

  // Detect sandbox→real graduation
  useEffect(() => {
    if (!instance) return;
    const prev = prevSandboxModeRef.current;
    const curr = instance.sandboxMode ?? false;
    if (prev === true && curr === false) {
      // Trigger graduation modal via return value
    }
    prevSandboxModeRef.current = curr;
  }, [instance?.sandboxMode]);

  // Auto-poll while provisioning
  useEffect(() => {
    if (instance?.provisionStatus !== "provisioning") return;
    const interval = setInterval(() => { loadInstance(); }, 8000);
    return () => clearInterval(interval);
  }, [instance?.provisionStatus, loadInstance]);

  // Fetch admin status
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.isAdmin) setIsAdmin(true); })
      .catch(() => {});
  }, []);

  // Poll health every 30s on Infrastructure tab
  useEffect(() => {
    if (tab !== "Infrastructure") return;
    const pollHealth = async () => {
      const res = await fetch(`/api/instances/${id}/health?live=false`);
      if (res.ok) setHealthData(await res.json());
    };
    const interval = setInterval(pollHealth, 30_000);
    return () => clearInterval(interval);
  }, [tab, id]);

  // Auto-refresh logs every 30s on Activity Log tab
  useEffect(() => {
    if (tab !== "Activity Log") return;
    const interval = setInterval(() => loadLogs(), 30_000);
    return () => clearInterval(interval);
  }, [tab, loadLogs]);

  // Tab change effects
  useEffect(() => {
    if (tab === "API Keys" && keys.length === 0) loadKeys();
    if (tab === "Activity Log") loadLogs();
    if (tab === "Infrastructure") loadInfra();
    if (tab === "Credentials") loadCredentials();
    if (tab === "Deploy" && credentials.length === 0) loadCredentials();
    if (tab === "Chat") loadChatHistory();
    if (tab === "Embed" && !referralCode && !referralLoading) {
      setReferralLoading(true);
      fetch("/api/referrals")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => { if (d?.code) setReferralCode(d.code); })
        .catch(() => {})
        .finally(() => setReferralLoading(false));
    }
  }, [tab]);

  // Fetch version info
  useEffect(() => {
    if (instance?.currentVersion) {
      fetch(`/api/versions/${instance.currentVersion}`)
        .then((r) => r.json())
        .then((d) => setCurrentVersionInfo(d.version ?? null))
        .catch(() => {});
    }
  }, [instance?.currentVersion]);

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
        showToast(`${data.error ?? "Failed to update status"} → Go to Billing to upgrade.`, "error");
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

  function deleteInstance() {
    setPendingConfirm({
      message: "Are you sure you want to delete this instance? This cannot be undone.",
      onConfirm: async () => {
        await fetch(`/api/instances/${id}`, { method: "DELETE" });
        router.push("/dashboard/instances");
      },
    });
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
      showToast("Configuration saved");
      if (tab === "Activity Log") loadLogs();
    } else {
      showToast("Failed to save configuration", "error");
    }
    setSavingConfig(false);
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
      showToast("Config sync triggered");
      await loadInstance();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Sync failed", "error");
    }
    setResyncLoading(false);
  }

  async function toggleAutoUpdate() {
    if (!instance) return;
    const newValue = !instance.autoUpdate;
    const res = await fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoUpdate: newValue }),
    });
    if (res.ok) {
      setInstance((prev) => prev ? { ...prev, autoUpdate: newValue } : prev);
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error ?? "Failed to toggle auto-update", "error");
    }
  }

  async function saveCredential(key: string, value: string) {
    const res = await fetch(`/api/instances/${id}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      await loadCredentials();
      await loadInstance();
      showToast("Credential saved");
      return true;
    } else {
      const data = await res.json();
      showToast(data.error ?? "Failed to save credential", "error");
      return false;
    }
  }

  async function deleteCredential(key: string) {
    setPendingConfirm({
      message: `Remove ${key}? This cannot be undone.`,
      onConfirm: async () => {
        const res = await fetch(`/api/instances/${id}/credentials/${key}`, { method: "DELETE" });
        if (res.ok) {
          await loadCredentials();
          await loadInstance();
          showToast("Credential deleted");
        }
      },
    });
  }

  async function requestSync() {
    const res = await fetch(`/api/instances/${id}/sync-now`, { method: "POST" });
    const data = await res.json().catch(() => ({})) as { ok?: boolean; synced?: boolean; fallback?: boolean; message?: string };
    if (res.ok && data.ok) {
      showToast(data.message ?? "Config sync triggered", "success");
      await loadInstance();
    } else {
      showToast("Sync failed", "error");
    }
  }

  return {
    id,
    router,
    searchParams,
    tab,
    setTab,
    showFirstRunBanner,
    setShowFirstRunBanner,
    firstRunDetected,
    instance,
    setInstance,
    loading,
    saving,
    toast,
    setToast,
    gatewayError,
    setGatewayError,
    config,
    setConfig,
    configDirty,
    setConfigDirty,
    savingConfig,
    keys,
    keysLoading,
    logs,
    logsLoading,
    logFilter,
    setLogFilter,
    usageData,
    usageLoading,
    healthData,
    snapshotsData,
    infraLoading,
    isAdmin,
    resyncLoading,
    commands,
    restoreConfirmId,
    setRestoreConfirmId,
    restoreRequested,
    setRestoreRequested,
    gatewayStatus,
    checkingGateway,
    currentVersionInfo,
    chatMessages,
    setChatMessages,
    chatLoading,
    setChatLoading,
    chatNoCredentials,
    setChatNoCredentials,
    chatProvider,
    setChatProvider,
    chatHistoryLoaded,
    credentials,
    credsLoading,
    referralCode,
    referralLoading,
    pendingConfirm,
    setPendingConfirm,
    prevSandboxModeRef,
    showToast,
    loadInstance,
    loadKeys,
    loadLogs,
    loadRecentLogs,
    loadUsage,
    loadInfra,
    requestRollback,
    loadCredentials,
    loadChatHistory,
    toggleStatus,
    deleteInstance,
    saveConfig,
    checkGatewayNow,
    resyncConfig,
    toggleAutoUpdate,
    saveCredential,
    deleteCredential,
    requestSync,
  };
}
