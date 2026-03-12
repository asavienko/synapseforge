"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, Bot, Send, Loader2, X, Shield, Activity, AlertTriangle, Bell, CheckCircle, Clock, Zap, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PLANS, formatDate, formatRelativeTime } from "@/lib/utils";
import { AGENT_TEMPLATES, AgentTemplate } from "@/lib/agent-templates";

interface Client {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: string;
  onboardingData: string | null;
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

interface ManagerInstance {
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

interface ManagerClientData {
  id: string;
  name: string | null;
  email: string;
  instances: ManagerInstance[];
}

function HealthBadge({ healthStatus }: { healthStatus?: string | null }) {
  if (healthStatus === "healthy") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
        Up
      </span>
    );
  }
  if (healthStatus === "degraded") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
        Degraded
      </span>
    );
  }
  if (healthStatus === "down") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
        Down
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-500/10 border border-zinc-500/20 px-2 py-0.5 rounded-full font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 inline-block" />
      Unknown
    </span>
  );
}

export function ManagerClient({ manager, clients: initialClients }: {
  manager: { id: string; name: string; email: string };
  clients: Client[];
}) {
  const [clients, setClients] = useState(initialClients);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"messages" | "instances" | "alerts">("messages");

  // Instances tab state
  const [instancesData, setInstancesData] = useState<ManagerClientData[] | null>(null);
  const [instancesLoading, setInstancesLoading] = useState(false);

  const totalUnread = clients.reduce((s, c) => s + c.unreadMessages, 0);
  const running = clients.flatMap((c) => c.instances).filter((i) => i.status === "running").length;

  // Load instances when tab is opened
  useEffect(() => {
    if ((activeTab === "instances" || activeTab === "alerts") && !instancesData) {
      setInstancesLoading(true);
      fetch("/api/manager/instances")
        .then((r) => r.json())
        .then((d) => setInstancesData(d))
        .finally(() => setInstancesLoading(false));
    }
  }, [activeTab, instancesData]);

  // Create instance for client state
  const [showCreateInstance, setShowCreateInstance] = useState(false);
  const [createStep, setCreateStep] = useState<"template" | "details">("template");
  const [createTemplate, setCreateTemplate] = useState<AgentTemplate | null>(null);
  const [createForm, setCreateForm] = useState({ userId: "", name: "", type: "assistant", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createToast, setCreateToast] = useState<string | null>(null);

  function openCreateInstance() {
    setShowCreateInstance(true);
    setCreateStep("template");
    setCreateTemplate(null);
    setCreateForm({ userId: clients[0]?.id ?? "", name: "", type: "assistant", description: "" });
    setCreateError("");
  }

  function selectCreateTemplate(tpl: AgentTemplate) {
    setCreateTemplate(tpl);
    setCreateForm((p) => ({ ...p, name: tpl.defaultAgentName, type: tpl.instanceType }));
    setCreateStep("details");
  }

  async function handleCreateInstance(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.userId || !createForm.name) return;
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/manager/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: createForm.userId,
        name: createForm.name,
        type: createForm.type,
        description: createForm.description,
        systemPrompt: createTemplate?.systemPrompt,
        agentTemplateName: createTemplate?.name,
        agentTemplateId: createTemplate?.id,
      }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.error ?? "Failed to create instance.");
    } else {
      setShowCreateInstance(false);
      setCreateTemplate(null);
      setCreateStep("template");
      // Refresh instances list
      setInstancesData(null);
      setCreateToast(`Instance "${createForm.name}" created! A welcome message was sent to the client.`);
      setTimeout(() => setCreateToast(null), 4000);
    }
  }

  // Compute alerts from instances data
  const alerts = instancesData
    ? instancesData.flatMap((client) =>
        client.instances
          .filter((i) => i.healthStatus === "down" || i.healthStatus === "degraded")
          .map((i) => ({ ...i, clientName: client.name, clientEmail: client.email }))
      )
    : [];

  const alertCount = alerts.length;

  async function openThread(client: Client) {
    setActiveClient(client);
    setThreadLoading(true);
    setMessages([]);
    const res = await fetch(`/api/messages?userId=${client.id}`);
    if (res.ok) setMessages(await res.json());
    setThreadLoading(false);
    // Clear unread
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, unreadMessages: 0 } : c));
  }

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
      <div className="border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="font-semibold text-white">{manager.name}</div>
            <div className="text-xs text-zinc-500">Manager Portal</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span><strong className="text-white">{clients.length}</strong> clients</span>
          <span><strong className="text-emerald-400">{running}</strong> running</span>
          {totalUnread > 0 && (
            <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{totalUnread} unread</span>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-white/5 px-8 flex gap-1 pt-2">
        {[
          {
            key: "messages" as const,
            label: "Messages",
            icon: MessageCircle,
            badge: totalUnread,
          },
          {
            key: "instances" as const,
            label: "Instances",
            icon: Bot,
            badge: 0,
          },
          {
            key: "alerts" as const,
            label: "Alerts",
            icon: Bell,
            badge: alertCount,
            badgeColor: "bg-red-500",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors relative",
              activeTab === tab.key
                ? "border-violet-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge > 0 && (
              <span className={cn(
                "text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none",
                tab.badgeColor ?? "bg-violet-600"
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Messages Tab ─────────────────────────────────────────── */}
      {activeTab === "messages" && (
        <div className="flex h-[calc(100vh-128px)]">
          {/* Client list */}
          <div className="w-80 border-r border-white/5 overflow-y-auto shrink-0">
            {clients.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No clients assigned yet.</p>
                <p className="text-zinc-600 text-xs mt-1">Admin assigns clients to you.</p>
              </div>
            ) : (
              clients.map((client) => {
                const od = client.onboardingData ? (() => { try { return JSON.parse(client.onboardingData!); } catch { return null; } })() : null;
                return (
                  <button key={client.id} onClick={() => openThread(client)}
                    className={cn(
                      "w-full text-left p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors",
                      activeClient?.id === client.id && "bg-white/[0.05] border-l-2 border-l-violet-500"
                    )}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                        {client.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white truncate">{client.name ?? client.email}</span>
                          {client.unreadMessages > 0 && (
                            <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-2">{client.unreadMessages}</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">{client.email}</div>
                        {od && <div className="text-xs text-zinc-600 mt-0.5 truncate">{od.business} · {od.useCase}</div>}
                        {client.lastMessage && (
                          <div className="text-xs text-zinc-600 mt-1 truncate">
                            {client.lastMessage.senderType === "user" ? "→ " : "← "}{client.lastMessage.body}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Thread / detail */}
          {activeClient ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Client header */}
              <div className="p-5 border-b border-white/5 shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-white">{activeClient.name ?? activeClient.email}</h2>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span>{activeClient.email}</span>
                      <span className="text-zinc-700">·</span>
                      <span className="capitalize">{PLANS[activeClient.plan as keyof typeof PLANS]?.label ?? activeClient.plan} plan</span>
                      <span className="text-zinc-700">·</span>
                      <span>Joined {formatDate(activeClient.createdAt)}</span>
                    </div>
                    {/* Onboarding data */}
                    {activeClient.onboardingData && (() => {
                      try {
                        const d = JSON.parse(activeClient.onboardingData!);
                        return (
                          <div className="flex gap-4 mt-2 text-xs">
                            {d.business && <span className="text-zinc-400"><span className="text-zinc-600">biz:</span> {d.business}</span>}
                            {d.industry && <span className="text-zinc-400"><span className="text-zinc-600">industry:</span> {d.industry}</span>}
                            {d.useCase && <span className="text-zinc-400"><span className="text-zinc-600">use case:</span> {d.useCase}</span>}
                          </div>
                        );
                      } catch { return null; }
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
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {threadLoading && <div className="flex justify-center pt-8"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>}
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
                        isManager ? "bg-violet-600 text-white rounded-tr-sm" : "bg-white/[0.05] border border-white/10 text-zinc-200 rounded-tl-sm"
                      )}>
                        <div className="text-xs font-medium mb-1 opacity-60">{isManager ? "You" : activeClient.name ?? "Client"}</div>
                        {msg.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply */}
              <div className="p-4 border-t border-white/5 shrink-0">
                <div className="flex gap-3">
                  <input type="text" value={replyBody} onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    placeholder={`Reply to ${activeClient.name ?? activeClient.email}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                  <button onClick={sendReply} disabled={replying || !replyBody.trim()}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold">
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

      {/* ─── Instances Tab ─────────────────────────────────────────── */}
      {activeTab === "instances" && (
        <div className="p-8 max-w-7xl mx-auto">
          {/* Toast */}
          {createToast && (
            <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border bg-emerald-600/90 border-emerald-500 text-white flex items-center gap-2">
              <Check className="w-4 h-4" /> {createToast}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Client Instances</h2>
            {clients.length > 0 && (
              <button
                onClick={openCreateInstance}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              >
                <Plus className="w-4 h-4" />
                Create Instance for Client
              </button>
            )}
          </div>

          {instancesLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          )}

          {!instancesLoading && instancesData && (
            <>
              {/* Summary bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {(() => {
                  const allInstances = instancesData.flatMap((c) => c.instances);
                  const upCount = allInstances.filter((i) => i.healthStatus === "healthy").length;
                  const degradedCount = allInstances.filter((i) => i.healthStatus === "degraded").length;
                  const downCount = allInstances.filter((i) => i.healthStatus === "down").length;
                  return [
                    { label: "Total Instances", value: allInstances.length, color: "text-zinc-300", icon: Bot },
                    { label: "Up", value: upCount, color: "text-emerald-400", icon: CheckCircle },
                    { label: "Degraded", value: degradedCount, color: "text-yellow-400", icon: Activity },
                    { label: "Down", value: downCount, color: "text-red-400", icon: AlertTriangle },
                  ].map((s) => (
                    <div key={s.label} className="glow-border rounded-2xl p-5 bg-white/[0.02]">
                      <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
                    </div>
                  ));
                })()}
              </div>

              {/* Instances table */}
              <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <h2 className="font-semibold">All Client Instances</h2>
                  <span className="ml-auto text-xs text-zinc-500">
                    {instancesData.flatMap((c) => c.instances).length} total
                  </span>
                </div>

                {instancesData.every((c) => c.instances.length === 0) ? (
                  <div className="p-12 text-center">
                    <Bot className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm">No instances yet across your clients.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                          <th className="px-5 py-3 text-left font-medium">Instance</th>
                          <th className="px-5 py-3 text-left font-medium">Client</th>
                          <th className="px-5 py-3 text-left font-medium">Status</th>
                          <th className="px-5 py-3 text-left font-medium">Health</th>
                          <th className="px-5 py-3 text-left font-medium">Tier</th>
                          <th className="px-5 py-3 text-left font-medium">Last Seen</th>
                          <th className="px-5 py-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {instancesData.flatMap((client) =>
                          client.instances.map((inst) => (
                            <tr key={inst.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                                  </div>
                                  <div>
                                    <div className="text-white font-medium text-xs">{inst.name}</div>
                                    {inst.vpsUrl && (
                                      <div className="text-zinc-600 text-xs font-mono truncate max-w-[120px]">{inst.vpsUrl}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="text-white text-xs font-medium">{client.name ?? "—"}</div>
                                <div className="text-zinc-500 text-xs">{client.email}</div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inst.status] ?? "text-zinc-400 bg-zinc-400/10"}`}>
                                  {inst.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <HealthBadge healthStatus={inst.healthStatus} />
                              </td>
                              <td className="px-5 py-3.5 text-zinc-400 text-xs capitalize">{inst.tier}</td>
                              <td className="px-5 py-3.5 text-zinc-500 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-zinc-600 shrink-0" />
                                  {inst.lastCheckedAt ? formatRelativeTime(inst.lastCheckedAt) : "Never"}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const c = clients.find((cl) => cl.id === client.id);
                                      if (c) { setActiveTab("messages"); openThread(c); }
                                    }}
                                    className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    <MessageCircle className="w-3 h-3" /> Message
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {!instancesLoading && !instancesData && (
            <div className="text-center py-16 text-zinc-500 text-sm">Failed to load instances.</div>
          )}
        </div>
      )}

      {/* ─── Alerts Tab ─────────────────────────────────────────────── */}
      {activeTab === "alerts" && (
        <div className="p-8 max-w-5xl mx-auto">
          {instancesLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          )}

          {!instancesLoading && instancesData && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Active Alerts</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">Instances that are down or degraded across your clients.</p>
                </div>
                {alerts.length > 0 && (
                  <span className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold px-3 py-1 rounded-full">
                    {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="glow-border rounded-2xl bg-white/[0.02] p-12 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                  <p className="text-white font-semibold text-lg mb-1">All systems operational</p>
                  <p className="text-zinc-500 text-sm">No down or degraded instances detected across your clients.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "glow-border rounded-2xl bg-white/[0.02] p-5 border",
                        alert.healthStatus === "down"
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-yellow-500/30 bg-yellow-500/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                            alert.healthStatus === "down" ? "bg-red-500/20" : "bg-yellow-500/20"
                          )}>
                            <AlertTriangle className={cn(
                              "w-5 h-5",
                              alert.healthStatus === "down" ? "text-red-400" : "text-yellow-400"
                            )} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">{alert.name}</span>
                              <HealthBadge healthStatus={alert.healthStatus} />
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">
                              Client: <span className="text-zinc-400">{alert.clientName ?? alert.clientEmail}</span>
                              <span className="text-zinc-700 mx-1">·</span>
                              <span className="text-zinc-500">{alert.clientEmail}</span>
                            </div>
                            {alert.vpsUrl && (
                              <div className="text-xs text-zinc-600 font-mono mt-0.5">{alert.vpsUrl}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-zinc-500">Last checked</div>
                            <div className="text-xs text-zinc-400 flex items-center gap-1 justify-end mt-0.5">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              {alert.lastCheckedAt ? formatRelativeTime(alert.lastCheckedAt) : "Never"}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const c = clients.find((cl) => cl.email === alert.clientEmail);
                              if (c) { setActiveTab("messages"); openThread(c); }
                            }}
                            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Contact Client
                          </button>
                        </div>
                      </div>

                      {/* Alert context row */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-zinc-600" />
                          Tier: <span className="text-zinc-400 capitalize ml-0.5">{alert.tier}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-zinc-600" />
                          Status: <span className={cn(
                            "ml-0.5 capitalize",
                            STATUS_COLORS[alert.status]?.split(" ")[0] ?? "text-zinc-400"
                          )}>{alert.status}</span>
                        </span>
                        {alert.provisionStatus && (
                          <span className="italic text-zinc-600">Provision: {alert.provisionStatus}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!instancesLoading && !instancesData && (
            <div className="text-center py-16 text-zinc-500 text-sm">Failed to load alert data.</div>
          )}
        </div>
      )}

      {/* ─── Create Instance Modal ────────────────────────────────── */}
      {showCreateInstance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">Create Instance for Client</h2>
                {createStep === "template" && (
                  <p className="text-xs text-zinc-500 mt-0.5">Choose a template — the agent will be pre-configured and a welcome message sent.</p>
                )}
                {createStep === "details" && createTemplate && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-500">Template:</span>
                    <span className="text-xs font-semibold text-violet-300">{createTemplate.icon} {createTemplate.name}</span>
                    <button onClick={() => setCreateStep("template")} className="text-xs text-zinc-600 hover:text-zinc-400 ml-1 underline">
                      change
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setShowCreateInstance(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Template gallery */}
            {createStep === "template" && (
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AGENT_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => selectCreateTemplate(tpl)}
                      className="group text-left p-4 rounded-xl border border-white/10 hover:border-violet-500/60 hover:bg-violet-500/5 transition-all"
                    >
                      <div className="text-2xl mb-2">{tpl.icon}</div>
                      <div className="text-sm font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                        {tpl.name}
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {tpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Details form */}
            {createStep === "details" && (
              <form onSubmit={handleCreateInstance} className="p-6 space-y-4">
                {/* Template prompt preview */}
                {createTemplate && createTemplate.id !== "custom" && (
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-medium text-violet-300">Pre-filled system prompt</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{createTemplate.systemPrompt}</p>
                  </div>
                )}

                {/* Client selector */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Client</label>
                  <select
                    value={createForm.userId}
                    onChange={(e) => setCreateForm((p) => ({ ...p, userId: e.target.value }))}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id} className="bg-zinc-900">
                        {c.name ?? c.email} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Instance Name</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Support Agent"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description (optional)</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                    placeholder="What does this agent do?"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-300/80">
                  ℹ️ A personalized welcome message will be sent to the client using their onboarding context.
                </div>

                {createError && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateStep("template")}
                    className="flex-1 py-3 border border-white/10 hover:border-white/20 text-zinc-300 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !createForm.userId || !createForm.name}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? "Creating…" : "Create & Notify Client"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
