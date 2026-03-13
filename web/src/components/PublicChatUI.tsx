"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

export interface Branding {
  agentName: string;
  brandColor: string;
  logoUrl: string | null;
  welcomeMessage: string;
  hidePoweredBy: boolean;
}

interface Props {
  instanceId: string;
  branding: Branding;
}

export function PublicChatUI({ instanceId, branding }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: branding.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`/api/chat/${instanceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
            error: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection error. Please check your connection and try again.",
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderBottomColor: `${branding.brandColor}30` }}
      >
        {branding.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={branding.agentName}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: branding.brandColor }}
          >
            <Bot className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="font-semibold text-white text-sm">{branding.agentName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">Online</span>
          </div>
        </div>
        {!branding.hidePoweredBy && (
          <div className="ml-auto">
            <span className="text-xs text-zinc-600">Powered by SynapseForge</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 mt-0.5"
                style={{
                  backgroundColor: `${branding.brandColor}20`,
                  border: `1px solid ${branding.brandColor}40`,
                }}
              >
                <Bot className="w-3.5 h-3.5" style={{ color: branding.brandColor }} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "text-white rounded-br-sm"
                  : msg.error
                  ? "bg-red-500/10 border border-red-500/20 text-red-400 rounded-bl-sm"
                  : "bg-white/[0.06] border border-white/[0.08] text-zinc-100 rounded-bl-sm"
              }`}
              style={
                msg.role === "user"
                  ? { backgroundColor: branding.brandColor }
                  : undefined
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0"
              style={{ backgroundColor: `${branding.brandColor}20` }}
            >
              <Bot className="w-3.5 h-3.5" style={{ color: branding.brandColor }} />
            </div>
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/[0.08]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && void send()
            }
            placeholder="Type a message…"
            disabled={sending}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => void send()}
            disabled={sending || !input.trim()}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
            style={{ backgroundColor: branding.brandColor }}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
