"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Bot, Copy, Check, Send, Loader2, ExternalLink,
  MessageSquare, Share2, Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface Instance {
  id: string;
  name: string;
  status: string;
  telegramBotUsername?: string | null;
}

interface CredentialRow {
  key: string;
  maskedValue: string;
}

interface ShareLinks {
  telegram?: string;
  discord?: string;
  slack?: string;
  webChat: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  latencyMs?: number;
  isError?: boolean;
}

function formatRelativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ShareAgentPage() {
  const t = useTranslations("share");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [instance, setInstance] = useState<Instance | null>(null);
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Quick test chat state
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<ChatMsg[]>([]);
  const [testLoading, setTestLoading] = useState(false);

  const loadData = useCallback(async () => {
    const [instanceRes, credsRes] = await Promise.all([
      fetch(`/api/instances/${id}`),
      fetch(`/api/instances/${id}/credentials`),
    ]);

    if (!instanceRes.ok) {
      router.push("/dashboard/instances");
      return;
    }

    setInstance(await instanceRes.json());
    if (credsRes.ok) setCredentials(await credsRes.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const credKeys = credentials.map((c) => c.key);
  const hasTelegram = credKeys.includes("telegram_bot_token");
  const hasDiscord = credKeys.includes("discord_bot_token");
  const hasSlack = credKeys.includes("slack_app_token") || credKeys.includes("slack_bot_token");

  // Build share links inline (no separate API needed)
  const shareLinks: ShareLinks = {
    telegram: hasTelegram && instance?.telegramBotUsername
      ? `https://t.me/${instance.telegramBotUsername.replace("@", "")}`
      : undefined,
    discord: hasDiscord ? `https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot` : undefined,
    slack: hasSlack ? undefined : undefined, // Slack uses workspace-based connection
    webChat: `${typeof window !== "undefined" ? window.location.origin : ""}/chat/${id}`,
  };

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2000);
  }

  async function sendTestMessage() {
    if (!testInput.trim() || testLoading) return;
    const userMsg: ChatMsg = { role: "user", content: testInput.trim() };
    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput("");
    setTestLoading(true);

    const res = await fetch(`/api/instances/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...testMessages, userMsg].map((m) => ({ role: m.role, content: m.content })) }),
    });
    const data = await res.json();

    setTestMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: res.ok ? (data.response ?? "…") : (data.error ?? t("somethingWentWrong")),
        isError: !res.ok,
        latencyMs: data.latencyMs,
      },
    ]);
    setTestLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!instance) return null;

  const telegramQrUrl = shareLinks.telegram
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(shareLinks.telegram)}&size=150x150`
    : null;

  const channelCount = [hasTelegram, hasDiscord, hasSlack].filter(Boolean).length;

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      {/* Back */}
      <Link
        href={`/dashboard/instances/${id}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to instance
      </Link>

      {/* ── Hero ── */}
      <div className="glow-border rounded-2xl bg-white/[0.02] p-8 text-center mb-6">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-2">Your AI Agent is Live!</h1>
        <p className="text-zinc-400 text-lg">
          <span className="text-white font-semibold">&ldquo;{instance.name}&rdquo;</span> is online and ready to help your customers.
        </p>
        {channelCount === 0 && (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
            <Zap className="w-4 h-4" />
            Connect channels below to start reaching customers
          </div>
        )}
      </div>

      {/* ── Channel Cards ── */}
      {(hasTelegram || hasDiscord || hasSlack) && (
        <div className="space-y-3 mb-6">
          <h2 className="text-xs text-zinc-500 uppercase tracking-wider px-1">Active Channels</h2>

          {/* Telegram */}
          {hasTelegram && (
            <div className="glow-border rounded-2xl bg-white/[0.02] p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-2xl shrink-0">
                ✈️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">Telegram</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
                </div>
                {instance.telegramBotUsername ? (
                  <p className="text-sm text-zinc-400 mb-3">
                    Your bot is live at{" "}
                    <span className="text-sky-300 font-medium">{instance.telegramBotUsername}</span>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-400 mb-3">Telegram bot is connected and ready.</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {shareLinks.telegram && (
                    <a
                      href={shareLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open on Telegram →
                    </a>
                  )}
                  {shareLinks.telegram && (
                    <button
                      onClick={() => copyToClipboard(shareLinks.telegram!, "telegram-link")}
                      className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-zinc-300 text-sm px-3 py-2 rounded-xl"
                    >
                      {copiedItem === "telegram-link" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      Copy link
                    </button>
                  )}
                </div>
              </div>
              {/* QR code */}
              {telegramQrUrl && (
                <div className="shrink-0 hidden sm:block">
                  <div className="p-2 bg-white rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={telegramQrUrl}
                      alt={t("telegramQrCode")}
                      width={100}
                      height={100}
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-zinc-600 text-center mt-1">Scan to open</p>
                </div>
              )}
            </div>
          )}

          {/* Discord */}
          {hasDiscord && (
            <div className="glow-border rounded-2xl bg-white/[0.02] p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
                🎮
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">Discord</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Add this bot to your Discord server and it&apos;ll respond to messages automatically.</p>
                <div className="flex items-center gap-2">
                  {shareLinks.discord && (
                    <a
                      href={shareLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Invite Bot →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Slack */}
          {hasSlack && (
            <div className="glow-border rounded-2xl bg-white/[0.02] p-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-2xl shrink-0">
                💬
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">Slack</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Live</span>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Your bot is connected to your Slack workspace.</p>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-zinc-400 space-y-1">
                  <div className="font-medium text-zinc-300 mb-1.5">To start using your bot:</div>
                  <div>1. Open Slack and go to any channel</div>
                  <div>2. Type <code className="text-violet-300 bg-violet-500/10 px-1 rounded">/invite @YourBotName</code></div>
                  <div>3. Start chatting with it directly or mention it</div>
                </div>
              </div>
            </div>
          )}

          {/* Web Chat */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-white">Web Chat</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">Always on</span>
              </div>
              <p className="text-sm text-zinc-400 mb-3">Share this link with customers — they can chat right in their browser.</p>
              <div className="flex items-center gap-2 p-3 bg-black/30 border border-white/10 rounded-xl font-mono text-xs text-zinc-300 mb-3">
                <span className="flex-1 truncate">{shareLinks.webChat}</span>
                <button
                  onClick={() => copyToClipboard(shareLinks.webChat, "webchat")}
                  className="text-zinc-400 hover:text-white transition-colors shrink-0"
                >
                  {copiedItem === "webchat" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => copyToClipboard(shareLinks.webChat, "webchat-btn")}
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl"
              >
                {copiedItem === "webchat-btn" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copiedItem === "webchat-btn" ? t("copied") : t("copyWebChatLink")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No channels connected */}
      {!hasTelegram && !hasDiscord && !hasSlack && (
        <div className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6 text-center">
          <div className="text-3xl mb-3">📡</div>
          <h3 className="text-white font-semibold mb-2">No channels connected yet</h3>
          <p className="text-zinc-500 text-sm mb-4">
            Connect Telegram, Discord, or Slack so customers can reach your AI.
          </p>
          <Link
            href={`/dashboard/instances/${id}?tab=Credentials`}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl"
          >
            <Zap className="w-4 h-4" />
            Connect a channel
          </Link>

          {/* Web chat is always available */}
          <div className="mt-5 p-4 bg-white/[0.02] border border-white/10 rounded-xl text-left">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-white">Web Chat is always available</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-black/30 border border-white/10 rounded-lg font-mono text-xs text-zinc-300">
              <span className="flex-1 truncate">{shareLinks.webChat}</span>
              <button
                onClick={() => copyToClipboard(shareLinks.webChat, "webchat-empty")}
                className="text-zinc-400 hover:text-white transition-colors shrink-0"
              >
                {copiedItem === "webchat-empty" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Test your agent ── */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden mb-6">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Bot className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-semibold text-white">Test your agent right here</h2>
          {testMessages.length > 0 && (
            <button
              onClick={() => setTestMessages([])}
              className="ml-auto text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="p-5">
          {/* Messages */}
          {testMessages.length > 0 && (
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {testMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "user" ? "bg-violet-600" : "bg-zinc-700"
                  }`}>
                    {msg.role === "user"
                      ? <span className="text-xs font-bold text-white">U</span>
                      : <Bot className="w-3 h-3 text-zinc-300" />}
                  </div>
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-violet-600/30 border border-violet-500/30 text-white"
                      : msg.isError
                        ? "bg-red-500/10 border border-red-500/20 text-red-300"
                        : "bg-white/[0.04] border border-white/10 text-zinc-200"
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    {msg.latencyMs != null && (
                      <p className="text-xs text-zinc-600 mt-1">{msg.latencyMs}ms</p>
                    )}
                  </div>
                </div>
              ))}
              {testLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3 h-3 text-zinc-300" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendTestMessage(); }}
              placeholder={t("sayHello")}
              disabled={testLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={sendTestMessage}
              disabled={testLoading || !testInput.trim()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white shrink-0"
            >
              {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {testLoading ? t("sending") : t("send")}
            </button>
          </div>
          {testMessages.length === 0 && (
            <p className="text-xs text-zinc-600 mt-2 text-center">
              Send a message to see how your agent responds
            </p>
          )}
        </div>
      </div>

      {/* ── Share summary ── */}
      <div className="glow-border rounded-2xl bg-white/[0.02] p-5">
        <h2 className="text-xs text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Share2 className="w-3.5 h-3.5" />
          Quick share
        </h2>
        <div className="space-y-3">
          {/* Web chat copy */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-zinc-300 mb-0.5">Web chat link</div>
              <div className="text-xs text-zinc-500 font-mono truncate">{shareLinks.webChat}</div>
            </div>
            <button
              onClick={() => copyToClipboard(shareLinks.webChat, "share-webchat")}
              className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              {copiedItem === "share-webchat" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedItem === "share-webchat" ? t("copied") : t("copy")}
            </button>
          </div>

          {/* Telegram copy */}
          {shareLinks.telegram && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-sm text-zinc-300 mb-0.5">Telegram link</div>
                <div className="text-xs text-zinc-500 font-mono truncate">{shareLinks.telegram}</div>
              </div>
              <button
                onClick={() => copyToClipboard(shareLinks.telegram!, "share-telegram")}
                className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 px-3 py-2 rounded-xl transition-colors shrink-0"
              >
                {copiedItem === "share-telegram" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedItem === "share-telegram" ? t("copied") : t("copy")}
              </button>
            </div>
          )}

          {/* QR code below */}
          {telegramQrUrl && (
            <div className="pt-2 flex items-center gap-4">
              <div className="p-2 bg-white rounded-xl inline-block sm:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={telegramQrUrl} alt="Telegram QR" width={120} height={120} className="rounded-lg" />
              </div>
              <p className="text-xs text-zinc-600">Share the QR code with customers for instant Telegram access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
