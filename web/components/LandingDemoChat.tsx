"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How does OpenHelix AI work?",
  "What can my AI agent do?",
  "How much does it cost?",
];

export function LandingDemoChat() {
  const t = useTranslations("demo");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading || limitReached) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "⏳ Too many messages right now. Please wait a few minutes and try again!",
          },
        ]);
        return;
      }

      const data = (await res.json()) as {
        reply?: string;
        limitReached?: boolean;
      };

      if (data.limitReached) {
        setLimitReached(true);
      }

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply! },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops, something went wrong. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleQuickPrompt(prompt: string) {
    sendMessage(prompt);
  }

  const showQuickPrompts = messages.length === 0 && !loading;

  return (
    <>
      {/* ── Collapsed: floating pill button ─────────────────────────────── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-3 rounded-full shadow-lg shadow-violet-900/40 transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-sm"
          aria-label={t("tryIt")}
        >
          <Bot className="w-4 h-4 shrink-0" />
          <span>{t("tryIt")}</span>
        </button>
      )}

      {/* ── Expanded: chat window ────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden w-[90vw] sm:w-80 max-w-[calc(100vw-32px)]"
          style={{
            maxHeight: "min(24rem, calc(100vh - 6rem))",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  {t("title")}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-zinc-400">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-zinc-800 text-zinc-100 text-sm rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                  Hi! I&apos;m OpenHelix AI&apos;s demo agent. Ask me anything!
                </div>
              </div>
            )}

            {/* Message history */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div
                  className={`text-sm rounded-2xl px-3 py-2 max-w-[85%] break-words ${
                    msg.role === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm"
                      : "bg-zinc-800 text-zinc-100 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            {/* Limit reached CTA */}
            {limitReached && (
              <div className="bg-violet-950/60 border border-violet-500/30 rounded-xl px-3 py-2.5 text-center">
                <p className="text-xs text-violet-300 mb-2">
                  🚀 {t("limitReached")}
                </p>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  {t("signUpCta")}
                </Link>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="px-4 pb-2 flex flex-col gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-left text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/10 px-3 py-2 rounded-lg transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          {!limitReached && (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-3 py-3 border-t border-white/10 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                disabled={loading}
                className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 transition-colors min-w-0"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-8 h-8 flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0"
                aria-label="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
