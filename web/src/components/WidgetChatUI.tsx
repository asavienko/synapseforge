"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface Branding {
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

export function WidgetChatUI({ instanceId, branding }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: branding.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Starter questions
  const STARTERS = [
    "What can you help me with?",
    "Tell me about your services",
    "I have a question",
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Notify parent window about chat events
  const notifyParent = (action: string) => {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'synapseforge-chat',
        action,
        instanceId,
      }, '*');
    }
  };

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    
    setInput("");
    setStarted(true);
    setSending(true);
    notifyParent('message-sent');

    const userMsg: Message = { role: "user", content: msg };
    const nextMessages = [...messages, userMsg];
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Sorry, something went wrong. Please try again.",
            error: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
        notifyParent('new-message');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { 
          role: "assistant", 
          content: "Sorry, I'm having trouble connecting. Please try again later.", 
          error: true 
        },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  // Handle close button
  const handleClose = () => {
    notifyParent('close');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/10"
        style={{ borderBottomColor: `${branding.brandColor}30` }}
      >
        {branding.logoUrl ? (
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
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm truncate">{branding.agentName}</p>
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
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
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
              {msg.role === "assistant" && !msg.error ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-1 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-1 space-y-0.5">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    code: ({ children }) => (
                      <code className="bg-white/10 rounded px-1 py-0.5 font-mono text-xs">{children}</code>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline opacity-80 hover:opacity-100"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0"
              style={{ backgroundColor: `${branding.brandColor}20` }}
            >
              <Bot className="w-3.5 h-3.5" style={{ color: branding.brandColor }} />
            </div>
            <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Conversation starters */}
      {!started && !sending && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: `${branding.brandColor}40`,
                color: branding.brandColor,
                backgroundColor: `${branding.brandColor}10`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/[0.08]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
            placeholder="Type your message..."
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
        
        {!branding.hidePoweredBy && (
          <div className="text-center mt-2">
            <a 
              href="https://synapseforge.ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Powered by SynapseForge
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
