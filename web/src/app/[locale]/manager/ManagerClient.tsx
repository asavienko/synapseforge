"use client";

import { useState } from "react";
import { Users, MessageCircle, Bot, Send, Loader2, X, Shield, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, PLANS, formatDate } from "@/lib/utils";

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

  const totalUnread = clients.reduce((s, c) => s + c.unreadMessages, 0);
  const running = clients.flatMap((c) => c.instances).filter((i) => i.status === "running").length;

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

      <div className="flex h-[calc(100vh-73px)]">
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
    </div>
  );
}
