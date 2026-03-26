"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Send, Loader2, MessageCircle, User, Shield, CalendarDays, ArrowLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { CalBookingButton } from "@/components/CalBookingButton";

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
  const [calLink, setCalLink] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter((m) => m.body.toLowerCase().includes(query));
  }, [messages, searchQuery]);

  async function loadMessages() {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Legacy shape fallback
        setMessages(data);
      } else if (data?.noManager) {
        setNoManager(true);
      } else if (data?.messages) {
        setMessages(data.messages);
        if (data.calLink) setCalLink(data.calLink);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMessages();

    // Mark manager messages as read when page opens
    fetch("/api/messages/read-all", { method: "PATCH" }).catch(() => {});

    // SSE for real-time updates — replaces the 10s polling interval
    const es = new EventSource("/api/messages/stream");

    es.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data) as Message;
      setMessages((prev) => {
        // Only add if not already in list (avoid duplicates)
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    es.addEventListener("error", () => {
      // SSE error — connection will retry automatically
    });

    return () => {
      es.close();
    };
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
      <div className="pt-14 md:pt-0 flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (noManager) {
    return (
      <div className="p-4 pt-14 md:p-8 md:pt-6">
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh)] pt-14 md:pt-0">
      <div className="p-4 md:p-6 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
            <p className="text-zinc-400 text-sm mt-1">{t("subtitle")}</p>
          </div>
          {messages.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-40 sm:w-56 bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-zinc-500">
            {filteredMessages.length} of {messages.length} messages
          </p>
        )}
      </div>

      {/* Book a call CTA — shown only when manager has a Cal.com link */}
      {calLink && (
        <div className="px-4 md:px-6 py-3 border-b border-white/5 bg-violet-600/5 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-zinc-300">Prefer a live conversation?</span>
            </div>
            <CalBookingButton calLink={calLink} variant="outline" label={t("scheduleCall")} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">{searchQuery ? "No messages match your search" : t("noMessagesYet")}</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUser = msg.senderType === "user";
            return (
              <div key={msg.id} className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-4 h-4 text-violet-400" />
                  </div>
                )}
                <div className={cn("max-w-[85%] md:max-w-[70%]", isUser ? "items-end" : "items-start", "flex flex-col gap-1")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
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
