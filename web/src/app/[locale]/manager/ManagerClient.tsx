"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, Send, Loader2, X, Shield, Activity, Server, AlertTriangle, ExternalLink, Rocket, ChevronDown, ChevronUp, StickyNote, Trash2, Zap, ArrowLeft, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PLANS, formatDate, formatRelativeTime } from "@/lib/utils";
import { ProvisioningWizard } from "@/components/ProvisioningWizard";
import { healthScoreLabel } from "@/lib/health-score-utils";
import { ManagerInsightsPanel } from "@/components/ManagerInsightsPanel";

interface ClientNote {
  id: string;
  managerId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  onboardingData: { businessName?: string; industry?: string; useCase?: string; teamSize?: string; agentType?: string } | null;
  healthScore: number | null;
  unreadMessages: number;
  lastMessage: { body: string; senderType: string; createdAt: string } | null;
  instances: { id: string; name: string; type: string; status: string; tier: string }[];
}

interface Message {
  id: string;
  body: string;
  senderType: string;
  createdAt: string;
}

interface ManagedInstance {
  id: string;
  name: string;
  status: string;
  healthStatus: string | null;
  tier: string;
  vpsUrl: string | null;
  hasGateway: boolean;
  provisionStatus: string | null;
  lastCheckedAt: string | null;
}

interface ClientWithInstances {
  id: string;
  name: string | null;
  email: string;
  instances: ManagedInstance[];
}

interface ChatLogMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  model?: string;
}

interface InstanceSnapshot {
  id: string;
  snapshotId: string;
  sizeBytes?: number | null;
  healthy: boolean;
  label?: string | null;
  tag?: string | null;
  createdAt: string;
}

function HealthScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const { label, color } = healthScoreLabel(score);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      title={label}
    >
      <span style={{ color }}>●</span>
      {score}%
    </span>
  );
}

function HealthDot({ healthStatus, hasVps }: { healthStatus: string | null; hasVps: boolean }) {
  if (!hasVps) return <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" title="No VPS" />;
  if (healthStatus === "healthy") return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" title="Healthy" />;
  if (healthStatus === "degraded") return <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" title="Degraded" />;
  if (healthStatus === "down") return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" title="Down" />;
  return <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 inline-block" title="Unknown" />;
}

type TabType = "clients" | "instances" | "insights";

const REGIONS = [
  { value: "nbg1", label: "Nuremberg, EU" },
  { value: "fsn1", label: "Falkenstein, EU" },
  { value: "ash", label: "Ashburn, US" },
  { value: "sin", label: "Singapore, APAC" },
] as const;

const TIERS = [
  { value: "minimal", label: "Minimal — 2 vCPU, 4 GB" },
  { value: "standard", label: "Standard — 4 vCPU, 8 GB" },
  { value: "pro", label: "Pro — 8 vCPU, 16 GB" },
] as const;

// Capacity defaults by manager plan (Manager model has no plan field yet, use fixed default)
const DEFAULT_CLIENT_CAPACITY = 25;

