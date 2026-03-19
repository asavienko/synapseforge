"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "What can you do?",
  "How do I integrate you?",
  "Tell me about OpenHelix AI",
];

export function DemoChat() {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate sessionId on mount — safe across all browsers/WebViews
  useEffect(() => {
    try {
      setSessionId(
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`
      );
    } catch {
      setSessionId(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, loading]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || loading || rateLimited || !sessionId) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const res = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text.trim(),
          sessionId,
          stream: true,
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({ error: "Rate limit reached" }));
        setRateLimited(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Demo rate limit reached. Sign up for unlimited access.",
          },
        ]);
        setLoading(false);
        return;
      }

      if (res.status === 503) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "The demo is temporarily unavailable. Please try again later.",
          },
        ]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      // Handle SSE streaming
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  fullContent += parsed.delta;
                  setStreamingContent(fullContent);
                } else if (parsed.error) {
                  console.error("Stream error:", parsed.error);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Add the complete assistant message
      if (fullContent) {
        setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      }
      setStreamingContent("");
      setLoading(false);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again!",
        },
      ]);
      setStreamingContent("");
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleStarterPrompt(prompt: string) {
    sendMessage(prompt);
  }

  const showStarterPrompts = messages.length === 0 && !loading;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f0f14] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-white">OpenHelix AI Demo Agent</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400">Online and ready to chat</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="h-[320px] overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-zinc-800/80 text-zinc-100 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              Hi! I&apos;m a demo of what your customers will experience. Ask me anything!
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`text-sm rounded-2xl px-4 py-3 max-w-[85%] break-words ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-zinc-800/80 text-zinc-100 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Streaming content */}
        {streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-zinc-800/80 text-zinc-100 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
              {streamingContent}
              <span className="inline-block w-2 h-4 ml-0.5 bg-violet-400 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {/* Loading indicator (only when not streaming) */}
        {loading && !streamingContent && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {showStarterPrompts && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleStarterPrompt(prompt)}
              disabled={loading}
              className="text-xs text-zinc-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 hover:border-violet-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Rate limit CTA */}
      {rateLimited && (
        <div className="mx-5 mb-4 bg-violet-950/50 border border-violet-500/30 rounded-xl px-4 py-3">
          <p className="text-sm text-violet-200 mb-2">
            You&apos;ve reached the demo limit.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Sign up for unlimited access
            <Send className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Input area */}
      {!rateLimited && (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-5 py-4 border-t border-white/10"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
