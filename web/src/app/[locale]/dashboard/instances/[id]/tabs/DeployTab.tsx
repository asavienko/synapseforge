"use client";

import { useState, useEffect } from "react";
import { Key, MessageSquare, Zap, Copy, Check, Download, Share2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Instance, CredentialRow } from "../types";

interface DeployTabProps {
  instance: Instance;
  instanceId: string;
  credentials: CredentialRow[];
  credsLoading: boolean;
  onGoToCredentials: () => void;
}

export function DeployTab({
  instance,
  instanceId,
  credentials,
  credsLoading,
  onGoToCredentials,
}: DeployTabProps) {
  const t = useTranslations("instanceDetail");

  const credKeys = credentials.map((c) => c.key);
  const hasLLM = credKeys.some((k) => ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(k));
  const hasTelegram = credKeys.includes("telegram_bot_token");
  const hasWhatsApp = credKeys.some(k => ["twilio_account_sid", "whatsapp_business_token"].includes(k));
  const hasWidget = true;
  const hasAnyRealChannel = hasTelegram || hasWhatsApp;
  const isLive = hasAnyRealChannel;

  const activeChannels = [
    hasTelegram && t("deploy.channelTelegram"),
    hasWhatsApp && t("deploy.channelWhatsApp"),
    hasWidget && t("deploy.channelWidget"),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {/* Quick-connect banner */}
      {hasLLM && !hasAnyRealChannel && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-300 mb-1">✅ Your AI is ready — now connect a channel</p>
            <p className="text-xs text-zinc-500">Add a Telegram bot token or embed the web widget to start handling real customer conversations.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={onGoToCredentials}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/20 rounded-xl transition-colors"
            >
              ✈️ Set up Telegram
            </button>
            <button
              onClick={onGoToCredentials}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 rounded-xl transition-colors"
            >
              💬 Set up WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Not live */}
      {!isLive && (
        <>
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Go live in 3 steps</h2>
                <p className="text-sm text-zinc-400">Connect your agent to Telegram — the fastest way to start handling real conversations.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800/30 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-2">Create your Telegram bot</h3>
                  <ul className="space-y-1.5 text-sm text-zinc-400">
                    <li>Open Telegram, search for <span className="text-sky-400">@BotFather</span></li>
                    <li>Send: <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">/newbot</code></li>
                    <li>Choose a name and username</li>
                    <li>BotFather gives you a token</li>
                  </ul>
                  <p className="text-xs text-zinc-500 mt-2">Copy that token.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-800/30 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-400 shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-2">Paste the token</h3>
                  <button
                    onClick={onGoToCredentials}
                    disabled={credsLoading}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-colors text-white rounded-lg"
                  >
                    Add Telegram Bot →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">✓</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-1">Done</h3>
                  <p className="text-sm text-zinc-400">Your agent goes live instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <EmbedCard instanceId={instanceId} t={t} />
        </>
      )}

      {/* Live */}
      {isLive && (
        <div className="space-y-4">
          <div className="glow-border rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xl">🎉</span>
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-emerald-300">Agent is live</h2>
              <p className="text-xs text-zinc-400">Connected to: {activeChannels.filter(ch => ch !== t("deploy.channelWidget")).join(", ")}</p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {t("deploy.liveStatus")}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className={`glow-border rounded-2xl bg-white/[0.02] p-5 border ${hasTelegram ? "border-emerald-500/30" : "border-white/5"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${hasTelegram ? "bg-sky-600/20 border border-sky-500/30" : "bg-zinc-800/50 border border-white/5"}`}>✈️</div>
                <div>
                  <h3 className={`text-sm font-semibold ${hasTelegram ? "text-white" : "text-zinc-500"}`}>Telegram</h3>
                </div>
                {hasTelegram && (
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{t("deploy.activeStatus")}</span>
                )}
              </div>
              {hasTelegram ? (
                <div>
                  <p className="text-sm text-zinc-400">Bot connected</p>
                  {instance.telegramBotUsername && (
                    <p className="text-xs text-zinc-500 mt-1">@{instance.telegramBotUsername}</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoToCredentials}
                  className="w-full text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >Connect →</button>
              )}
            </div>

            <div className="glow-border rounded-2xl bg-white/[0.02] p-5 border border-white/5 sm:col-span-2 lg:col-span-2">
              <EmbedCard instanceId={instanceId} t={t} />
            </div>
          </div>

          <QRCard instanceId={instanceId} t={t} />
        </div>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QRCard({ instanceId, t }: { instanceId: string; t: any }) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://openhelixai.com";
  const chatUrl = `${origin}/chat/${instanceId}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=7c3aed&bgcolor=111118&data=${encodeURIComponent(chatUrl)}`;

  function copyLink() {
    navigator.clipboard.writeText(chatUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    const a = document.createElement("a");
    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&color=7c3aed&bgcolor=111118&data=${encodeURIComponent(chatUrl)}&format=png`;
    a.download = `agent-qr-${instanceId}.png`;
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">{t("deploy.qrTitle")}</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{t("deploy.qrDesc")}</p>
      </div>
      <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 p-3 bg-[#111118] border border-white/10 rounded-xl">
          <img
            src={qrSrc}
            alt="QR code for agent chat"
            width={160}
            height={160}
            className="rounded-lg"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <p className="text-xs text-zinc-500 mb-2 font-mono break-all">{chatUrl}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("deploy.qrCopied") : t("deploy.qrCopyLink")}
            </button>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {t("deploy.qrDownload")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EmbedCard({ instanceId, t }: { instanceId: string; t: any }) {
  const [copied, setCopied] = useState<"link" | "iframe" | "script" | "api" | null>(null);
  const [tab, setTab] = useState<"link" | "embed" | "api">("link");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://openhelixai.com";

  useEffect(() => {
    if (tab === "api" && !apiKey && !apiKeysLoading) {
      setApiKeysLoading(true);
      fetch(`/api/instances/${instanceId}/keys`)
        .then((res) => res.json())
        .then((data) => {
          if (data.keys && data.keys.length > 0) {
            setApiKey(data.keys[0].preview + "...");
          }
        })
        .catch(() => {})
        .finally(() => setApiKeysLoading(false));
    }
  }, [tab, instanceId, apiKey, apiKeysLoading]);

  const directLink = `${origin}/widget-chat/${instanceId}`;
  const iframeSnippet = `<iframe\n  src="${origin}/widget-chat/${instanceId}"\n  width="420"\n  height="650"\n  style="border:none;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.4);"\n  allow="clipboard-write"\n  title="AI Assistant"\n></iframe>`;
  const scriptSnippet = `<script>\n  (function(){\n    var w=window,d=document;\n    var s=d.createElement('script');\n    s.src="${origin}/embed.js?id=${instanceId}";\n    s.async=true;\n    d.head.appendChild(s);\n  })();\n</script>`;
  const apiSnippet = `curl -X POST "${origin}/api/v1/chat" \\\n  -H "Content-Type: application/json" \\\n  -H "X-API-Key: ${apiKey || "your_api_key_here"}" \\\n  -d '{\n    "instanceId": "${instanceId}",\n    "message": "Hello!"\n  }'`;

  const handleCopy = (content: string, type: "link" | "iframe" | "script" | "api") => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">{t("deploy.embedTitle")}</h3>
        <p className="text-xs text-zinc-500 mt-0.5">{t("deploy.embedDesc")}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          {([
            { key: "link", label: "Direct Link" },
            { key: "embed", label: "Embed Code" },
            { key: "api", label: "API" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white border border-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "link" && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">Share this link with anyone to let them chat directly:</p>
            <div className="relative">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 font-mono overflow-x-auto">{directLink}</div>
              <button
                onClick={() => handleCopy(directLink, "link")}
                className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                {copied === "link" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied === "link" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {tab === "embed" && (
          <div className="space-y-3">
            <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">{scriptSnippet}</pre>
            <button
              onClick={() => handleCopy(scriptSnippet, "script")}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied === "script" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied === "script" ? "Copied!" : "Copy Code"}
            </button>
          </div>
        )}

        {tab === "api" && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">Use the API to integrate with your backend:</p>
            <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">{apiSnippet}</pre>
            <button
              onClick={() => handleCopy(apiSnippet, "api")}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied === "api" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied === "api" ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