export function ManagerClient({ manager, clients: initialClients }: {
  manager: { id: string; name: string; email: string };
  clients: Client[];
}) {
  const t = useTranslations("manager");
  const [clients, setClients] = useState(initialClients);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("clients");

  // Sort state
  const [sortBy, setSortBy] = useState<"health" | "name" | "messages">("health");

  // Notes state
  const [openNotesClientId, setOpenNotesClientId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, ClientNote[]>>({});
  const [notesLoading, setNotesLoading] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState<Record<string, string>>({});
  const [notesSaving, setNotesSaving] = useState<string | null>(null);

  // Instances tab state
  const [instanceClients, setInstanceClients] = useState<ClientWithInstances[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);

  // Provisioning wizard
  interface WizardState {
    instanceId: string;
    instanceName: string;
    tier: string;
    provisionStatus: string | null;
    defaultRegion?: string;
  }
  const [wizardState, setWizardState] = useState<WizardState | null>(null);

  // Provision options (inline region + tier picker)
  const [provisionOptions, setProvisionOptions] = useState<{
    instanceId: string | null;
    region: string;
    tier: string;
  }>({ instanceId: null, region: "nbg1", tier: "minimal" });

  // Config editor state
  const [editingConfigForInstance, setEditingConfigForInstance] = useState<string | null>(null);
  const [managerConfig, setManagerConfig] = useState<Record<string, unknown>>({});
  const [managerConfigDirty, setManagerConfigDirty] = useState(false);
  const [managerConfigSaving, setManagerConfigSaving] = useState(false);
  const [managerConfigSaved, setManagerConfigSaved] = useState(false);

  // Push config state
  const [pushing, setPushing] = useState(false);
  const [toast, setToast] = useState<{ text: string; type?: "success" | "error" } | null>(null);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function pushConfig(instanceId: string) {
    setPushing(true);
    const res = await fetch(`/api/manager/instances/${instanceId}/sync-config`, { method: "POST" });
    if (res.ok) {
      showToast(t("configPushed"), "success");
    } else {
      const err = await res.json();
      showToast(err.error ?? t("configPushFailed"), "error");
    }
    setPushing(false);
  }

  // Chat log state
  const [chatLogInstanceId, setChatLogInstanceId] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatLogMessage[]>([]);
  const [chatLogLoading, setChatLogLoading] = useState(false);

  // Snapshot management state
  const [instanceSnapshots, setInstanceSnapshots] = useState<Record<string, InstanceSnapshot[]>>({});
  const [snapshotsInstanceId, setSnapshotsInstanceId] = useState<string | null>(null);
  const [snapshotsLoading, setSnapshotsLoading] = useState(false);
  const [takingSnapshotId, setTakingSnapshotId] = useState<string | null>(null);
  const [snapshotDoneId, setSnapshotDoneId] = useState<string | null>(null);
  const [rollbackConfirmKey, setRollbackConfirmKey] = useState<string | null>(null); // "instanceId:snapshotId"
  const [rollingBackKey, setRollingBackKey] = useState<string | null>(null);

  function openWizard(inst: ManagedInstance, region?: string) {
    setWizardState({
      instanceId: inst.id,
      instanceName: inst.name,
      tier: inst.tier,
      provisionStatus: inst.provisionStatus ?? null,
      defaultRegion: region,
    });
  }

  function closeWizard(instanceId?: string, newStatus?: string) {
    if (instanceId && newStatus) {
      setInstanceClients((prev) =>
        prev.map((c) => ({
          ...c,
          instances: c.instances.map((i) =>
            i.id === instanceId ? { ...i, provisionStatus: newStatus } : i
          ),
        }))
      );
    }
    setWizardState(null);
  }

  async function loadInstanceConfig(instanceId: string) {
    const res = await fetch(`/api/manager/instances/${instanceId}/config`);
    if (res.ok) {
      const data = await res.json();
      try {
        setManagerConfig(JSON.parse(data.config ?? "{}"));
      } catch {
        setManagerConfig({});
      }
      setEditingConfigForInstance(instanceId);
      setManagerConfigDirty(false);
      setManagerConfigSaved(false);
    }
  }

  async function loadChatLog(instanceId: string) {
    setChatLogLoading(true);
    setChatLogInstanceId(instanceId);
    const res = await fetch(`/api/manager/instances/${instanceId}/chat-log`);
    if (res.ok) setChatLog(await res.json());
    setChatLogLoading(false);
  }

  async function loadSnapshots(instanceId: string) {
    setSnapshotsLoading(true);
    setSnapshotsInstanceId(instanceId);
    const res = await fetch(`/api/instances/${instanceId}/snapshots`);
    if (res.ok) {
      const data = await res.json();
      setInstanceSnapshots((prev) => ({ ...prev, [instanceId]: data.snapshots ?? [] }));
    }
    setSnapshotsLoading(false);
  }

  async function takeSnapshot(instanceId: string) {
    setTakingSnapshotId(instanceId);
    await fetch(`/api/manager/instances/${instanceId}/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "manual" }),
    });
    setTakingSnapshotId(null);
    setSnapshotDoneId(instanceId);
    setTimeout(() => setSnapshotDoneId(null), 3000);
  }

  async function rollback(instanceId: string, snapshotId: string) {
    const key = `${instanceId}:${snapshotId}`;
    setRollingBackKey(key);
    await fetch(`/api/manager/instances/${instanceId}/rollback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshotId, type: "restic" }),
    });
    setRollingBackKey(null);
    setRollbackConfirmKey(null);
    // Refresh snapshots list
    await loadSnapshots(instanceId);
  }

  async function loadNotes(userId: string) {
    setNotesLoading(userId);
    const res = await fetch(`/api/manager/clients/${userId}/notes`);
    if (res.ok) {
      const data = await res.json();
      setNotesMap((prev) => ({ ...prev, [userId]: data.notes }));
    }
    setNotesLoading(null);
  }

  async function toggleNotes(userId: string) {
    if (openNotesClientId === userId) {
      setOpenNotesClientId(null);
    } else {
      setOpenNotesClientId(userId);
      if (!notesMap[userId]) {
        await loadNotes(userId);
      }
    }
  }

  async function addNote(userId: string) {
    const content = newNoteText[userId]?.trim();
    if (!content) return;
    setNotesSaving(userId);
    const res = await fetch(`/api/manager/clients/${userId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const note: ClientNote = await res.json();
      setNotesMap((prev) => ({ ...prev, [userId]: [note, ...(prev[userId] ?? [])] }));
      setNewNoteText((prev) => ({ ...prev, [userId]: "" }));
    }
    setNotesSaving(null);
  }

  async function deleteNote(userId: string, noteId: string) {
    const res = await fetch(`/api/manager/clients/${userId}/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      setNotesMap((prev) => ({ ...prev, [userId]: (prev[userId] ?? []).filter((n) => n.id !== noteId) }));
    }
  }

  // Sorted clients
  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === "health") {
      const sa = a.healthScore ?? -1;
      const sb = b.healthScore ?? -1;
      return sa - sb; // worst first = needs attention
    }
    if (sortBy === "name") {
      return (a.name ?? a.email).localeCompare(b.name ?? b.email);
    }
    if (sortBy === "messages") {
      return b.instances.length - a.instances.length; // approximate activity by instance count
    }
    return 0;
  });

  const totalUnread = clients.reduce((s, c) => s + c.unreadMessages, 0);
  const running = clients.flatMap((c) => c.instances).filter((i) => i.status === "running").length;
  const capacityPercent = Math.min(100, Math.round((clients.length / DEFAULT_CLIENT_CAPACITY) * 100));

  async function loadInstances() {
    setInstancesLoading(true);
    const res = await fetch("/api/manager/instances");
    if (res.ok) setInstanceClients(await res.json());
    setInstancesLoading(false);
  }

  useEffect(() => {
    if (activeTab === "instances" && instanceClients.length === 0) {
      loadInstances();
    }
  }, [activeTab]);

  const allInstances = instanceClients.flatMap((c) => c.instances);
  const totalInstanceCount = allInstances.length;
  const clientCount = instanceClients.filter((c) => c.instances.length > 0).length;

  const alerts = instanceClients.flatMap((c) =>
    c.instances
      .filter((i) => i.healthStatus === "down" || i.healthStatus === "degraded")
      .map((i) => ({ ...i, clientName: c.name ?? c.email, clientEmail: c.email }))
  );

  async function openThread(client: Client) {
    setActiveClient(client);
    setThreadLoading(true);
    setMessages([]);
    const res = await fetch(`/api/messages?userId=${client.id}`);
    if (res.ok) setMessages(await res.json());
    setThreadLoading(false);
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, unreadMessages: 0 } : c));
  }

  // SSE for real-time message updates from client
  useEffect(() => {
    if (!activeClient) return;

    const es = new EventSource(`/api/manager/messages/stream?userId=${activeClient.id}`);

    es.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data) as Message;
      setMessages((prev) => {
        // Only add if not already in list (avoid duplicates)
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Scroll to bottom on new message
      setTimeout(() => {
        const el = document.getElementById("manager-thread-scroll");
        if (el) el.scrollTop = el.scrollHeight;
      }, 50);
    });

    es.addEventListener("error", () => {
      // SSE error — connection will retry automatically
    });

    return () => {
      es.close();
    };
  }, [activeClient?.id]);

  async function sendReply() {
    if (!replyBody.trim() || !activeClient) return;
    setReplying(true);
    const res = await fetch(`/api/messages?asManager=true&userId=${activeClient.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setReplyBody("");
    }
    setReplying(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="font-semibold text-white">{manager.name}</div>
            <div className="text-xs text-zinc-500">{t("portalLabel")}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          {/* Capacity indicator */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium",
              capacityPercent >= 100 ? "text-red-400" : capacityPercent >= 80 ? "text-amber-400" : "text-white"
            )}>
              {clients.length}
            </span>
            <span>/ {DEFAULT_CLIENT_CAPACITY} {t("clients")}</span>
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  capacityPercent >= 100 ? "bg-red-500" : capacityPercent >= 80 ? "bg-amber-400" : "bg-violet-500"
                )}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
          <span><strong className="text-emerald-400">{running}</strong> running</span>
          {totalUnread > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread} unread</span>
          )}
          {alerts.length > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/5 px-4 md:px-8 flex gap-1">
        <button
          onClick={() => setActiveTab("clients")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "clients"
              ? "border-violet-500 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
        >
          <MessageCircle className="w-4 h-4" />
          Clients &amp; Messages
          {totalUnread > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
              {totalUnread}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("instances")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "instances"
              ? "border-violet-500 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Server className="w-4 h-4" />
          Instances
          {alerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "insights"
              ? "border-violet-500 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Lightbulb className="w-4 h-4" />
          Insights
        </button>
      </div>

      {/* ── Clients & Messages tab ── */}
      {activeTab === "clients" && (
        <div className="flex h-[calc(100vh-121px)]">
          {/* Client list — hidden on mobile when a client is selected */}
          <div className={`${activeClient ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-white/5 overflow-y-auto shrink-0 flex-col`}>
            {/* Sort buttons */}
            {clients.length > 0 && (
              <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1 text-xs">
                <span className="text-zinc-600 mr-1">{t("sortBy")}:</span>
                {(["health", "name", "messages"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      "px-2 py-1 rounded-lg transition-colors",
                      sortBy === s
                        ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {s === "health" ? t("sortByHealth") : s === "name" ? t("sortByName") : t("sortByActivity")}
                  </button>
                ))}
              </div>
            )}
            {clients.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">{t("noClients")}</p>
                <p className="text-zinc-600 text-xs mt-1">{t("noClientsDesc")}</p>
              </div>
            ) : (
              sortedClients.map((client) => {
                const od = client.onboardingData;
                return (
                  <div
                    key={client.id}
                    className={cn(
                      "border-b border-white/5",
                      activeClient?.id === client.id && "border-l-2 border-l-violet-500"
                    )}
                  >
                    <button
                      onClick={() => openThread(client)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-white/[0.03] transition-colors",
                        activeClient?.id === client.id && "bg-white/[0.05]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                          {client.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white truncate">{client.name ?? client.email}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {client.healthScore !== null && <HealthScoreBadge score={client.healthScore} />}
                              {client.unreadMessages > 0 && (
                                <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                  {client.unreadMessages}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500 truncate">{client.email}</div>
                          {od && (
                            <div className="text-xs text-zinc-600 mt-0.5 truncate">
                              {od.businessName} · {od.useCase}
                            </div>
                          )}
                          {client.lastMessage && (
                            <div className="text-xs text-zinc-600 mt-1 truncate">
                              {client.lastMessage.senderType === "user" ? "→ " : "← "}{client.lastMessage.body}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                    {/* Notes toggle button */}
                    <div className="px-4 pb-2 flex items-center gap-2">
                      <button
                        onClick={() => toggleNotes(client.id)}
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors",
                          openNotesClientId === client.id
                            ? "text-amber-300 bg-amber-500/10 border border-amber-500/20"
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        <StickyNote className="w-3 h-3" />
                        {t("notes")}
                        {openNotesClientId === client.id
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                    {/* Notes panel */}
                    {openNotesClientId === client.id && (
                      <div className="px-4 pb-3 space-y-2">
                        {notesLoading === client.id ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                          </div>
                        ) : (
                          <>
                            {(notesMap[client.id] ?? []).map((note) => (
                              <div key={note.id} className="bg-white/[0.03] border border-white/10 rounded-lg p-2.5 text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-zinc-300 whitespace-pre-wrap flex-1">{note.content}</p>
                                  <button
                                    onClick={() => deleteNote(client.id, note.id)}
                                    className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                                    title={t("deleteNote")}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-zinc-600 mt-1">{formatRelativeTime(note.updatedAt)}</p>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <textarea
                                value={newNoteText[client.id] ?? ""}
                                onChange={(e) => setNewNoteText((prev) => ({ ...prev, [client.id]: e.target.value }))}
                                placeholder={t("notePlaceholder")}
                                rows={2}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                              />
                              <button
                                onClick={() => addNote(client.id)}
                                disabled={!newNoteText[client.id]?.trim() || notesSaving === client.id}
                                className="self-end flex items-center gap-1 bg-amber-600/80 hover:bg-amber-500 disabled:opacity-40 transition-colors px-2.5 py-1.5 rounded-lg text-xs font-medium text-white"
                              >
                                {notesSaving === client.id ? <Loader2 className="w-3 h-3 animate-spin" /> : t("addNote")}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Thread / detail */}
          {activeClient ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile back button */}
              <button
                onClick={() => setActiveClient(null)}
                className="md:hidden flex items-center gap-2 px-4 py-3 text-sm text-zinc-400 hover:text-white border-b border-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                All clients
              </button>
              {/* Client header */}
              <div className="p-5 border-b border-white/5 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-white">{activeClient.name ?? activeClient.email}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span>{activeClient.email}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="capitalize">
                        {PLANS[activeClient.plan as keyof typeof PLANS]?.label ?? activeClient.plan} plan
                      </span>
                      <span className="text-zinc-700">·</span>
                      <span>Joined {formatDate(activeClient.createdAt)}</span>
                    </div>
                    {activeClient.onboardingData && (() => {
                      const d = activeClient.onboardingData;
                      if (!d) return null;
                      return (
                        <div className="flex gap-4 mt-2 text-xs">
                          {d.businessName && <span className="text-zinc-400"><span className="text-zinc-600">biz:</span> {d.businessName}</span>}
                          {d.industry && <span className="text-zinc-400"><span className="text-zinc-600">industry:</span> {d.industry}</span>}
                          {d.agentType && <span className="text-zinc-400"><span className="text-zinc-600">type:</span> {d.agentType}</span>}
                        </div>
                      );
                    })()}
                  </div>
                  {/* Instances mini-list */}
                  <div className="flex gap-2 flex-wrap">
                    {activeClient.instances.map((inst) => (
                      <span key={inst.id} className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[inst.status]}`}>
                        {inst.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div id="manager-thread-scroll" className="flex-1 overflow-y-auto p-5 space-y-3">
                {threadLoading && (
                  <div className="flex justify-center pt-8">
                    <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                  </div>
                )}
                {!threadLoading && messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No messages yet. Say hello!</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isManager = msg.senderType === "manager";
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isManager ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                        isManager
                          ? "bg-violet-600 text-white rounded-tr-sm"
                          : "bg-white/[0.05] border border-white/10 text-zinc-200 rounded-tl-sm"
                      )}>
                        <div className="text-xs font-medium mb-1 opacity-60">
                          {isManager ? t("you") : activeClient.name ?? t("client")}
                        </div>
                        {msg.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                    }}
                    placeholder={`Reply to ${activeClient.name ?? activeClient.email}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                  <button
                    onClick={sendReply}
                    disabled={replying || !replyBody.trim()}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">Select a client to view their messages and details.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Instances tab ── */}
      {activeTab === "instances" && (
        <div className="p-8 max-w-5xl mx-auto">
          {instancesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-zinc-400">
                  <strong className="text-white">{totalInstanceCount}</strong>{" "}
                  instance{totalInstanceCount !== 1 ? "s" : ""} across{" "}
                  <strong className="text-white">{clientCount}</strong>{" "}
                  client{clientCount !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={loadInstances}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <Activity className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* Alerts section */}
              {alerts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
                      Alerts — {alerts.length} instance{alerts.length !== 1 ? "s" : ""} need attention
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "flex items-center gap-4 rounded-xl border px-4 py-3",
                          alert.healthStatus === "down"
                            ? "bg-red-500/5 border-red-500/30"
                            : "bg-yellow-500/5 border-yellow-500/30"
                        )}
                      >
                        <HealthDot healthStatus={alert.healthStatus} hasVps={alert.hasGateway} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{alert.name}</span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              alert.healthStatus === "down"
                                ? "bg-red-500/20 text-red-300"
                                : "bg-yellow-500/20 text-yellow-300"
                            )}>
                              {alert.healthStatus}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5">
                            {alert.clientName} · {alert.clientEmail}
                          </div>
                        </div>
                        {alert.lastCheckedAt && (
                          <span className="text-xs text-zinc-600 shrink-0">
                            {formatRelativeTime(alert.lastCheckedAt)}
                          </span>
                        )}
                        <a
                          href={`/admin#instance-${alert.id}`}
                          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instances grouped by client */}
              {instanceClients.length === 0 ? (
                <div className="text-center py-16">
                  <Server className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">No instances found for your clients.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {instanceClients.map((client) => (
                    <div key={client.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                      {/* Client section header */}
                      <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3 bg-white/[0.01]">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                          {client.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">{client.name ?? client.email}</span>
                          <span className="text-xs text-zinc-500 ml-2">{client.email}</span>
                        </div>
                        <span className="ml-auto text-xs text-zinc-600">
                          {client.instances.length} instance{client.instances.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {client.instances.length === 0 ? (
                        <div className="px-5 py-4 text-xs text-zinc-600">No instances yet.</div>
                      ) : (
                        <div className="divide-y divide-white/5">
                          {client.instances.map((inst) => (
                            <div key={inst.id} className="px-5 py-3">
                              {/* Instance row */}
                              <div className="flex items-center gap-3 text-sm">
                                <HealthDot healthStatus={inst.healthStatus} hasVps={inst.hasGateway} />
                                <span className="font-medium text-white">{inst.name}</span>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full font-medium",
                                  STATUS_COLORS[inst.status] ?? "text-zinc-400 bg-zinc-400/10"
                                )}>
                                  {inst.status}
                                </span>
                                <span className="text-xs text-zinc-500 capitalize">{inst.tier}</span>
                                {inst.vpsUrl && (
                                  <span className="text-xs text-zinc-600 font-mono truncate max-w-[160px]">
                                    {inst.vpsUrl}
                                  </span>
                                )}
                                <div className="ml-auto flex items-center gap-2 shrink-0">
                                  {/* Edit Config button */}
                                  <button
                                    onClick={() => {
                                      if (editingConfigForInstance === inst.id) {
                                        setEditingConfigForInstance(null);
                                      } else {
                                        setChatLogInstanceId(null);
                                        setProvisionOptions(p => ({ ...p, instanceId: null }));
                                        loadInstanceConfig(inst.id);
                                      }
                                    }}
                                    className={cn(
                                      "text-xs px-3 py-1.5 rounded-lg transition-colors",
                                      editingConfigForInstance === inst.id
                                        ? "text-violet-300 bg-violet-500/20 border border-violet-500/30"
                                        : "text-violet-400 hover:text-violet-300 bg-violet-500/10"
                                    )}
                                  >
                                    {t("editConfig")}
                                  </button>

                                  {/* Chat Log button */}
                                  <button
                                    onClick={() => {
                                      if (chatLogInstanceId === inst.id) {
                                        setChatLogInstanceId(null);
                                      } else {
                                        setEditingConfigForInstance(null);
                                        setProvisionOptions(p => ({ ...p, instanceId: null }));
                                        loadChatLog(inst.id);
                                      }
                                    }}
                                    className={cn(
                                      "text-xs px-3 py-1.5 rounded-lg transition-colors",
                                      chatLogInstanceId === inst.id
                                        ? "text-blue-300 bg-blue-500/20 border border-blue-500/30"
                                        : "text-blue-400 hover:text-blue-300 bg-blue-500/10"
                                    )}
                                  >
                                    {t("viewChatLog")}
                                  </button>

                                  {/* Snapshots button */}
                                  <button
                                    onClick={() => {
                                      if (snapshotsInstanceId === inst.id) {
                                        setSnapshotsInstanceId(null);
                                      } else {
                                        setEditingConfigForInstance(null);
                                        setChatLogInstanceId(null);
                                        loadSnapshots(inst.id);
                                      }
                                    }}
                                    className={cn(
                                      "text-xs px-3 py-1.5 rounded-lg transition-colors",
                                      snapshotsInstanceId === inst.id
                                        ? "text-amber-300 bg-amber-500/20 border border-amber-500/30"
                                        : "text-amber-400 hover:text-amber-300 bg-amber-500/10"
                                    )}
                                  >
                                    {t("snapshots")}
                                  </button>

                                  {/* Provision button */}
                                  {!inst.hasGateway && (
                                    <button
                                      onClick={() => {
                                        setEditingConfigForInstance(null);
                                        setChatLogInstanceId(null);
                                        if (provisionOptions.instanceId === inst.id) {
                                          setProvisionOptions(p => ({ ...p, instanceId: null }));
                                        } else {
                                          setProvisionOptions({ instanceId: inst.id, region: "nbg1", tier: inst.tier || "minimal" });
                                        }
                                      }}
                                      className={cn(
                                        "flex items-center gap-1 text-xs border px-2 py-1 rounded-lg transition-colors",
                                        provisionOptions.instanceId === inst.id
                                          ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/30"
                                          : "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20"
                                      )}
                                      title={t("provisionVpsTitle")}
                                    >
                                      <Rocket className="w-3 h-3" />
                                      {inst.provisionStatus ? inst.provisionStatus : t("provision")}
                                    </button>
                                  )}
                                  <a
                                    href={`/admin#instance-${inst.id}`}
                                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                                  >
                                    View <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>

                              {/* ── Provision Options Panel ── */}
                              {provisionOptions.instanceId === inst.id && (
                                <div className="mt-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white">{t("provisionOptions")}</h4>
                                    <button
                                      onClick={() => setProvisionOptions(p => ({ ...p, instanceId: null }))}
                                      className="text-zinc-600 hover:text-white transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Region picker */}
                                    <div>
                                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                        {t("region")}
                                      </label>
                                      <div className="relative">
                                        <select
                                          value={provisionOptions.region}
                                          onChange={(e) => setProvisionOptions(p => ({ ...p, region: e.target.value }))}
                                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors pr-8"
                                        >
                                          {REGIONS.map((r) => (
                                            <option key={r.value} value={r.value} className="bg-zinc-900">
                                              {r.label}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </div>
                                    </div>

                                    {/* Tier picker */}
                                    <div>
                                      <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                        {t("tier")}
                                      </label>
                                      <div className="relative">
                                        <select
                                          value={provisionOptions.tier}
                                          onChange={(e) => setProvisionOptions(p => ({ ...p, tier: e.target.value }))}
                                          className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors pr-8"
                                        >
                                          {TIERS.map((tier) => (
                                            <option key={tier.value} value={tier.value} className="bg-zinc-900">
                                              {tier.label}
                                            </option>
                                          ))}
                                        </select>
                                        <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => {
                                        const selectedRegion = provisionOptions.region;
                                        setProvisionOptions(p => ({ ...p, instanceId: null }));
                                        openWizard(inst, selectedRegion);
                                      }}
                                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                                    >
                                      <Rocket className="w-4 h-4" />
                                      {t("confirmProvision")}
                                    </button>
                                    <button
                                      onClick={() => setProvisionOptions(p => ({ ...p, instanceId: null }))}
                                      className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors"
                                    >
                                      {t("cancelProvision")}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* ── Config Editor Panel ── */}
                              {editingConfigForInstance === inst.id && (
                                <div className="mt-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-white">{t("configEditor")}</h4>
                                    <div className="flex items-center gap-3">
                                      {managerConfigSaved && (
                                        <span className="text-xs text-emerald-400">{t("configSaved")}</span>
                                      )}
                                      <button
                                        onClick={() => setEditingConfigForInstance(null)}
                                        className="text-zinc-600 hover:text-white transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Agent Name */}
                                  <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                      {t("agentName")}
                                    </label>
                                    <input
                                      type="text"
                                      value={(managerConfig.agentName as string) ?? ""}
                                      onChange={(e) => {
                                        setManagerConfig(p => ({ ...p, agentName: e.target.value }));
                                        setManagerConfigDirty(true);
                                        setManagerConfigSaved(false);
                                      }}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                  </div>

                                  {/* System Prompt */}
                                  <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                      {t("systemPrompt")}
                                    </label>
                                    <textarea
                                      value={(managerConfig.systemPrompt as string) ?? ""}
                                      onChange={(e) => {
                                        setManagerConfig(p => ({ ...p, systemPrompt: e.target.value }));
                                        setManagerConfigDirty(true);
                                        setManagerConfigSaved(false);
                                      }}
                                      rows={4}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                                    />
                                  </div>

                                  {/* Role */}
                                  <div>
                                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                      {t("agentRole")}
                                    </label>
                                    <input
                                      type="text"
                                      value={(managerConfig.role as string) ?? ""}
                                      onChange={(e) => {
                                        setManagerConfig(p => ({ ...p, role: e.target.value }));
                                        setManagerConfigDirty(true);
                                        setManagerConfigSaved(false);
                                      }}
                                      placeholder={t("agentRolePlaceholder")}
                                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                                    />
                                  </div>

                                  {/* Save + Push buttons */}
                                  <div className="flex flex-wrap items-center gap-3">
                                    <button
                                      disabled={!managerConfigDirty || managerConfigSaving}
                                      onClick={async () => {
                                        setManagerConfigSaving(true);
                                        const res = await fetch(`/api/manager/instances/${inst.id}/config`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ config: JSON.stringify(managerConfig) }),
                                        });
                                        setManagerConfigSaving(false);
                                        if (res.ok) {
                                          setManagerConfigDirty(false);
                                          setManagerConfigSaved(true);
                                        }
                                      }}
                                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                                    >
                                      {managerConfigSaving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />{t("saving")}</>
                                      ) : (
                                        t("saveConfig")
                                      )}
                                    </button>
                                    <button
                                      onClick={() => pushConfig(inst.id)}
                                      disabled={pushing}
                                      className="flex items-center gap-2 text-sm px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors disabled:opacity-50"
                                    >
                                      {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                      {t("pushConfig")}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* ── Chat Log Panel ── */}
                              {chatLogInstanceId === inst.id && (
                                <div className="mt-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-white">{t("chatLog")}</h4>
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-zinc-500">{t("readOnly")}</span>
                                      <button
                                        onClick={() => setChatLogInstanceId(null)}
                                        className="text-zinc-600 hover:text-white transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {chatLogLoading ? (
                                    <div className="flex justify-center py-6">
                                      <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                                    </div>
                                  ) : chatLog.length === 0 ? (
                                    <p className="text-sm text-zinc-500 text-center py-6">{t("noChatMessages")}</p>
                                  ) : (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                      {chatLog.map((msg) => (
                                        <div
                                          key={msg.id}
                                          className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
                                        >
                                          <div className={cn(
                                            "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                                            msg.role === "user"
                                              ? "bg-violet-600/20 border border-violet-500/20 text-violet-100"
                                              : "bg-white/5 border border-white/10 text-zinc-200"
                                          )}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <p className="text-xs text-zinc-600 mt-1">
                                              {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* ── Snapshots Panel ── */}
                              {snapshotsInstanceId === inst.id && (
                                <div className="mt-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold text-white">{t("snapshotsPanel")}</h4>
                                    <div className="flex items-center gap-3">
                                      {snapshotDoneId === inst.id && (
                                        <span className="text-xs text-emerald-400">{t("snapshotQueued")}</span>
                                      )}
                                      <button
                                        onClick={() => takeSnapshot(inst.id)}
                                        disabled={takingSnapshotId === inst.id}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors disabled:opacity-50"
                                      >
                                        {takingSnapshotId === inst.id ? (
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                          "📸"
                                        )}
                                        {t("takeSnapshot")}
                                      </button>
                                      <button
                                        onClick={() => setSnapshotsInstanceId(null)}
                                        className="text-zinc-600 hover:text-white transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {snapshotsLoading ? (
                                    <div className="flex justify-center py-6">
                                      <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                                    </div>
                                  ) : !instanceSnapshots[inst.id] || instanceSnapshots[inst.id].length === 0 ? (
                                    <p className="text-sm text-zinc-500 text-center py-4">{t("noSnapshots")}</p>
                                  ) : (
                                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                                      {instanceSnapshots[inst.id].slice(0, 15).map((snap) => {
                                        const confirmKey = `${inst.id}:${snap.snapshotId}`;
                                        const isRollingBack = rollingBackKey === confirmKey;
                                        return (
                                          <div key={snap.id} className="flex items-center justify-between p-2.5 bg-white/[0.02] rounded-lg border border-white/5">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <span className="text-xs text-zinc-300 font-mono shrink-0">{snap.snapshotId?.slice(0, 10)}</span>
                                              {snap.label && (
                                                <span className="text-xs bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded shrink-0">{snap.label}</span>
                                              )}
                                              <span className={`text-xs ${snap.healthy ? "text-emerald-400" : "text-red-400"}`}>
                                                {snap.healthy ? "✓" : "✗"}
                                              </span>
                                              <span className="text-xs text-zinc-600 truncate">
                                                {snap.sizeBytes ? `${(snap.sizeBytes / 1024 / 1024).toFixed(1)}MB · ` : ""}
                                                {new Date(snap.createdAt).toLocaleString()}
                                              </span>
                                            </div>
                                            {rollbackConfirmKey === confirmKey ? (
                                              <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                  onClick={() => rollback(inst.id, snap.snapshotId)}
                                                  disabled={isRollingBack}
                                                  className="text-xs px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                  {isRollingBack ? <Loader2 className="w-3 h-3 animate-spin inline" /> : t("confirmRollback")}
                                                </button>
                                                <button
                                                  onClick={() => setRollbackConfirmKey(null)}
                                                  className="text-xs text-zinc-500 hover:text-white"
                                                >
                                                  {t("cancel")}
                                                </button>
                                              </div>
                                            ) : (
                                              <button
                                                onClick={() => setRollbackConfirmKey(confirmKey)}
                                                className="text-xs text-zinc-500 hover:text-amber-400 transition-colors shrink-0"
                                              >
                                                {t("restore")}
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Insights tab ── */}
      {activeTab === "insights" && (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Conversation Intelligence</h2>
            <p className="text-zinc-400 text-sm">
              AI-powered insights from your clients&apos; conversations. Review unanswered questions, 
              complaints, and high-value intents that need attention.
            </p>
          </div>
          <ManagerInsightsPanel />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border ${
          toast.type === "error" ? "bg-red-600/90 border-red-500 text-white" : "bg-emerald-600/90 border-emerald-500 text-white"
        }`}>{toast.text}</div>
      )}

      {/* Provisioning Wizard */}
      {wizardState && (
        <ProvisioningWizard
          instanceId={wizardState.instanceId}
          instanceName={wizardState.instanceName}
          tier={wizardState.tier}
          provisionStatus={wizardState.provisionStatus}
          provisionEndpoint={`/api/manager/instances/${wizardState.instanceId}/provision`}
          defaultRegion={wizardState.defaultRegion as import("@/lib/provisioning").HetznerRegion | undefined}
          onClose={() => closeWizard()}
          onDone={(status) => closeWizard(wizardState.instanceId, status)}
        />
      )}
    </div>
  );
}
