"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageCircle, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Message {
  id: string;
  body: string;
  senderType: "user" | "manager";
  read: boolean;
  createdAt: string;
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  }).format(new Date(date));
}

export default function MessagesPage() {
  const t = useTranslations("dashboard.messages");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [noManager, setNoManager] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
    } else {
      const data = await res.json();
      if (data.error === "No manager assigned yet.") setNoManager(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError("");
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    const data = await res.json();
    setSending(false);

    if (!res.ok) {
      setError(data.error || t("failedSend"));
    } else {
      setBody("");
      setMessages((prev) => [...prev, data]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (noManager) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>
        <p className="text-zinc-400 text-sm mb-8">{t("subtitle")}</p>
        <div className="glow-border rounded-2xl p-12 bg-white/[0.02] text-center max-w-lg">
          <MessageCircle className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t("noManagerTitle")}</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{t("noManagerDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh)] pt-0">
      <div className="p-6 border-b border-white/5 shrink-0">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-zinc-400 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">{t("noMessagesYet")}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.senderType === "user";
            return (
              <div key={msg.id} className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-violet-400" />
                  </div>
                )}
                <div className={cn("max-w-[70%]", isUser ? "items-end" : "items-start", "flex flex-col gap-1")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    isUser
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-white/[0.05] border border-white/10 text-zinc-200 rounded-tl-sm"
                  )}>
                    {msg.body}
                  </div>
                  <span className="text-xs text-zinc-600">{formatTime(msg.createdAt)}</span>
                </div>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5 shrink-0">
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("messagePlaceholder")}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
