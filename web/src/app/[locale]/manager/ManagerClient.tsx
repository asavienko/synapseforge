"use client";

import { useState, useEffect } from "react";
import { Users, MessageCircle, Bot, Send, Loader2, X, Shield, Activity, Server, AlertTriangle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PLANS, formatDate, formatRelativeTime } from "@/lib/utils";

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

function HealthDot({ healthStatus, hasVps }: { healthStatus: string | null; hasVps: boolean }) {
  if (!hasVps) return <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block" title="No VPS" />;
  if (healthStatus === "healthy") return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" title="Healthy" />;
  if (healthStatus === "degraded") return <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" title="Degraded" />;
  if (healthStatus === "down") return <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" title="Down" />;
  return <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 inline-block" title="Unknown" />;
}

type TabType = "clients" | "instances";

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
  const [activeTab, setActiveTab] = useState<TabType>("clients");

  // Instances tab state
  const [instanceClients, setInstanceClients] = useState<ClientWithInstances[]>([]);
  const [instancesLoading, setInstancesLoading] = useState(false);

  const totalUnread = clients.reduce((s, c) => s + c.unreadMessages, 0);
  const running = clients.flatMap((c) => c.instances).filter((i) => i.status === "running").length;

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
          {alerts.length > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/5 px-8 flex gap-1">
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
      </div>

      {/* ── Clients & Messages tab ── */}
      {activeTab === "clients" && (
        <div className="flex h-[calc(100vh-121px)]">
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
                const od = client.onboardingData
                  ? (() => { try { return JSON.parse(client.onboardingData!); } catch { return null; } })()
                  : null;
                return (
                  <button
                    key={client.id}
                    onClick={() => openThread(client)}
                    className={cn(
                      "w-full text-left p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors",
                      activeClient?.id === client.id && "bg-white/[0.05] border-l-2 border-l-violet-500"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0">
                        {client.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white truncate">{client.name ?? client.email}</span>
                          {client.unreadMessages > 0 && (
                            <span className="bg-violet-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-2">
                              {client.unreadMessages}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">{client.email}</div>
                        {od && (
                          <div className="text-xs text-zinc-600 mt-0.5 truncate">
                            {od.business} · {od.useCase}
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
                      <span className="capitalize">
                        {PLANS[activeClient.plan as keyof typeof PLANS]?.label ?? activeClient.plan} plan
                      </span>
                      <span className="text-zinc-700">·</span>
                      <span>Joined {formatDate(activeClient.createdAt)}</span>
                    </div>
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
                          {isManager ? "You" : activeClient.name ?? "Client"}
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
                            <div key={inst.id} className="px-5 py-3 flex items-center gap-3 text-sm">
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
                              {inst.provisionStatus && !inst.hasGateway && (
                                <span className="text-xs text-zinc-500 italic">{inst.provisionStatus}</span>
                              )}
                              <a
                                href={`/admin#instance-${inst.id}`}
                                className="ml-auto text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0"
                              >
                                View in Admin <ExternalLink className="w-3 h-3" />
                              </a>
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
    </div>
  );
}
