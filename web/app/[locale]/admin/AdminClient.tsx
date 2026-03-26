"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users, Bot, Activity, AlertCircle, Plus, X, Shield, ChevronDown, MessageCircle, Send, Loader2, Server, Link, Unlink, CheckCircle2, Rocket, RefreshCw, Copy, Check, Gift, DollarSign, BarChart2, TrendingUp, Tag, Camera, RotateCcw, Database } from "lucide-react";
import { useTranslations } from "next-intl";
import { STATUS_COLORS, PLANS, formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProvisioningWizard } from "@/components/ProvisioningWizard";
import NextLink from "next/link";
import { Mail } from "lucide-react";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  managerId: string | null;
  managerName: string | null;
  onboardingData: { businessName?: string; industry?: string; useCase?: string; teamSize?: string; agentType?: string } | null;
  instances: {
    id: string;
    name: string;
    type: string;
    tier: string;
    status: string;
    healthStatus?: string | null;
    vpsUrl: string | null;
    hasGateway: boolean;
    configSynced?: boolean;
    provisionStatus?: string | null;
    sandboxMode?: boolean;
    sandboxUsed?: number;
    hasLLMKey?: boolean;
    hasChannel?: boolean;
  }[];
  unreadMessages: number;
}

interface SyncResult {
  config: string;
  syncCommand: string | null;
  instanceId: string;
  vpsUrl: string | null;
}

interface HealthIssue {
  id: string;
  name: string;
  healthStatus: string;
  lastCheckedAt: string | null;
  userEmail: string;
}

interface HealthSummary {
  monitored: number;
  healthy: number;
  degraded: number;
  down: number;
  unknown: number;
  issues: HealthIssue[];
}

interface HetznerSnapshot {
  id: number;
  description: string;
  created: string;
  disk_size: number;
}

