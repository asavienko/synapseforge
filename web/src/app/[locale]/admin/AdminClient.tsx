"use client";

import { useState } from "react";
import { Users, Bot, Activity, AlertCircle, Plus, X, Shield, ChevronDown, MessageCircle, Send, Loader2, Server, Link, Unlink, CheckCircle2 } from "lucide-react";
import { STATUS_COLORS, PLANS, formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  managerId: string | null;
  managerName: string | null;
  instances: {
    id: string;
    name: string;
    type: string;
    status: string;
    healthStatus?: string | null;
    vpsUrl: string | null;
    hasGateway: boolean;
  }[];
  unreadMessages: number;
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

export function AdminClient({ users: initialUsers, managers: initialManagers, stats, healthSummary }: {
  users: UserRow[];
  managers: ManagerRow[];
  stats: Stats;
  healthSummary: HealthSummary;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [managers, setManagers] = useState(initialManagers);

  // Manager creation
  const [showCreateManager, setShowCreateManager] = useState(false);
  const [managerForm, setManagerForm] = useState({ name: "", email: "" });
  const [creatingManager, setCreatingManager] = useState(false);
  const [managerError, setManagerError] = useState("");

  // Message thread modal
  const [activeThread, setActiveThread] = useState<UserRow | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);

  // Gateway modal
  const [gatewayModal, setGatewayModal] = useState<GatewayModal | null>(null);

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
    setManagerForm({ name: "", email: "" });
    setShowCreateManager(false);
  }

  async function deleteManager(id: string) {
    if (!confirm("Delete this manager? Their users will become unassigned.")) return;
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
      setGatewayModal((m) => m ? { ...m, saving: false, result: { ok: false, message: data.error ?? "Connection failed" } } : m);
    }
  }

  async function disconnectGateway(instanceId: string) {
    if (!confirm("Disconnect this VPS? The gateway config will be cleared.")) return;
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
            <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
            <p className="text-zinc-400 text-sm">Manage users, managers, and messages.</p>
          </div>
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
                <p className="p-5 text-sm text-zinc-500">No managers yet. Add one →</p>
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
                    </div>
                  </div>

                  {/* Plan + joined */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mb-3">
                    <span className="text-zinc-400">{PLANS[user.plan as keyof typeof PLANS]?.label ?? user.plan} plan</span>
                    <span className="text-zinc-700">·</span>
                    <span>Joined {formatDate(user.createdAt)}</span>
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
                            <div className="ml-auto flex items-center gap-1.5">
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
                                    title="Disconnect VPS"
                                  >
                                    <Unlink className="w-3 h-3" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => openGatewayModal(inst.id)}
                                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2 py-0.5 rounded-lg transition-colors"
                                >
                                  <Link className="w-3 h-3" /> Connect VPS
                                </button>
                              )}
                            </div>
                          </div>
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
      </div>

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
                  placeholder="jane@synapseforge.ai"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors" />
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
    </div>
  );
}
