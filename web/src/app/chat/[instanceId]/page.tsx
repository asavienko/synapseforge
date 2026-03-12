"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

function BotIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM7.5 14a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm6 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM3 21v-2a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2H3z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
    </span>
  );
}

export default function ChatPage() {
  const params = useParams();
  const instanceId = params?.instanceId as string;

  const [instanceName, setInstanceName] = useState<string>("AI Assistant");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch instance name
  useEffect(() => {
    if (!instanceId) return;
    fetch(`/api/chat/${instanceId}/info`)
      .then((r) => r.json())
      .then((d: { name?: string; offline?: boolean }) => {
        if (d.name) setInstanceName(d.name);
        if (d.offline) setOffline(true);
      })
      .catch(() => {});
  }, [instanceId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${instanceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = (await res.json()) as { response?: string; error?: string };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response ?? data.error ?? "Something went wrong.",
        error: !data.response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Failed to connect. Please check your internet connection and try again.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white">
          <BotIcon />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight">{instanceName}</h1>
          <p className="text-xs text-zinc-400">{offline ? "Offline" : "AI Assistant"}</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !offline && (
          <div className="flex flex-col items-center justify-center h-full text-center text-zinc-500 gap-3 pb-16">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-400">
              <BotIcon />
            </div>
            <p className="text-sm">
              Hi! I&apos;m <span className="text-zinc-300 font-medium">{instanceName}</span>. How can I help you today?
            </p>
          </div>
        )}

        {offline && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-zinc-500 space-y-2">
              <p className="text-4xl">😴</p>
              <p className="text-sm">This assistant is currently offline.</p>
              <p className="text-xs text-zinc-600">Please try again later.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2 shrink-0 mt-0.5">
                <BotIcon />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : msg.error
                  ? "bg-red-900/40 text-red-300 border border-red-800 rounded-bl-sm"
                  : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2 shrink-0 mt-0.5">
              <BotIcon />
            </div>
            <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="shrink-0 px-4 py-3 bg-zinc-900 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            className="flex-1 bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-1 focus:ring-indigo-500 max-h-36 min-h-[44px]"
            placeholder={offline ? "This assistant is offline" : "Type a message…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit(e as unknown as FormEvent);
              }
            }}
            rows={1}
            disabled={offline || loading}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || offline}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <SendIcon />
          </button>
        </form>
        <p className="text-center text-[11px] text-zinc-600 mt-2">
          Powered by SynapseForge ⚡
        </p>
      </footer>
    </div>
  );
}
