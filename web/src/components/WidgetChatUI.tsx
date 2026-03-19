"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
  streaming?: boolean;
}

interface WidgetChatUIProps {
  instanceId: string;
  greeting?: string;
  brandColor?: string;
  logoUrl?: string | null;
  agentName?: string;
  onClose?: () => void;
}

export function WidgetChatUI({
  instanceId,
  greeting,
  brandColor = "#7c3aed",
  logoUrl,
  agentName = "AI Assistant",
  onClose,
}: WidgetChatUIProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: "assistant",
      content: greeting || `Hi! I'm ${agentName}. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending) return;

    setSending(true);
    setInput("");

    // Add user message
    const nextMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(nextMessages);

    // Build history to send
    const history = nextMessages
      .slice(1) // skip initial welcome
      .slice(0, -1) // exclude just-added user message
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`/api/chat/${instanceId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ message: msg, history }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errorData.error || "Sorry, something went wrong. Please try again.",
            error: true,
          },
        ]);
        setSending(false);
        return;
      }

      // Handle streaming response
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        // Add empty assistant message for streaming
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", streaming: true },
        ]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantMessage += chunk;

            // Update the last message with streamed content
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 && m.role === "assistant"
                  ? { ...m, content: assistantMessage, streaming: true }
                  : m
              )
            );
          }
        }

        // Mark as complete
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 && m.role === "assistant"
              ? { ...m, streaming: false }
              : m
          )
        );
      } else {
        // Fallback for non-streaming responses
        const data = await res.json();
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
          content: "Sorry, I'm having trouble connecting. Please try again later.",
          error: true,
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Handle close button
  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
        style={{ borderBottomColor: `${brandColor}30` }}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={agentName}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: brandColor }}
          >
            <Bot className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{agentName}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-500">Online</span>
          </div>
        </div>
        
        {/* Close button (visible in iframe) */}
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-md"
                  : msg.error
                  ? "bg-red-500/10 border border-red-500/20 text-red-200 rounded-bl-md"
                  : "bg-white/10 text-zinc-100 rounded-bl-md"
              }`}
            >
              {msg.content}
              {msg.streaming && (
                <span className="inline-flex ml-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse ml-0.5" style={{ animationDelay: "0.1s" }} />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse ml-0.5" style={{ animationDelay: "0.2s" }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 bg-[#0a0a0f]">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 transition-colors"
            style={{ backgroundColor: sending ? undefined : brandColor }}
            aria-label="Send message"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-2">
          Powered by{" "}
          <a
            href="https://synapseforge.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300"
          >
            SynapseForge
          </a>
        </p>
      </div>
    </div>
  );
}
