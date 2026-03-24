"use client";

import { useRef, useEffect, useState } from "react";
import { Bot, Play, Loader2, X, Zap, Send, Copy, AlertCircle, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Instance, ChatMsg, CredentialRow, Config } from "../types";
import { SANDBOX_LIMIT, getSandboxRemaining } from "@/lib/sandbox";

interface ChatTabProps {
  instance: Instance;
  id: string;
  credentials: CredentialRow[];
  config: Config;
  chatMessages: ChatMsg[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMsg[]>>;
  chatLoading: boolean;
  setChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
  chatNoCredentials: boolean;
  setChatNoCredentials: React.Dispatch<React.SetStateAction<boolean>>;
  chatProvider: string | null;
  setChatProvider: React.Dispatch<React.SetStateAction<string | null>>;
  showFirstRunBanner: boolean;
  setShowFirstRunBanner: React.Dispatch<React.SetStateAction<boolean>>;
  showToast: (text: string, type?: "success" | "error") => void;
  toggleStatus: () => Promise<void>;
  saving: boolean;
  loadInstance: () => Promise<void>;
  onGoToCredentials: () => void;
}

export function ChatTab({
  instance,
  id,
  credentials,
  config,
  chatMessages,
  setChatMessages,
  chatLoading,
  setChatLoading,
  chatNoCredentials,
  setChatNoCredentials,
  chatProvider,
  setChatProvider,
  showFirstRunBanner,
  setShowFirstRunBanner,
  showToast,
  toggleStatus,
  saving,
  loadInstance,
  onGoToCredentials,
}: ChatTabProps) {
  const t = useTranslations("instanceDetail");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [inlineKeyValue, setInlineKeyValue] = useState("");
  const [inlineKeyProvider, setInlineKeyProvider] = useState<"openai" | "anthropic" | "openrouter">("openai");
  const [inlineKeySaving, setInlineKeySaving] = useState(false);
  const [inlineKeyError, setInlineKeyError] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  async function sendChat(override?: string) {
    const text = override !== undefined ? override : chatInput;
    if (!text.trim() || chatLoading) return;

    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setChatLoading(true);
    setChatNoCredentials(false);

    const streamingId = `streaming-${Date.now()}`;
    setChatMessages((prev) => [...prev, { id: streamingId, role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/instances/${id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        setChatMessages((prev) => prev.filter((m) => m.id !== streamingId));
        let errData: { error?: string; missingCredential?: boolean } = {};
        try { errData = await res.json(); } catch { /* ignore */ }
        if (res.status === 402 && errData.error === "sandbox_exhausted") {
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: "__SANDBOX_EXHAUSTED__", isError: false },
          ]);
          loadInstance();
        } else if (errData.missingCredential) {
          setChatNoCredentials(true);
          setChatMessages([]);
        } else {
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: errData.error ?? t("somethingWentWrong"), isError: true },
          ]);
        }
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setChatMessages((prev) => prev.filter((m) => m.id !== streamingId));
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";
      let sseBuffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });

          // Parse SSE: split on double-newline boundaries
          const parts = sseBuffer.split("\n\n");
          // Keep last incomplete chunk in buffer
          sseBuffer = parts.pop() ?? "";

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") break;
            try {
              const parsed = JSON.parse(payload) as { delta?: string; error?: string };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.delta) {
                fullText += parsed.delta;
                setChatMessages((prev) =>
                  prev.map((m) => (m.id === streamingId ? { ...m, content: fullText } : m))
                );
              }
            } catch {
              // Ignore malformed SSE lines
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Finalize: replace streaming placeholder with committed message
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === streamingId ? { role: "assistant" as const, content: fullText } : m
        )
      );
    } catch (err) {
      setChatMessages((prev) => prev.filter((m) => m.id !== streamingId));
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : t("somethingWentWrong"),
          isError: true,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function saveInlineKey() {
    if (!inlineKeyValue.trim()) return;
    setInlineKeySaving(true);
    setInlineKeyError("");
    const credKey = inlineKeyProvider === "openai" ? "openai_api_key"
      : inlineKeyProvider === "anthropic" ? "anthropic_api_key"
      : "openrouter_api_key";
    const res = await fetch(`/api/instances/${id}/credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: credKey, value: inlineKeyValue.trim() }),
    });
    if (res.ok) {
      setChatNoCredentials(false);
      setInlineKeyValue("");
      await loadInstance();
      setTimeout(() => {
        document.querySelector<HTMLTextAreaElement>("textarea[placeholder]")?.focus();
      }, 150);
    } else {
      const data = await res.json();
      setInlineKeyError(data.error ?? "Failed to save credential");
    }
    setInlineKeySaving(false);
  }

  const sandboxRemaining = getSandboxRemaining(instance.sandboxUsed ?? 0);
  const hasLLMCreds = credentials.some((c) =>
    ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(c.key)
  );

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Bot className="w-4 h-4" />
          <span>
            {chatProvider
              ? `${config.model} via ${chatProvider}`
              : config.model}
          </span>
          {config.sandboxMode && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
              Preview Mode
            </span>
          )}
        </div>
        {chatMessages.length > 0 && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/instances/${id}/export/chat?format=json`}
              download
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-violet-400 transition-colors px-2 py-1 rounded-lg border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </a>
            <button
              onClick={async () => {
                setChatMessages([]);
                setChatNoCredentials(false);
                setChatProvider(null);
                fetch(`/api/instances/${id}/chat`, { method: "DELETE" }).catch(() => {});
              }}
              className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg border border-white/5 hover:border-white/10"
            >
              {t("chat.clearChat")}
            </button>
          </div>
        )}
      </div>

      {/* Sandbox mode banner */}
      {instance.sandboxMode && !hasLLMCreds && (
        <div className={`mb-3 rounded-xl px-4 py-3 border flex items-center justify-between ${
          sandboxRemaining === 0
            ? "bg-red-500/10 border-red-500/20 text-red-400"
            : sandboxRemaining <= 5
            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
            : "bg-violet-500/10 border-violet-500/20 text-violet-400"
        }`}>
          <div>
            <p className="text-sm font-semibold">
              {sandboxRemaining === 0
                ? t("chat.sandboxExhausted")
                : t("chat.sandboxActive", { remaining: String(sandboxRemaining) })}
            </p>
            <p className="text-xs opacity-70 mt-0.5">
              {sandboxRemaining === 0
                ? t("chat.sandboxExhaustedDesc")
                : t("chat.sandboxDesc")}
            </p>
          </div>
          {sandboxRemaining === 0 && (
            <div className="flex gap-2 shrink-0 ml-3">
              <a
                href="https://cal.com/openhelixai/setup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
              >
                {t("chat.bookCall")}
              </a>
              <button
                onClick={onGoToCredentials}
                className="text-xs px-3 py-1.5 bg-zinc-700 text-zinc-300 border border-white/10 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                {t("chat.addApiKey")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instance stopped state */}
      {instance.status !== "running" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-white font-semibold mb-2">{t("chat.stoppedTitle")}</h3>
            <p className="text-zinc-500 text-sm mb-4">{t("chat.stoppedDesc")}</p>
            <button
              onClick={toggleStatus}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white mx-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {t("start")}
            </button>
          </div>
        </div>
      )}

      {/* Inline key setup */}
      {instance.status === "running" && chatNoCredentials && chatMessages.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-2">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">{t("chat.inlineKeyTitle")}</h3>
                <p className="text-zinc-500 text-xs">{t("chat.inlineKeyDesc")}</p>
              </div>
            </div>

            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-3">
              {(["openai", "anthropic", "openrouter"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setInlineKeyProvider(p)}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                    inlineKeyProvider === p
                      ? "bg-violet-600 text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {p === "openai" ? "OpenAI" : p === "anthropic" ? "Anthropic" : "OpenRouter"}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                value={inlineKeyValue}
                onChange={(e) => setInlineKeyValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveInlineKey()}
                placeholder={
                  inlineKeyProvider === "openai" ? "sk-..." :
                  inlineKeyProvider === "anthropic" ? "sk-ant-..." : "sk-or-..."
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                onClick={saveInlineKey}
                disabled={inlineKeySaving || !inlineKeyValue.trim()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white shrink-0"
              >
                {inlineKeySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {inlineKeySaving ? t("chat.inlineKeySaving") : t("chat.inlineKeyStart")}
              </button>
            </div>
            {inlineKeyError && (
              <p className="text-red-400 text-xs mt-2">{inlineKeyError}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <a
                href={
                  inlineKeyProvider === "openai" ? "https://platform.openai.com/api-keys" :
                  inlineKeyProvider === "anthropic" ? "https://console.anthropic.com/settings/keys" :
                  "https://openrouter.ai/keys"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {t("chat.inlineKeyGetKey")}
              </a>
              <button
                onClick={onGoToCredentials}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {t("chat.inlineKeyAdvanced")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {instance.status === "running" && (
        <>
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" style={{ maxHeight: 400 }}>
            {chatMessages.length === 0 && !chatLoading && (
              <div className="flex flex-col items-center justify-center h-40 gap-4">
                <p className="text-zinc-600 text-sm">{t("chat.emptyState")}</p>
                {(() => {
                  const type = instance?.type ?? "custom";
                  const chips =
                    type === "support"
                      ? [t("chat.starterChips.support.chip1"), t("chat.starterChips.support.chip2"), t("chat.starterChips.support.chip3")]
                      : type === "assistant"
                      ? [t("chat.starterChips.assistant.chip1"), t("chat.starterChips.assistant.chip2"), t("chat.starterChips.assistant.chip3")]
                      : type === "analyst"
                      ? [t("chat.starterChips.analyst.chip1"), t("chat.starterChips.analyst.chip2"), t("chat.starterChips.analyst.chip3")]
                      : [t("chat.starterChips.custom.chip1"), t("chat.starterChips.custom.chip2"), t("chat.starterChips.custom.chip3")];
                  return (
                    <div className="flex flex-wrap justify-center gap-2">
                      {chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => sendChat(chip)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs px-3 py-2 rounded-full transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
            {chatMessages.map((msg, i) => {
              if (msg.content === "__SANDBOX_EXHAUSTED__") {
                return (
                  <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm text-amber-300 font-semibold mb-2">Sandbox messages used up</p>
                    <p className="text-xs text-amber-400/70 mb-3">Add your own API key to keep chatting.</p>
                    <button
                      onClick={onGoToCredentials}
                      className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Add API Key
                    </button>
                  </div>
                );
              }
              return (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse justify-end" : "flex-row"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                  )}
                  <div className={`relative group max-w-[80%] px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-violet-600/20 border border-violet-500/20 rounded-2xl rounded-br-sm text-white"
                      : msg.isError
                        ? "bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-sm text-red-300"
                        : "bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm text-zinc-200"
                  }`}>
                    {msg.role === "user" || msg.isError ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="text-sm text-zinc-200 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-code:text-violet-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-li:text-zinc-300 prose-strong:text-white prose-a:text-violet-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {(msg.latencyMs != null || msg.source === "openclaw") && (
                      <p className="text-xs text-zinc-600 mt-1 flex items-center gap-2">
                        {msg.latencyMs != null && <span>{msg.latencyMs}ms</span>}
                        {msg.source === "openclaw" && (
                          <span className="inline-flex items-center gap-0.5 text-amber-400 font-medium">
                            ⚡ OpenClaw
                          </span>
                        )}
                      </p>
                    )}
                    {msg.createdAt && (
                      <span className="text-xs text-zinc-700 group-hover:text-zinc-500 transition-colors">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    {msg.role === "assistant" && !msg.isError && (
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/10"
                        title={t("chat.copyResponse")}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {chatLoading && (
            <div className="flex items-end gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {showFirstRunBanner && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3 mb-3 flex items-center gap-3">
              <span className="text-sm text-violet-300 flex-1">👋 {t("chat.firstRunBanner")}</span>
              <button
                onClick={() => setShowFirstRunBanner(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {chatNoCredentials && chatMessages.length > 0 && (
            <div className="mb-3 flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-sm text-amber-300 flex-1">{t("chat.noCredsDesc")}</span>
              <button onClick={onGoToCredentials} className="text-xs text-violet-400 hover:text-violet-300 shrink-0">
                {t("chat.goToCredentials")}
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              data-testid="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChat();
                }
              }}
              placeholder={t("chat.placeholder")}
              rows={2}
              disabled={chatLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none disabled:opacity-50"
            />
            <button
              onClick={() => sendChat()}
              disabled={chatLoading || !chatInput.trim()}
              data-testid="chat-send-btn"
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white self-end"
            >
              {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span className="hidden sm:inline">{chatLoading ? t("chat.sending") : t("chat.send")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
