"use client";

import { useState } from "react";
import { Users, Bot, Activity, AlertCircle, Plus, X, Shield, ChevronDown, MessageCircle, Send, Loader2 } from "lucide-react";
import { STATUS_COLORS, PLANS, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  managerId: string | null;
  managerName: string | null;
  instances: { id: string; name: string; type: string; status: string }[];
  unreadMessages: number;
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

export function AdminClient({ users: initialUsers, managers: initialManagers, stats }: {
  users: UserRow[];
  managers: ManagerRow[];
  stats: Stats;
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
      // Clear unread badge for this user
      setUsers((prev) => prev.map((u) => u.id === activeThread.id ? { ...u, unreadMessages: 0 } : u));
    }
    setReplying(false);
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

                  {/* Instances */}
                  {user.instances.length > 0 && (
                    <div className="ml-0 space-y-1">
                      {user.instances.map((inst) => (
                        <div key={inst.id} className="flex items-center gap-2 text-xs text-zinc-500">
                          <Bot className="w-3 h-3 text-zinc-700" />
                          <span className="truncate">{inst.name}</span>
                          <span className="text-zinc-700 capitalize">{inst.type}</span>
                          <span className={`px-1.5 py-0.5 rounded-full ${STATUS_COLORS[inst.status]}`}>{inst.status}</span>
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