function HetznerSnapshotPanel({ instanceId }: { instanceId: string }) {
  const t = useTranslations("admin");
  const [snapshots, setSnapshots] = useState<HetznerSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [taking, setTaking] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/instances/${instanceId}/hetzner-snapshot`);
      const data = (await res.json()) as { snapshots?: HetznerSnapshot[] };
      setSnapshots(data.snapshots ?? []);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => { load(); }, [load]);

  async function takeSnapshot() {
    setTaking(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/instances/${instanceId}/hetzner-snapshot`, { method: "POST" });
      if (res.ok) {
        setMessage(t("hetznerSnapshotTaken"));
        setTimeout(load, 3000);
      } else {
        const d = (await res.json()) as { error?: string };
        setMessage(`Error: ${d.error ?? "unknown"}`);
      }
    } finally {
      setTaking(false);
    }
  }

  async function restore(imageId: number) {
    setRestoringId(imageId);
    setConfirmId(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/instances/${instanceId}/hetzner-restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId }),
      });
      const d = (await res.json()) as { ok?: boolean; error?: string };
      setMessage(d.ok ? "Restore triggered. Server is rebuilding." : `Error: ${d.error ?? "unknown"}`);
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="mt-2 px-3 py-3 bg-black/20 rounded-xl border border-white/5 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 font-medium flex items-center gap-1.5">
          <Camera className="w-3 h-3" /> {t("hetznerSnapshots")}
        </span>
        <div className="flex items-center gap-1.5">
          {loading && <Loader2 className="w-3 h-3 animate-spin text-zinc-600" />}
          <button
            onClick={takeSnapshot}
            disabled={taking}
            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2 py-0.5 rounded transition-colors disabled:opacity-40"
          >
            {taking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
            {t("takeHetznerSnapshot")}
          </button>
        </div>
      </div>
      {message && (
        <p className={`mb-2 text-xs ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
          {message}
        </p>
      )}
      {snapshots.length === 0 && !loading ? (
        <p className="text-zinc-600">{t("noHetznerSnapshots")}</p>
      ) : (
        <div className="space-y-1">
          {snapshots.map((snap) => (
            <div key={snap.id} className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-zinc-300 truncate">{snap.description}</p>
                <p className="text-zinc-600">
                  {new Date(snap.created).toLocaleString()} · {snap.disk_size} GB
                </p>
              </div>
              {confirmId === snap.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-amber-400 text-[11px]">Sure?</span>
                  <button
                    onClick={() => restore(snap.id)}
                    disabled={restoringId !== null}
                    className="text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 transition-colors"
                  >
                    {restoringId === snap.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors px-1">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(snap.id)}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded transition-colors shrink-0"
                  title={t("hetznerRestoreConfirm")}
                >
                  <RotateCcw className="w-3 h-3" /> {t("hetznerRestore")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// Restic Rollback Panel Component
function ResticRollbackPanel({ instanceId }: { instanceId: string }) {
  const t = useTranslations("admin");
  const [snapshots, setSnapshots] = useState<Array<{
    id: string;
    snapshotId: string;
    sizeBytes: number | null;
    healthy: boolean;
    label: string | null;
    tag: string | null;
    triggeredBy: string | null;
    createdAt: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/instances/${instanceId}/snapshots`);
      const data = await res.json();
      setSnapshots(data.snapshots ?? []);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  useEffect(() => { load(); }, [load]);

  async function rollback(snapshotId?: string) {
    setRollingBack(true);
    setConfirmId(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/instances/${instanceId}/restic-rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshotId }),
      });
      const data = await res.json();
      setMessage(data.ok ? "Rollback queued. The instance will restore shortly." : `Error: ${data.error ?? "unknown"}`);
    } finally {
      setRollingBack(false);
    }
  }

  return (
    <div className="mt-2 px-3 py-3 bg-amber-950/20 rounded-xl border border-amber-500/20 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-amber-300">Restic Data Rollback</span>
        <button
          onClick={load}
          disabled={loading}
          className="text-zinc-500 hover:text-amber-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {message && (
        <div className={`mb-2 px-2 py-1.5 rounded border ${message.includes("Error") ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-zinc-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</div>
      ) : snapshots.length === 0 ? (
        <div className="text-zinc-500">No Restic snapshots found.</div>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1.5 bg-amber-500/10 rounded border border-amber-500/20">
            <span className="text-zinc-400">Restore to latest snapshot</span>
            <button
              onClick={() => rollback()}
              disabled={rollingBack}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded transition-colors"
            >
              {rollingBack ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              Rollback Latest
            </button>
          </div>
          {snapshots.map((snap) => (
            <div key={snap.id} className="flex items-center justify-between px-2 py-1.5 bg-black/20 rounded">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-300 font-mono text-[10px]">{snap.snapshotId.slice(0, 8)}...</span>
                  {snap.healthy && <span className="text-[10px] px-1 rounded bg-emerald-500/20 text-emerald-400">healthy</span>}
                  {snap.tag && <span className="text-[10px] px-1 rounded bg-blue-500/20 text-blue-400">{snap.tag}</span>}
                </div>
                <p className="text-zinc-500 text-[10px]">
                  {new Date(snap.createdAt).toLocaleString()}
                  {snap.sizeBytes ? ` · ${(snap.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ""}
                </p>
              </div>
              {confirmId === snap.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-amber-400 text-[11px]">Sure?</span>
                  <button
                    onClick={() => rollback(snap.snapshotId)}
                    disabled={rollingBack}
                    className="text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 transition-colors"
                  >
                    {rollingBack ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                  </button>
                  <button onClick={() => setConfirmId(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors px-1">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(snap.id)}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded transition-colors shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Rollback
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function HealthDot({ healthStatus }: { healthStatus?: string | null }) {
  if (healthStatus === "healthy") return <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Healthy" />;
  if (healthStatus === "degraded") return <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" title="Degraded" />;
  if (healthStatus === "down") return <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" title="Down" />;
  return <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" title="No health data" />;
}

interface ManagerRow {
  id: string;
  name: string;
  email: string;
  userCount: number;
}

interface Stats {
  totalUsers: number;
  totalInstances: number;
  runningInstances: number;
  unassigned: number;
}

interface Message {
  id: string;
  body: string;
  senderType: string;
  createdAt: string;
}

// Per-instance gateway modal state
interface GatewayModal {
  instanceId: string;
  vpsUrl: string;
  gatewayToken: string;
  saving: boolean;
  result: { ok: boolean; message: string } | null;
}

interface AdminReferralConversion {
  id: string;
  referrerName: string | null;
  referrerEmail: string;
  referredName: string | null;
  referredEmail: string;
  plan: string;
  status: string;
  commissionUsd: number | null;
  monthsRemaining: number;
  createdAt: string;
  convertedAt: string | null;
}

export function AdminClient({ users: initialUsers, managers: initialManagers, stats, healthSummary: initialHealthSummary }: {
  users: UserRow[];
  managers: ManagerRow[];
  stats: Stats;
  healthSummary: HealthSummary;
}) {
  const t = useTranslations("admin");
  const [users, setUsers] = useState(initialUsers);
  const [managers, setManagers] = useState(initialManagers);
  const [healthSummary, setHealthSummary] = useState<HealthSummary>(initialHealthSummary);

  // Manager creation
  const [showCreateManager, setShowCreateManager] = useState(false);
  const [managerForm, setManagerForm] = useState({ name: "", email: "", calLink: "" });
  const [creatingManager, setCreatingManager] = useState(false);
  const [managerError, setManagerError] = useState("");

  // Client invite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", managerId: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Message thread modal
  const [activeThread, setActiveThread] = useState<UserRow | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);

  // Gateway modal
  const [gatewayModal, setGatewayModal] = useState<GatewayModal | null>(null);

  // Provisioning Wizard
  interface WizardState {
    instanceId: string;
    instanceName: string;
    tier: string;
    provisionStatus: string | null;
  }
  const [wizardState, setWizardState] = useState<WizardState | null>(null);

  function openWizard(instanceId: string, instanceName: string, tier: string, provisionStatus: string | null) {
    setWizardState({ instanceId, instanceName, tier, provisionStatus });
  }

  function closeWizard(instanceId?: string, newStatus?: string) {
    if (instanceId && newStatus) {
      setUsers((prev) => prev.map((u) => ({
        ...u,
        instances: u.instances.map((i) =>
          i.id === instanceId ? { ...i, provisionStatus: newStatus } : i
        ),
      })));
    }
    setWizardState(null);
  }

  // Provision & sync state
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<{ instanceId: string; message: string; ok: boolean } | null>(null);
  const [pendingProvisionUserId, setPendingProvisionUserId] = useState<string | null>(null);
  const [pendingProvisionInstanceId, setPendingProvisionInstanceId] = useState<string | null>(null);
  const [pendingDisconnectInstanceId, setPendingDisconnectInstanceId] = useState<string | null>(null);
  const [pendingDeleteManagerId, setPendingDeleteManagerId] = useState<string | null>(null);
  const [provisioningUserId, setProvisioningUserId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [copiedSync, setCopiedSync] = useState(false);

  // Hetzner snapshots panel visibility
  const [snapshotPanelId, setSnapshotPanelId] = useState<string | null>(null);
  const [resticPanelId, setResticPanelId] = useState<string | null>(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "analytics" | "leads">("overview");
  const [leads, setLeads] = useState<Array<{ id: string; email: string; source: string; createdAt: string }>>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  // Analytics tab
  interface AnalyticsData {
    planCounts: { free: number; pro: number; enterprise: number };
    mrr: number;
    totalUsers: number;
    newThisWeek: number;
    activeInstances: number;
    provisionedVps: number;
    healthBreakdown: { healthy: number; degraded: number; down: number; notDeployed: number };
    downInstances: { id: string; name: string; userEmail: string }[];
    userGrowth: { date: string; count: number }[];
    managerEfficiency: { id: string; name: string; email: string; userCount: number }[];
    unassignedUsers: number;
    funnel?: {
      signedUp: number;
      emailVerified: number;
      onboardingDone: number;
      triedSandbox: number;
      sandboxExhausted: number;
      addedApiKey: number;
      connectedTelegram: number;
    };
  }
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const analyticsLoadedRef = useRef(false);

  useEffect(() => {
    if (activeTab === "analytics" && !analyticsLoadedRef.current) {
      analyticsLoadedRef.current = true;
      setAnalyticsLoading(true);
      fetch("/api/admin/analytics")
        .then((r) => r.json())
        .then((d) => { setAnalyticsData(d); })
        .finally(() => setAnalyticsLoading(false));
    }
  }, [activeTab]);

  // Referrals tab
  const [referralConversions, setReferralConversions] = useState<AdminReferralConversion[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralLoaded, setReferralLoaded] = useState(false);
  const [referralOutstanding, setReferralOutstanding] = useState(0);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // Leads tab
  const leadsLoadedRef = useRef(false);
  const [upgradeRequests, setUpgradeRequests] = useState<Array<{
    id: string;
    details: string;
    createdAt: string;
    userEmail: string | null;
    userName: string | null;
    currentPlan: string | null;
    userId: string | null;
    instanceId: string | null;
  }>>([]);
  const [activatingUpgrade, setActivatingUpgrade] = useState<string | null>(null);
  const [upgradesLoading, setUpgradesLoading] = useState(false);
  const upgradesLoadedRef = useRef(false);

  useEffect(() => {
    if (activeTab === "leads" && !leadsLoadedRef.current) {
      leadsLoadedRef.current = true;
      setLeadsLoading(true);
      fetch("/api/admin/waitlist")
        .then((r) => r.json())
        .then((d) => { if (Array.isArray(d)) setLeads(d); })
        .finally(() => setLeadsLoading(false));
    }
  }, [activeTab]);

  // Fetch upgrade requests when leads tab is active
  useEffect(() => {
    if (activeTab === "leads" && !upgradesLoadedRef.current) {
      upgradesLoadedRef.current = true;
      setUpgradesLoading(true);
      fetch("/api/admin/upgrade-requests")
        .then((r) => r.json())
        .then((d) => { if (Array.isArray(d)) setUpgradeRequests(d); })
        .finally(() => setUpgradesLoading(false));
    }
  }, [activeTab]);

  // Poll health summary every 30s for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/health-summary")
        .then((r) => r.json())
        .then((d) => setHealthSummary(d))
        .catch(() => {}); // ignore errors
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "referrals" && !referralLoaded) {
      setReferralLoading(true);
      fetch("/api/admin/referrals")
        .then((r) => r.json())
        .then((d) => {
          setReferralConversions(d.conversions ?? []);
          setReferralOutstanding(d.totalOutstandingUsd ?? 0);
          setReferralLoaded(true);
        })
        .finally(() => setReferralLoading(false));
    }
  }, [activeTab, referralLoaded]);

  async function markAsPaid(id: string) {
    setMarkingPaid(id);
    const res = await fetch("/api/admin/referrals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      const conv = referralConversions.find((c) => c.id === id);
      setReferralConversions((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "paid" } : c))
      );
      setReferralOutstanding((prev) => Math.max(0, prev - (conv?.commissionUsd ?? 0)));
    }
    setMarkingPaid(null);
  }

  async function activateUpgrade(userId: string, requestId: string, requestedPlan: string) {
    setActivatingUpgrade(requestId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: requestedPlan }),
    });
    setActivatingUpgrade(null);
    if (res.ok) {
      // Update local user plan + remove request from list
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: requestedPlan } : u));
      setUpgradeRequests(prev => prev.filter(r => r.id !== requestId));
    }
  }

  async function createManager() {
    setCreatingManager(true);
    setManagerError("");
    const res = await fetch("/api/admin/managers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(managerForm),
    });
    const data = await res.json();
    setCreatingManager(false);
    if (!res.ok) { setManagerError(data.error); return; }
    setManagers((prev) => [...prev, { ...data, userCount: 0 }]);
    setManagerForm({ name: "", email: "", calLink: "" });
    setShowCreateManager(false);
  }

  async function inviteClient() {
    setInviting(true);
    setInviteError("");
    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) { setInviteError(data.error); return; }
    setInviteSuccess(`Invite sent to ${inviteForm.email}!`);
    setInviteForm({ name: "", email: "", managerId: "" });
    setTimeout(() => { setShowInviteModal(false); setInviteSuccess(""); }, 2000);
  }

  async function deleteManager(id: string) {
    setPendingDeleteManagerId(id);
  }

  async function doDeleteManager(id: string) {
    setPendingDeleteManagerId(null);
    await fetch("/api/admin/managers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setManagers((prev) => prev.filter((m) => m.id !== id));
    setUsers((prev) => prev.map((u) => u.managerId === id ? { ...u, managerId: null, managerName: null } : u));
  }

  async function assignManager(userId: string, managerId: string | null) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId }),
    });
    if (res.ok) {
      const manager = managers.find((m) => m.id === managerId);
      setUsers((prev) => prev.map((u) =>
        u.id === userId ? { ...u, managerId: managerId ?? null, managerName: manager?.name ?? null } : u
      ));
    }
  }

  async function openThread(user: UserRow) {
    setActiveThread(user);
    setThreadLoading(true);
    setThreadMessages([]);
    const res = await fetch(`/api/messages?userId=${user.id}`);
    if (res.ok) setThreadMessages(await res.json());
    setThreadLoading(false);
  }

  async function sendReply() {
    if (!replyBody.trim() || !activeThread) return;
    setReplying(true);
    const res = await fetch(`/api/messages?asManager=true&userId=${activeThread.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: replyBody }),
    });
    if (res.ok) {
      const msg = await res.json();
      setThreadMessages((prev) => [...prev, msg]);
      setReplyBody("");
      setUsers((prev) => prev.map((u) => u.id === activeThread.id ? { ...u, unreadMessages: 0 } : u));
    }
    setReplying(false);
  }

  function openGatewayModal(instanceId: string) {
    setGatewayModal({ instanceId, vpsUrl: "", gatewayToken: "", saving: false, result: null });
  }

  async function provisionVps(instanceId: string) {
    setPendingProvisionInstanceId(instanceId);
  }

  async function doProvisionVps(instanceId: string) {
    setPendingProvisionInstanceId(null);
    setProvisioningId(instanceId);
    setProvisionResult(null);
    const res = await fetch(`/api/admin/instances/${instanceId}/provision`, { method: "POST" });
    const data = await res.json();
    setProvisioningId(null);
    if (res.ok) {
      setProvisionResult({ instanceId, message: `✓ Provisioning started. Server ${data.serverId} at ${data.ip}. Check status in a few minutes.`, ok: true });
      setUsers((prev) => prev.map((u) => ({
        ...u,
        instances: u.instances.map((i) =>
          i.id === instanceId ? { ...i, provisionStatus: "provisioning" } : i
        ),
      })));
    } else {
      setProvisionResult({ instanceId, message: `✗ ${data.error}`, ok: false });
    }
  }

  async function provisionAllForUser(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const unprovisioned = user.instances.filter((i) => !i.hasGateway && !i.provisionStatus);
    if (unprovisioned.length === 0) {
      setProvisionResult({ instanceId: "", message: "All instances for this user are already provisioned or in progress.", ok: false });
      return;
    }
    setPendingProvisionUserId(userId);
  }

  async function doProvisionAllForUser(userId: string) {
    setPendingProvisionUserId(null);
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const unprovisioned = user.instances.filter((i) => !i.hasGateway && !i.provisionStatus);
    setProvisioningUserId(userId);
    const results: string[] = [];
    for (const inst of unprovisioned) {
      const res = await fetch(`/api/admin/instances/${inst.id}/provision`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        results.push(`✓ ${inst.name} — server ${data.serverId} at ${data.ip}`);
        setUsers((prev) => prev.map((u) => ({
          ...u,
          instances: u.instances.map((i) =>
            i.id === inst.id ? { ...i, provisionStatus: "provisioning" } : i
          ),
        })));
      } else {
        results.push(`✗ ${inst.name} — ${data.error}`);
      }
    }
    setProvisioningUserId(null);
    setProvisionResult({
      instanceId: userId,
      message: results.join(" | "),
      ok: results.every((r) => r.startsWith("✓")),
    });
  }

  async function syncConfig(instanceId: string) {
    setSyncingId(instanceId);
    setSyncResult(null);
    const res = await fetch(`/api/admin/instances/${instanceId}/sync-config`, { method: "POST" });
    const data = await res.json();
    setSyncingId(null);
    if (res.ok) {
      setSyncResult(data);
      setUsers((prev) => prev.map((u) => ({
        ...u,
        instances: u.instances.map((i) =>
          i.id === instanceId ? { ...i, configSynced: true } : i
        ),
      })));
    }
  }

  async function saveGateway() {
    if (!gatewayModal) return;
    setGatewayModal((m) => m ? { ...m, saving: true, result: null } : m);

    const res = await fetch(`/api/admin/instances/${gatewayModal.instanceId}/gateway`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vpsUrl: gatewayModal.vpsUrl, gatewayToken: gatewayModal.gatewayToken }),
    });
    const data = await res.json();

    if (data.connected) {
      // Update the instance in state
      setUsers((prev) => prev.map((u) => ({
        ...u,
        instances: u.instances.map((i) =>
          i.id === gatewayModal.instanceId
            ? { ...i, vpsUrl: gatewayModal.vpsUrl, hasGateway: true }
            : i
        ),
      })));
      setGatewayModal(null);
    } else {
      setGatewayModal((m) => m ? { ...m, saving: false, result: { ok: false, message: data.error ?? t("connectionFailed") } } : m);
    }
  }

  async function disconnectGateway(instanceId: string) {
    setPendingDisconnectInstanceId(instanceId);
  }

  async function doDisconnectGateway(instanceId: string) {
    setPendingDisconnectInstanceId(null);
    const res = await fetch(`/api/admin/instances/${instanceId}/gateway`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => ({
        ...u,
        instances: u.instances.map((i) =>
          i.id === instanceId ? { ...i, vpsUrl: null, hasGateway: false } : i
        ),
      })));
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t("adminPanel")}</h1>
            <p className="text-zinc-400 text-sm">Manage users, managers, and messages.</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold mr-2"
          >
            <Mail className="w-4 h-4" /> Invite Client
          </button>
          <button
            onClick={() => setShowCreateManager(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Manager
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, color: "text-violet-400", value: stats.totalUsers, label: "Total users" },
            { icon: Bot, color: "text-blue-400", value: stats.totalInstances, label: "Total instances" },
            { icon: Activity, color: "text-emerald-400", value: stats.runningInstances, label: "Running now" },
            { icon: AlertCircle, color: "text-amber-400", value: stats.unassigned, label: "No manager" },
          ].map((s) => (
            <div key={s.label} className="glow-border rounded-2xl p-5 bg-white/[0.02]">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { key: "overview" as const, label: t("tabOverview"), icon: undefined },
            { key: "referrals" as const, label: t("tabReferrals"), icon: Gift },
            { key: "analytics" as const, label: t("tabAnalytics"), icon: BarChart2 },
            { key: "leads" as const, label: `🔥 Leads${leads.length > 0 ? ` (${leads.length})` : ""}`, icon: undefined },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-violet-600/20 text-white border border-violet-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {"icon" in tab && tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </button>
          ))}
          <NextLink
            href="/admin/versions"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
          >
            <Tag className="w-4 h-4" />
            {t("versions")}
          </NextLink>
        </div>

        {/* ─── Referrals Tab ─────────────────────────────────────────────── */}
        {activeTab === "referrals" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="font-semibold text-white">Outstanding Commissions</div>
                  <div className="text-xs text-zinc-500">Total owed to referrers (converted but not yet paid)</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">${referralOutstanding.toFixed(2)}</div>
            </div>

            <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
              <div className="p-5 border-b border-white/5">
                <h2 className="font-semibold text-white">All Referral Conversions</h2>
              </div>

              {referralLoading && (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              )}

              {!referralLoading && referralConversions.length === 0 && (
                <div className="p-12 text-center text-zinc-500 text-sm">No referral conversions yet.</div>
              )}

              {!referralLoading && referralConversions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                        <th className="px-5 py-3 text-left font-medium">Referrer</th>
                        <th className="px-5 py-3 text-left font-medium">Referred</th>
                        <th className="px-5 py-3 text-left font-medium">Plan</th>
                        <th className="px-5 py-3 text-left font-medium">Commission</th>
                        <th className="px-5 py-3 text-left font-medium">Status</th>
                        <th className="px-5 py-3 text-left font-medium">Date</th>
                        <th className="px-5 py-3 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {referralConversions.map((c) => (
                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="text-white text-xs font-medium">{c.referrerName ?? "—"}</div>
                            <div className="text-zinc-500 text-xs">{c.referrerEmail}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-white text-xs font-medium">{c.referredName ?? "—"}</div>
                            <div className="text-zinc-500 text-xs">{c.referredEmail}</div>
                          </td>
                          <td className="px-5 py-3.5 capitalize text-zinc-300 text-xs">{c.plan}</td>
                          <td className="px-5 py-3.5 text-zinc-300 text-xs font-mono">
                            {c.commissionUsd != null ? `$${c.commissionUsd.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                              c.status === "pending" ? "bg-zinc-700/50 text-zinc-400" :
                              c.status === "converted" ? "bg-yellow-500/20 text-yellow-300" :
                              "bg-emerald-500/20 text-emerald-300"
                            )}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-500 text-xs">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            {c.status === "converted" && (
                              <button
                                onClick={() => markAsPaid(c.id)}
                                disabled={markingPaid === c.id}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {markingPaid === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "overview" && <>
        {/* Infrastructure Health */}
        <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden mb-6">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" />
            <h2 className="font-semibold">Infrastructure Health</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              {[
                { label: "Monitored", value: healthSummary.monitored, color: "text-zinc-300" },
                { label: "Healthy", value: healthSummary.healthy, color: "text-emerald-400" },
                { label: "Degraded", value: healthSummary.degraded, color: "text-yellow-400" },
                { label: "Down", value: healthSummary.down, color: "text-red-400" },
                { label: "Unknown", value: healthSummary.unknown, color: "text-zinc-500" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.03] rounded-xl p-4">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
            {healthSummary.issues.length > 0 && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Instances needing attention</div>
                <div className="space-y-2">
                  {healthSummary.issues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-2.5">
                      <HealthDot healthStatus={issue.healthStatus} />
                      <span className="text-sm text-white font-medium">{issue.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        issue.healthStatus === "degraded" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"
                      }`}>{issue.healthStatus}</span>
                      <span className="text-xs text-zinc-500 ml-auto">{issue.userEmail}</span>
                      {issue.lastCheckedAt && <span className="text-xs text-zinc-600">{formatRelativeTime(issue.lastCheckedAt)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {healthSummary.issues.length === 0 && healthSummary.monitored > 0 && (
              <p className="text-sm text-emerald-400">All monitored instances are healthy ✓</p>
            )}
            {healthSummary.monitored === 0 && (
              <p className="text-sm text-zinc-500">No instances have VPS monitoring configured yet.</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Managers */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <h2 className="font-semibold">Managers</h2>
              <span className="ml-auto text-xs text-zinc-500">{managers.length}</span>
            </div>
            <div className="divide-y divide-white/5">
              {managers.length === 0 && (
                <div className="p-5">
                  <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <span className="text-amber-400 text-lg shrink-0">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-amber-300">No managers configured</p>
                      <p className="text-xs text-amber-400/80 mt-0.5">
                        New signups won&apos;t get a manager or welcome message until you add one.
                        Click &quot;Add Manager&quot; to create your account — you&apos;ll be auto-assigned to all new users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {managers.map((m) => (
                <div key={m.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center text-xs font-bold text-violet-300">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{m.name}</div>
                    <div className="text-xs text-zinc-500 truncate">{m.email}</div>
                    <div className="text-xs text-zinc-600 mt-0.5">{m.userCount} client{m.userCount !== 1 ? "s" : ""}</div>
                  </div>
                  <button onClick={() => deleteManager(m.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Users */}
          <div className="md:col-span-2 glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold">Users</h2>
            </div>
            <div className="divide-y divide-white/5">
              {users.map((user) => (
                <div key={user.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center text-sm font-bold text-violet-300">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name ?? "—"}</div>
                        <div className="text-sm text-zinc-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.unreadMessages > 0 && (
                        <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {user.unreadMessages}
                        </span>
                      )}
                      <button
                        onClick={() => openThread(user)}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Messages
                      </button>
                      {user.instances.some((i) => !i.hasGateway && !i.provisionStatus) && (
                        <button
                          onClick={() => provisionAllForUser(user.id)}
                          disabled={provisioningUserId === user.id}
                          title={t("provisionAllTitle")}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {provisioningUserId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                          Provision
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plan + joined + onboarding context */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span className="text-zinc-400">{PLANS[user.plan as keyof typeof PLANS]?.label ?? user.plan} plan</span>
                    <span className="text-zinc-700">·</span>
                    <span>Joined {formatDate(user.createdAt)}</span>
                    {user.onboardingData && (() => {
                      const od = user.onboardingData;
                      return <>
                        {od?.industry && <><span className="text-zinc-700">·</span><span className="text-violet-400">{od.industry}</span></>}
                        {od?.useCase && <><span className="text-zinc-700">·</span><span className="text-zinc-400">{od.useCase.replace(/-/g, " ")}</span></>}
                        {od?.businessName && <><span className="text-zinc-700">·</span><span className="text-zinc-400 italic">{od.businessName}</span></>}
                      </>;
                    })()}
                  </div>

                  {/* Manager assign */}
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <select
                      value={user.managerId ?? ""}
                      onChange={(e) => assignManager(user.id, e.target.value || null)}
                      className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-violet-500 transition-colors"
                    >
                      <option value="">Unassigned</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Instances with VPS connect */}
                  {user.instances.length > 0 && (
                    <div className="ml-0 space-y-2">
                      {user.instances.map((inst) => (
                        <div key={inst.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Bot className="w-3 h-3 text-zinc-700" />
                            <span className="truncate text-zinc-300 font-medium">{inst.name}</span>
                            <span className="text-zinc-600 capitalize">{inst.type}</span>
                            <span className={`px-1.5 py-0.5 rounded-full ${STATUS_COLORS[inst.status]}`}>{inst.status}</span>
                            <HealthDot healthStatus={inst.healthStatus} />
                            {/* Activation status chips */}
                            {inst.sandboxMode && !inst.hasLLMKey && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[10px] font-medium">sandbox</span>
                            )}
                            {inst.hasLLMKey && !inst.hasChannel && (
                              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 text-[10px] font-medium">no channel</span>
                            )}
                            {inst.hasChannel && (
                              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">✓ live</span>
                            )}
                            <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
                              {inst.hasGateway ? (
                                <>
                                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Connected
                                  </span>
                                  <span className="text-zinc-700">·</span>
                                  <span className="text-zinc-500 font-mono truncate max-w-[120px]">{inst.vpsUrl}</span>
                                  <button
                                    onClick={() => disconnectGateway(inst.id)}
                                    className="ml-1 text-zinc-600 hover:text-red-400 transition-colors"
                                    title={t("disconnectVpsTitle")}
                                  >
                                    <Unlink className="w-3 h-3" />
                                  </button>
                                  {inst.configSynced === false && (
                                    <button
                                      onClick={() => syncConfig(inst.id)}
                                      disabled={syncingId === inst.id}
                                      className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-0.5 rounded-lg transition-colors"
                                      title={t("syncConfigToVpsTitle")}
                                    >
                                      {syncingId === inst.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                      Sync Config
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => openGatewayModal(inst.id)}
                                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2 py-0.5 rounded-lg transition-colors"
                                  >
                                    <Link className="w-3 h-3" /> Connect VPS
                                  </button>
                                  <button
                                    onClick={() => openWizard(inst.id, inst.name, inst.tier, inst.provisionStatus ?? null)}
                                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2 py-0.5 rounded-lg transition-colors"
                                    title={t("provisionHetznerTitle")}
                                  >
                                    <Rocket className="w-3 h-3" />
                                    {inst.provisionStatus ? `VPS (${inst.provisionStatus})` : t("provisionVps")}
                                  </button>
                                </>
                              )}
                              {/* Hetzner Snapshots toggle */}
                              <button
                                onClick={() => setSnapshotPanelId(snapshotPanelId === inst.id ? null : inst.id)}
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-colors ${
                                  snapshotPanelId === inst.id
                                    ? "text-blue-300 bg-blue-500/20 border-blue-500/30"
                                    : "text-zinc-500 hover:text-blue-300 bg-white/5 hover:bg-blue-500/10 border-white/10 hover:border-blue-500/20"
                                }`}
                                title={t("hetznerSnapshots")}
                              >
                                <Camera className="w-3 h-3" />
                              </button>
                              {/* Restic Rollback toggle */}
                              <button
                                onClick={() => setResticPanelId(resticPanelId === inst.id ? null : inst.id)}
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg border transition-colors ${
                                  resticPanelId === inst.id
                                    ? "text-amber-300 bg-amber-500/20 border-amber-500/30"
                                    : "text-zinc-500 hover:text-amber-300 bg-white/5 hover:bg-amber-500/10 border-white/10 hover:border-amber-500/20"
                                }`}
                                title="Restic Snapshots & Rollback"
                              >
                                <Database className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {snapshotPanelId === inst.id && (
                            <HetznerSnapshotPanel instanceId={inst.id} />
                          )}
                          {resticPanelId === inst.id && (
                            <ResticRollbackPanel instanceId={inst.id} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {users.length === 0 && <p className="p-12 text-center text-zinc-500 text-sm">No users yet.</p>}
            </div>
          </div>
        </div>
        </>}

        {/* ─── Analytics Tab ─────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div>
            {analyticsLoading && (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
              </div>
            )}
            {!analyticsLoading && !analyticsData && (
              <div className="text-center py-16 text-zinc-500 text-sm">Failed to load analytics.</div>
            )}
            {analyticsData && (
              <div className="space-y-8">

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      icon: Users,
                      color: "text-violet-400",
                      bg: "bg-violet-500/10",
                      value: analyticsData.totalUsers,
                      label: t("totalUsers"),
                      sub: `+${analyticsData.newThisWeek} this week`,
                      subColor: analyticsData.newThisWeek > 0 ? "text-emerald-400" : "text-zinc-600",
                    },
                    {
                      icon: TrendingUp,
                      color: "text-emerald-400",
                      bg: "bg-emerald-500/10",
                      value: `$${analyticsData.mrr.toLocaleString()}`,
                      label: t("estMrr"),
                      sub: `${analyticsData.planCounts.pro} pro · ${analyticsData.planCounts.enterprise} enterprise`,
                      subColor: "text-zinc-500",
                    },
                    {
                      icon: Activity,
                      color: "text-blue-400",
                      bg: "bg-blue-500/10",
                      value: analyticsData.activeInstances,
                      label: t("activeInstances"),
                      sub: "status = running",
                      subColor: "text-zinc-600",
                    },
                    {
                      icon: Server,
                      color: "text-amber-400",
                      bg: "bg-amber-500/10",
                      value: analyticsData.provisionedVps,
                      label: t("provisionedVps"),
                      sub: "with gateway",
                      subColor: "text-zinc-600",
                    },
                  ].map((card) => (
                    <div key={card.label} className="glow-border rounded-2xl p-5 bg-white/[0.02]">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", card.bg)}>
                        <card.icon className={cn("w-4 h-4", card.color)} />
                      </div>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <div className="text-xs text-zinc-500 mt-1">{card.label}</div>
                      <div className={cn("text-xs mt-1", card.subColor)}>{card.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* User Growth */}
                  <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-violet-400" />
                      <h2 className="font-semibold">User Growth — Last 30 Days</h2>
                    </div>
                    <div className="p-5">
                      {(() => {
                        const maxCount = Math.max(...analyticsData.userGrowth.map((d) => d.count), 1);
                        const barChars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
                        return (
                          <>
                            <div className="font-mono text-sm text-zinc-400 leading-relaxed mb-4 break-all">
                              {analyticsData.userGrowth.map((d) => {
                                const level = d.count === 0 ? 0 : Math.ceil((d.count / maxCount) * 7);
                                return (
                                  <span
                                    key={d.date}
                                    title={`${d.date}: ${d.count} signups`}
                                    className={d.count > 0 ? "text-violet-400" : "text-zinc-700"}
                                  >
                                    {barChars[level]}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="space-y-1.5 max-h-52 overflow-y-auto">
                              {[...analyticsData.userGrowth]
                                .reverse()
                                .filter((d) => d.count > 0)
                                .map((d) => (
                                  <div key={d.date} className="flex items-center gap-3 text-xs">
                                    <span className="text-zinc-500 font-mono w-24 shrink-0">{d.date}</span>
                                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                                      <div
                                        className="bg-violet-500 h-1.5 rounded-full"
                                        style={{ width: `${(d.count / maxCount) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-zinc-300 font-medium w-4 text-right">{d.count}</span>
                                  </div>
                                ))}
                              {analyticsData.userGrowth.every((d) => d.count === 0) && (
                                <p className="text-zinc-600 text-xs">No signups in the last 30 days.</p>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Instance Health Overview */}
                  <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <Server className="w-4 h-4 text-violet-400" />
                      <h2 className="font-semibold">Instance Health Overview</h2>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {[
                          { label: "Healthy", value: analyticsData.healthBreakdown.healthy, color: "text-emerald-400", dot: "bg-emerald-400" },
                          { label: "Degraded", value: analyticsData.healthBreakdown.degraded, color: "text-yellow-400", dot: "bg-yellow-400" },
                          { label: "Down", value: analyticsData.healthBreakdown.down, color: "text-red-400", dot: "bg-red-500" },
                          { label: "Not Deployed", value: analyticsData.healthBreakdown.notDeployed, color: "text-zinc-500", dot: "bg-zinc-600" },
                        ].map((item) => (
                          <div key={item.label} className="bg-white/[0.03] rounded-xl p-3 flex items-center gap-3">
                            <div className={cn("w-3 h-3 rounded-full shrink-0", item.dot)} />
                            <div>
                              <div className={cn("text-lg font-bold", item.color)}>{item.value}</div>
                              <div className="text-xs text-zinc-500">{item.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {analyticsData.downInstances.length > 0 && (
                        <div>
                          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Down instances</div>
                          <div className="space-y-1">
                            {analyticsData.downInstances.map((inst) => (
                              <div key={inst.id} className="flex items-center gap-2 text-xs bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                <span className="text-white font-medium">{inst.name}</span>
                                <span className="text-zinc-500 ml-auto truncate">{inst.userEmail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Plan Distribution */}
                  <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-violet-400" />
                      <h2 className="font-semibold">Plan Distribution</h2>
                    </div>
                    <div className="p-5 space-y-3">
                      {[
                        { label: "Free", value: analyticsData.planCounts.free, bar: "bg-zinc-500", text: "text-zinc-400" },
                        { label: "Pro", value: analyticsData.planCounts.pro, bar: "bg-violet-500", text: "text-violet-400" },
                        { label: "Enterprise", value: analyticsData.planCounts.enterprise, bar: "bg-amber-500", text: "text-amber-400" },
                      ].map((plan) => {
                        const total = analyticsData.totalUsers || 1;
                        return (
                          <div key={plan.label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className={plan.text}>{plan.label}</span>
                              <span className="text-zinc-400">
                                {plan.value} ({Math.round((plan.value / total) * 100)}%)
                              </span>
                            </div>
                            <div className="bg-white/5 rounded-full h-2">
                              <div
                                className={cn("h-2 rounded-full transition-all", plan.bar)}
                                style={{ width: `${(plan.value / total) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-3 border-t border-white/5 text-xs text-zinc-500">
                        Est. MRR:{" "}
                        <span className="text-emerald-400 font-bold text-sm">
                          ${analyticsData.mrr.toLocaleString()}
                        </span>
                        <span className="text-zinc-600 ml-2">(based on plan counts)</span>
                      </div>
                    </div>
                  </div>

                  {/* Manager Efficiency */}
                  <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-violet-400" />
                      <h2 className="font-semibold">Manager Efficiency</h2>
                    </div>
                    <div className="p-5">
                      {analyticsData.unassignedUsers > 0 && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-4 text-xs text-amber-300">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            <strong>{analyticsData.unassignedUsers}</strong>{" "}
                            user{analyticsData.unassignedUsers !== 1 ? "s" : ""} without a manager
                          </span>
                        </div>
                      )}
                      {analyticsData.managerEfficiency.length === 0 ? (
                        <p className="text-zinc-600 text-xs">No managers yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...analyticsData.managerEfficiency]
                            .sort((a, b) => b.userCount - a.userCount)
                            .map((m) => {
                              const maxUsers = Math.max(
                                ...analyticsData.managerEfficiency.map((x) => x.userCount),
                                1
                              );
                              return (
                                <div key={m.id} className="flex items-center gap-3 text-xs">
                                  <div className="w-6 h-6 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 font-bold shrink-0">
                                    {m.name[0].toUpperCase()}
                                  </div>
                                  <span className="text-zinc-300 truncate w-28 shrink-0">{m.name}</span>
                                  <div className="flex-1 bg-white/5 rounded-full h-1.5">
                                    <div
                                      className="bg-violet-500 h-1.5 rounded-full"
                                      style={{ width: `${(m.userCount / maxUsers) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-zinc-400 w-6 text-right shrink-0">{m.userCount}</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Activation Funnel */}
                {analyticsData.funnel && (
                  <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-violet-400" />
                      <div>
                        <h2 className="font-semibold">Activation Funnel</h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Where users drop off</p>
                      </div>
                    </div>
                    <div className="p-5">
                      {(() => {
                        const f = analyticsData.funnel!;
                        const steps: { label: string; count: number }[] = [
                          { label: "Signed up", count: f.signedUp },
                          { label: "Email verified", count: f.emailVerified },
                          { label: "Onboarding done", count: f.onboardingDone },
                          { label: "Tried sandbox", count: f.triedSandbox },
                          { label: "Sandbox exhausted", count: f.sandboxExhausted },
                          { label: "Added API key", count: f.addedApiKey },
                          { label: "Connected Telegram", count: f.connectedTelegram },
                        ];
                        const baseline = f.signedUp || 1;
                        return (
                          <div>
                            {steps.map((step, idx) => {
                              const pct = (step.count / baseline) * 100;
                              const prevCount = idx === 0 ? baseline : steps[idx - 1].count;
                              const dropOff = idx === 0 ? null : prevCount === 0 ? 0 : (step.count / prevCount) * 100;
                              return (
                                <div key={step.label} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                                  <div className="w-40 shrink-0 text-xs text-zinc-400">{step.label}</div>
                                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div className="bg-violet-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <div className="w-12 text-right text-xs font-mono text-white">{step.count}</div>
                                  <div className="w-14 text-right text-xs text-zinc-400">{pct.toFixed(0)}%</div>
                                  {dropOff !== null && dropOff < 80 && (
                                    <div className="w-12 text-xs text-amber-400">↓{dropOff.toFixed(0)}%</div>
                                  )}
                                  {(dropOff === null || dropOff >= 80) && (
                                    <div className="w-12" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>

      {/* Provision result toast */}
      {provisionResult && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border max-w-sm flex items-start gap-3 ${
          provisionResult.ok ? "bg-emerald-600/90 border-emerald-500 text-white" : "bg-red-600/90 border-red-500 text-white"
        }`}>
          <span className="flex-1">{provisionResult.message}</span>
          <button onClick={() => setProvisionResult(null)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sync config modal */}
      {syncResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-violet-400" /> Config Sync
              </h2>
              <button onClick={() => setSyncResult(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {syncResult.syncCommand && (
              <div className="mb-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Sync command (run on your machine)</div>
                <div className="flex items-start gap-2">
                  <pre className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-zinc-300 overflow-x-auto font-mono break-all whitespace-pre-wrap">
                    {syncResult.syncCommand}
                  </pre>
                  <button
                    onClick={() => { navigator.clipboard.writeText(syncResult.syncCommand!); setCopiedSync(true); setTimeout(() => setCopiedSync(false), 2000); }}
                    className="shrink-0 text-violet-400 hover:text-violet-300 bg-violet-500/10 p-2 rounded-lg transition-colors"
                  >
                    {copiedSync ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Generated Config</div>
              <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 overflow-x-auto max-h-64 font-mono">
                {syncResult.config}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Provision VPS ── */}
      {pendingProvisionInstanceId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Provision VPS?</h3>
            <p className="text-zinc-400 text-sm mb-5">This will create a Hetzner VPS (~€5/mo). The server will start billing immediately.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPendingProvisionInstanceId(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => doProvisionVps(pendingProvisionInstanceId)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Provision All for User ── */}
      {pendingProvisionUserId && (() => {
        const u = users.find((x) => x.id === pendingProvisionUserId);
        const count = u?.instances.filter((i) => !i.hasGateway && !i.provisionStatus).length ?? 0;
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-white font-semibold mb-2">Provision {count} instance{count !== 1 ? "s" : ""}?</h3>
              <p className="text-zinc-400 text-sm mb-5">For {u?.name ?? u?.email}. Each server costs ~€5/mo and will start billing immediately.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setPendingProvisionUserId(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => doProvisionAllForUser(pendingProvisionUserId)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors">Confirm</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Confirm: Disconnect VPS ── */}
      {pendingDisconnectInstanceId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-semibold mb-2">Disconnect VPS?</h3>
            <p className="text-zinc-400 text-sm mb-5">This will remove the gateway connection. The VPS will keep running but the agent will go offline.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPendingDisconnectInstanceId(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => doDisconnectGateway(pendingDisconnectInstanceId)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">Disconnect</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Delete Manager ── */}
      {pendingDeleteManagerId && (() => {
        const m = managers.find((x) => x.id === pendingDeleteManagerId);
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-white font-semibold mb-2">Delete manager?</h3>
              <p className="text-zinc-400 text-sm mb-5">{m?.name} will be removed. Their assigned users will lose their manager connection.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setPendingDeleteManagerId(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => doDeleteManager(pendingDeleteManagerId)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors">Delete</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create Manager Modal */}
      {showCreateManager && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Add Manager</h2>
              <button onClick={() => { setShowCreateManager(false); setManagerError(""); }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                <input type="text" value={managerForm.name} onChange={(e) => setManagerForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Jane Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                <input type="email" value={managerForm.email} onChange={(e) => setManagerForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="jane@openhelixai.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  Cal.com Link <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={managerForm.calLink}
                  onChange={(e) => setManagerForm((p) => ({ ...p, calLink: e.target.value }))}
                  placeholder="john-smith/30min"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-xs text-zinc-600 mt-1.5">Cal.com path only — e.g. <code className="text-zinc-500">your-name/30min</code></p>
              </div>
              {managerError && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{managerError}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowCreateManager(false); setManagerError(""); }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-semibold">
                  Cancel
                </button>
                <button onClick={createManager} disabled={creatingManager || !managerForm.name || !managerForm.email}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-3 rounded-xl text-sm font-semibold">
                  {creatingManager ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Client Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Invite Client</h2>
              <button onClick={() => { setShowInviteModal(false); setInviteError(""); }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Manager</label>
                <select
                  value={inviteForm.managerId}
                  onChange={(e) => setInviteForm((p) => ({ ...p, managerId: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">Select a manager (optional)</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              {inviteError && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{inviteError}</p>}
              {inviteSuccess && <p className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3">{inviteSuccess}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowInviteModal(false); setInviteError(""); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={inviteClient}
                  disabled={inviting || !inviteForm.name || !inviteForm.email}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect VPS Modal */}
      {gatewayModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <h2 className="text-lg font-semibold">Connect VPS</h2>
              </div>
              <button onClick={() => setGatewayModal(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">VPS Gateway URL</label>
                <input
                  type="text"
                  value={gatewayModal.vpsUrl}
                  onChange={(e) => setGatewayModal((m) => m ? { ...m, vpsUrl: e.target.value } : m)}
                  placeholder="https://1.2.3.4:18789"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Gateway Token</label>
                <input
                  type="password"
                  value={gatewayModal.gatewayToken}
                  onChange={(e) => setGatewayModal((m) => m ? { ...m, gatewayToken: e.target.value } : m)}
                  placeholder="sk-gw-..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
              </div>
              {gatewayModal.result && !gatewayModal.result.ok && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  ✗ Connection failed: {gatewayModal.result.message}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setGatewayModal(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGateway}
                  disabled={gatewayModal.saving || !gatewayModal.vpsUrl || !gatewayModal.gatewayToken}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
                >
                  {gatewayModal.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                  {gatewayModal.saving ? "Testing..." : "Test & Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Thread Modal */}
      {activeThread && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col" style={{ height: "70vh" }}>
            <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
              <div>
                <h2 className="font-semibold text-white">{activeThread.name ?? activeThread.email}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{activeThread.email} · {activeThread.managerName ? `Manager: ${activeThread.managerName}` : "No manager assigned"}</p>
              </div>
              <button onClick={() => { setActiveThread(null); setReplyBody(""); }} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {threadLoading && <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>}
              {!threadLoading && threadMessages.length === 0 && (
                <p className="text-center text-zinc-500 text-sm pt-8">No messages yet.</p>
              )}
              {threadMessages.map((msg) => {
                const isManager = msg.senderType === "manager";
                return (
                  <div key={msg.id} className={cn("flex gap-2", isManager ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                      isManager ? "bg-violet-600 text-white rounded-tr-sm" : "bg-white/[0.05] border border-white/10 text-zinc-200 rounded-tl-sm"
                    )}>
                      <div className="text-xs font-medium mb-1 opacity-70">{isManager ? "Manager" : activeThread.name ?? "User"}</div>
                      {msg.body}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/5 shrink-0">
              {!activeThread.managerId ? (
                <p className="text-xs text-amber-400 text-center">Assign a manager to this user before replying.</p>
              ) : (
                <div className="flex gap-3">
                  <input type="text" value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder="Reply as manager..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                  <button onClick={sendReply} disabled={replying || !replyBody.trim()}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold">
                    {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Leads Tab ─────────────────────────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="space-y-6">
          {/* Upgrade Requests Section */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">⬆️ Upgrade Requests</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Users who clicked upgrade and need manual activation</p>
              </div>
              <span className="text-xs text-zinc-500">{upgradeRequests.length} total</span>
            </div>
            {upgradesLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
            ) : upgradeRequests.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No upgrade requests yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-500 border-b border-white/5">
                      <th className="text-left px-5 py-3">User</th>
                      <th className="text-left px-5 py-3">Current Plan</th>
                      <th className="text-left px-5 py-3">Requested</th>
                      <th className="text-left px-5 py-3">Date</th>
                      <th className="text-left px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {upgradeRequests.map((req) => {
                      // Parse the details string to extract requested plan
                      const match = req.details?.match(/→\s*(\S+)/);
                      const requestedPlan = match ? match[1] : "unknown";
                      return (
                        <tr key={req.id} className="hover:bg-white/[0.02]">
                          <td className="px-5 py-3">
                            <div className="text-zinc-200 text-xs font-medium">{req.userName ?? "—"}</div>
                            <div className="text-zinc-500 text-xs font-mono">{req.userEmail ?? "—"}</div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-300 border border-zinc-600/30 capitalize">
                              {req.currentPlan ?? "free"}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 capitalize">
                              {requestedPlan}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-zinc-500 text-xs">
                            {new Date(req.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {req.userId && requestedPlan !== "unknown" && (
                                <button
                                  onClick={() => activateUpgrade(req.userId!, req.id, requestedPlan)}
                                  disabled={activatingUpgrade === req.id}
                                  className="text-xs font-semibold text-white bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-40 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                  {activatingUpgrade === req.id ? "…" : `Activate ${requestedPlan}`}
                                </button>
                              )}
                              {req.userEmail && (
                                <a
                                  href={`mailto:${req.userEmail}?subject=Your%20OpenHelix%20AI%20upgrade&body=Hi!%20I%20saw%20you%20requested%20an%20upgrade%20to%20${encodeURIComponent(requestedPlan)}.%20Let's%20get%20you%20set%20up.`}
                                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                  Email →
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Waitlist Leads Section */}
          <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">🔥 Waitlist Leads</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Users who hit sandbox limit and submitted their email</p>
              </div>
              <span className="text-xs text-zinc-500">{leads.length} total</span>
            </div>
            {leadsLoading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No leads yet. They&apos;ll appear when sandbox users submit their email.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-zinc-500 border-b border-white/5">
                      <th className="text-left px-5 py-3">Email</th>
                      <th className="text-left px-5 py-3">Source</th>
                      <th className="text-left px-5 py-3">Date</th>
                      <th className="text-left px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3 text-zinc-200 font-mono text-xs">{lead.email}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-zinc-500 text-xs">
                          {new Date(lead.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3">
                          <a
                            href={`mailto:${lead.email}?subject=Your%20OpenHelix AI%20trial&body=Hi!%20I%20saw%20you%20tried%20out%20OpenHelix AI%20and%20I%20wanted%20to%20reach%20out%20personally.`}
                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            Email →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => {
                      const csv = ["email,source,date", ...leads.map((l) => `${l.email},${l.source},${new Date(l.createdAt).toISOString().split("T")[0]}`)].join("\n");
                      const a = document.createElement("a");
                      a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
                      a.download = `synapseforge-leads-${new Date().toISOString().split("T")[0]}.csv`;
                      a.click();
                    }}
                    className="text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provisioning Wizard */}
      {wizardState && (
        <ProvisioningWizard
          instanceId={wizardState.instanceId}
          instanceName={wizardState.instanceName}
          tier={wizardState.tier}
          provisionStatus={wizardState.provisionStatus}
          provisionEndpoint={`/api/admin/instances/${wizardState.instanceId}/provision`}
          onClose={() => closeWizard()}
          onDone={(status) => closeWizard(wizardState.instanceId, status)}
        />
      )}
    </div>
  );
}
