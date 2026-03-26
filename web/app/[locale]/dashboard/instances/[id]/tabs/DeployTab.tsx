"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Download, MessageSquare, Loader2, Key } from "lucide-react";
import { useTranslations } from "next-intl";
import { Instance, CredentialRow } from "../types";

interface DeployTabProps {
  instance: Instance;
  instanceId: string;
  credentials: CredentialRow[];
  credsLoading: boolean;
  onGoToCredentials: () => void;
}

interface ChannelStatus {
  status: "connected" | "degraded" | "disconnected" | "bot_ready";
  health: "healthy" | "unhealthy";
  botUsername?: string;
  botId?: string;
  phoneNumber?: string;
  botName?: string;
  teamName?: string;
  error?: string;
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
  const hasDiscord = credKeys.includes("discord_bot_token");
  const hasSlack = credKeys.includes("slack_bot_token");
  const hasWidget = true;
  const hasAnyRealChannel = hasTelegram || hasWhatsApp || hasDiscord || hasSlack;
  const isLive = hasAnyRealChannel;

  // Live channel statuses
  const [telegramStatus, setTelegramStatus] = useState<ChannelStatus | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<ChannelStatus | null>(null);
  const [discordStatus, setDiscordStatus] = useState<ChannelStatus | null>(null);
  const [slackStatus, setSlackStatus] = useState<ChannelStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch channel statuses
  useEffect(() => {
    async function fetchStatuses() {
      setStatusLoading(true);
      const promises = [];
      
      if (hasTelegram) {
        promises.push(
          fetch(`/api/instances/${instanceId}/telegram/status`)
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setTelegramStatus(data))
            .catch(() => {})
        );
      }
      
      if (hasWhatsApp) {
        promises.push(
          fetch(`/api/instances/${instanceId}/whatsapp/status`)
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setWhatsappStatus(data))
            .catch(() => {})
        );
      }
      
      if (hasDiscord) {
        promises.push(
          fetch(`/api/instances/${instanceId}/discord/status`)
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setDiscordStatus(data))
            .catch(() => {})
        );
      }

      if (hasSlack) {
        promises.push(
          fetch(`/api/instances/${instanceId}/slack/status`)
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setSlackStatus(data))
            .catch(() => {})
        );
      }
      
      await Promise.all(promises);
      setStatusLoading(false);
    }
    
    if (hasAnyRealChannel) {
      fetchStatuses();
      // Poll every 30s
      const interval = setInterval(fetchStatuses, 30000);
      return () => clearInterval(interval);
    }
  }, [instanceId, hasTelegram, hasWhatsApp, hasDiscord, hasSlack, hasAnyRealChannel]);

  const activeChannels = [
    hasTelegram && t("deploy.channelTelegram"),
    hasWhatsApp && t("deploy.channelWhatsApp"),
    hasDiscord && "Discord",
    hasSlack && "Slack",
    hasWidget && t("deploy.channelWidget"),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {/* Quick-connect banner */}
      {hasLLM && !hasAnyRealChannel && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-emerald-300 mb-1">✅ Your AI is ready — now connect a channel</p>
            <p className="text-xs text-gray-500 dark:text-zinc-500">Add a Telegram bot token or embed the web widget to start handling real customer conversations.</p>
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
          <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center shrink-0">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Go live in 3 steps</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{t("deploy.tgConnectDesc")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-100 dark:bg-zinc-800/30 border border-gray-200 dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t("deploy.tgSetupTitle")}</h3>
                  <ul className="space-y-1.5 text-sm text-gray-500 dark:text-zinc-400">
                    <li>{t("deploy.tgStep1a")} <span className="text-sky-400">@BotFather</span></li>
                    <li>Send: <code className="text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">/newbot</code></li>
                    <li>{t("deploy.tgStep1b")}</li>
                    <li>{t("deploy.tgStep1c")}</li>
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">{t("deploy.tgStep1hint")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-100 dark:bg-zinc-800/30 border border-gray-200 dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t("deploy.tgStep2Title")}</h3>
                  <button
                    onClick={onGoToCredentials}
                    disabled={credsLoading}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-colors text-white rounded-lg"
                  >
                    {t("deploy.tgAddBtn")}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">✓</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-1">{t("deploy.tgDoneTitle")}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{t("deploy.tgDoneDesc")}</p>
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
              <h2 className="text-sm font-semibold text-emerald-300">{t("deploy.agentLive")}</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">{t("deploy.connectedTo")} {activeChannels.filter(ch => ch !== t("deploy.channelWidget")).join(", ")}</p>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {t("deploy.liveStatus")}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Telegram Card */}
            <div className={`glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-5 border ${hasTelegram ? (telegramStatus?.health === "healthy" ? "border-emerald-500/30" : "border-amber-500/30") : "border-gray-200 dark:border-white/5"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${hasTelegram ? "bg-sky-600/20 border border-sky-500/30" : "bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5"}`}>✈️</div>
                <div>
                  <h3 className={`text-sm font-semibold ${hasTelegram ? "text-white" : "text-gray-500 dark:text-zinc-500"}`}>Telegram</h3>
                </div>
                {hasTelegram && (
                  <div className="ml-auto">
                    {statusLoading && !telegramStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-zinc-500" />
                    ) : telegramStatus?.health === "healthy" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{t("deploy.activeStatus")}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Issue</span>
                    )}
                  </div>
                )}
              </div>
              {hasTelegram ? (
                <div>
                  {telegramStatus ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {telegramStatus.status === "connected" ? "Bot connected and webhook active" : 
                         telegramStatus.status === "bot_ready" ? "Bot valid — webhook pending" : 
                         "Connection issue"}
                      </p>
                      {telegramStatus.botUsername && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">@{telegramStatus.botUsername}</p>
                      )}
                      {telegramStatus.error && (
                        <p className="text-xs text-amber-400 mt-2">{telegramStatus.error}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-500">Checking status...</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoToCredentials}
                  className="w-full text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >{t("deploy.connectBtn")}</button>
              )}
            </div>

            {/* WhatsApp Card */}
            <div className={`glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-5 border ${hasWhatsApp ? (whatsappStatus?.health === "healthy" ? "border-emerald-500/30" : "border-amber-500/30") : "border-gray-200 dark:border-white/5"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${hasWhatsApp ? "bg-emerald-600/20 border border-emerald-500/30" : "bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5"}`}>💬</div>
                <div>
                  <h3 className={`text-sm font-semibold ${hasWhatsApp ? "text-white" : "text-gray-500 dark:text-zinc-500"}`}>WhatsApp</h3>
                </div>
                {hasWhatsApp && (
                  <div className="ml-auto">
                    {statusLoading && !whatsappStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-zinc-500" />
                    ) : whatsappStatus?.health === "healthy" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{t("deploy.activeStatus")}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Issue</span>
                    )}
                  </div>
                )}
              </div>
              {hasWhatsApp ? (
                <div>
                  {whatsappStatus ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {whatsappStatus.status === "connected" ? "Connected" : 
                         whatsappStatus.status === "degraded" ? "Connection issue" : 
                         "Disconnected"}
                      </p>
                      {whatsappStatus.phoneNumber && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{whatsappStatus.phoneNumber}</p>
                      )}
                      {whatsappStatus.error && (
                        <p className="text-xs text-amber-400 mt-2">{whatsappStatus.error}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-500">Checking status...</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoToCredentials}
                  className="w-full text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >{t("deploy.connectBtn")}</button>
              )}
            </div>

            {/* Discord Card */}
            <div className={`glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-5 border ${hasDiscord ? (discordStatus?.health === "healthy" ? "border-emerald-500/30" : "border-amber-500/30") : "border-gray-200 dark:border-white/5"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${hasDiscord ? "bg-indigo-600/20 border border-indigo-500/30" : "bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5"}`}>🎮</div>
                <div>
                  <h3 className={`text-sm font-semibold ${hasDiscord ? "text-white" : "text-gray-500 dark:text-zinc-500"}`}>Discord</h3>
                </div>
                {hasDiscord && (
                  <div className="ml-auto">
                    {statusLoading && !discordStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-zinc-500" />
                    ) : discordStatus?.health === "healthy" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{t("deploy.activeStatus")}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Issue</span>
                    )}
                  </div>
                )}
              </div>
              {hasDiscord ? (
                <div>
                  {discordStatus ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {discordStatus.status === "connected" ? "Bot connected" : 
                         "Connection issue"}
                      </p>
                      {discordStatus.botUsername && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">@{discordStatus.botUsername}</p>
                      )}
                      {discordStatus.error && (
                        <p className="text-xs text-amber-400 mt-2">{discordStatus.error}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-500">Checking status...</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoToCredentials}
                  className="w-full text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >{t("deploy.connectBtn")}</button>
              )}
            </div>

            {/* Slack Card */}
            <div className={`glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-5 border ${hasSlack ? (slackStatus?.health === "healthy" ? "border-emerald-500/30" : "border-amber-500/30") : "border-gray-200 dark:border-white/5"}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${hasSlack ? "bg-purple-600/20 border border-purple-500/30" : "bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-white/5"}`}>💼</div>
                <div>
                  <h3 className={`text-sm font-semibold ${hasSlack ? "text-white" : "text-gray-500 dark:text-zinc-500"}`}>Slack</h3>
                </div>
                {hasSlack && (
                  <div className="ml-auto">
                    {statusLoading && !slackStatus ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-zinc-500" />
                    ) : slackStatus?.health === "healthy" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{t("deploy.activeStatus")}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">Issue</span>
                    )}
                  </div>
                )}
              </div>
              {hasSlack ? (
                <div>
                  {slackStatus ? (
                    <>
                      <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {slackStatus.status === "connected" ? "Bot connected" : 
                         "Connection issue"}
                      </p>
                      {slackStatus.botName && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{slackStatus.botName}</p>
                      )}
                      {slackStatus.teamName && (
                        <p className="text-xs text-gray-400 dark:text-zinc-600 mt-0.5">{slackStatus.teamName}</p>
                      )}
                      {slackStatus.error && (
                        <p className="text-xs text-amber-400 mt-2">{slackStatus.error}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-500">Checking status...</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={onGoToCredentials}
                  className="w-full text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                >{t("deploy.connectBtn")}</button>
              )}
            </div>

            {/* Widget Card - spans remaining columns */}
            <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-5 border border-gray-200 dark:border-white/5 sm:col-span-2 lg:col-span-1">
              <EmbedCard instanceId={instanceId} t={t} />
            </div>
          </div>

          <QRCard instanceId={instanceId} t={t} />
        </div>
      )}
    </div>
  );
}

function QRCard({ instanceId, t }: { instanceId: string; t: ReturnType<typeof useTranslations> }) {
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
    <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("deploy.qrTitle")}</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{t("deploy.qrDesc")}</p>
      </div>
      <div className="p-5 flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 p-3 bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-xl">
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
          <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2 font-mono break-all">{chatUrl}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-zinc-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t("deploy.qrCopied") : t("deploy.qrCopyLink")}
            </button>
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-700/30 border border-blue-500/30 text-blue-600 dark:text-blue-300 transition-colors"
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

function EmbedCard({ instanceId, t }: { instanceId: string; t: ReturnType<typeof useTranslations> }) {
  const [copied, setCopied] = useState<"link" | "iframe" | "script" | "api" | null>(null);
  const [tab, setTab] = useState<"link" | "embed" | "api">("link");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "https://openhelixai.com";

  const loadApiKeys = useCallback(async () => {
    setApiKeysLoading(true);
    try {
      const res = await fetch(`/api/instances/${instanceId}/keys`);
      const data = await res.json();
      if (data.keys && data.keys.length > 0) {
        setApiKey(data.keys[0].preview + "...");
      }
    } catch {}
    setApiKeysLoading(false);
  }, [instanceId]);

  useEffect(() => {
    if (tab === "api" && !apiKey && !apiKeysLoading) {
      loadApiKeys();
    }
  }, [tab, apiKey, apiKeysLoading, loadApiKeys]);

  async function generateApiKey() {
    setGeneratingKey(true);
    try {
      const res = await fetch(`/api/instances/${instanceId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Default API Key" }),
      });
      const data = await res.json();
      if (data.key) {
        setApiKey(data.key.preview + "...");
      }
    } catch {}
    setGeneratingKey(false);
  }

  const directLink = `${origin}/widget-chat/${instanceId}`;
  const scriptSnippet = `<script>\n  (function(){\n    var w=window,d=document;\n    var s=d.createElement('script');\n    s.src="${origin}/embed.js?id=${instanceId}";\n    s.async=true;\n    d.head.appendChild(s);\n  })();\n</script>`;
  const apiSnippet = `curl -X POST "${origin}/api/v1/chat" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${apiKey || "your_api_key_here"}" \\\n  -d '{\n    "message": "Hello!"\n  }'`;

  const handleCopy = (content: string, type: "link" | "iframe" | "script" | "api") => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-white/5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("deploy.embedTitle")}</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{t("deploy.embedDesc")}</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          {([
            { key: "link", label: t("deploy.embedTabLink") },
            { key: "embed", label: t("deploy.embedTabEmbed") },
            { key: "api", label: t("deploy.embedTabApi") },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-zinc-400 hover:text-white border border-gray-200 dark:border-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "link" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-zinc-400">{t("deploy.embedLinkDesc")}</p>
            <div className="relative">
              <div className="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-xs text-gray-700 dark:text-zinc-300 font-mono overflow-x-auto">{directLink}</div>
              <button
                onClick={() => handleCopy(directLink, "link")}
                className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                {copied === "link" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied === "link" ? t("deploy.copied") : t("deploy.copy")}
              </button>
            </div>
          </div>
        )}

        {tab === "embed" && (
          <div className="space-y-3">
            <pre className="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-xs text-gray-700 dark:text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">{scriptSnippet}</pre>
            <button
              onClick={() => handleCopy(scriptSnippet, "script")}
              className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              {copied === "script" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied === "script" ? t("deploy.copied") : t("deploy.copyCode")}
            </button>
          </div>
        )}

        {tab === "api" && (
          <div className="space-y-3">
            {!apiKey && !apiKeysLoading && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400 mb-3">No API key found. Generate one to start using the API.</p>
                <button
                  onClick={generateApiKey}
                  disabled={generatingKey}
                  className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-600 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {generatingKey ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Key className="w-3.5 h-3.5" />
                  )}
                  {generatingKey ? "Generating..." : "Generate API Key"}
                </button>
              </div>
            )}
            {apiKeysLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading API keys...
              </div>
            )}
            {apiKey && (
              <>
                <p className="text-xs text-gray-500 dark:text-zinc-400">{t("deploy.embedApiDesc")}</p>
                <pre className="bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-xs text-gray-700 dark:text-zinc-300 font-mono overflow-x-auto whitespace-pre leading-relaxed">{apiSnippet}</pre>
                <button
                  onClick={() => handleCopy(apiSnippet, "api")}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  {copied === "api" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied === "api" ? t("deploy.copied") : t("deploy.copy")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Widget Customization */}
      <WidgetCustomizer instanceId={instanceId} t={t} />
    </div>
  );
}

// Widget Customization Component
function WidgetCustomizer({ instanceId, t }: { instanceId: string; t: (key: string) => string }) {
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [greeting, setGreeting] = useState(() => t("greetingDefault"));
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://openhelixai.com";

  const customScript = `<script>
  window.OpenHelix = {
    color: "${primaryColor}",
    position: "${position}",
    greeting: "${greeting}"
  };
</script>
<script src="${origin}/embed.js?id=${instanceId}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 p-5 border-t border-gray-200 dark:border-white/5">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Customize Widget</h4>

      <div className="space-y-4">
        {/* Primary Color */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-500 dark:text-zinc-400 w-24">Color:</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer bg-transparent"
            />
            <span className="text-xs text-gray-500 dark:text-zinc-500 font-mono">{primaryColor}</span>
          </div>
        </div>

        {/* Position */}
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-500 dark:text-zinc-400 w-24">Position:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPosition("bottom-right")}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                position === "bottom-right"
                  ? "bg-blue-600/20 border-blue-500/30 text-blue-600 dark:text-blue-300"
                  : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-zinc-400 hover:text-white"
              }`}
            >
              Bottom Right
            </button>
            <button
              onClick={() => setPosition("bottom-left")}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                position === "bottom-left"
                  ? "bg-blue-600/20 border-blue-500/30 text-blue-600 dark:text-blue-300"
                  : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-zinc-400 hover:text-white"
              }`}
            >
              Bottom Left
            </button>
          </div>
        </div>

        {/* Greeting */}
        <div className="flex items-start gap-4">
          <label className="text-sm text-gray-500 dark:text-zinc-400 w-24 pt-2">{t("greetingLabel")}</label>
          <input
            type="text"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter greeting message..."
          />
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-zinc-500 mb-2">Custom embed code:</p>
          <pre className="text-xs text-gray-700 dark:text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap break-all">{customScript}</pre>
          <button
            onClick={handleCopy}
            className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 hover:text-white bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? t("deploy.copied") : t("deploy.copyCode")}
          </button>
        </div>

        {/* Visual Preview */}
        <div className="mt-4 p-4 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-zinc-500 mb-3">Visual Preview:</p>
          <div className="relative h-48 bg-gray-100 dark:bg-zinc-800/50 rounded-lg overflow-hidden">
            {/* Mock website background */}
            <div className="absolute inset-0 p-4">
              <div className="w-2/3 h-4 bg-gray-200 dark:bg-zinc-700/50 rounded mb-2" />
              <div className="w-1/2 h-4 bg-gray-200 dark:bg-zinc-700/50 rounded mb-4" />
              <div className="w-full h-20 bg-gray-200 dark:bg-zinc-700/30 rounded" />
            </div>
            {/* Widget preview */}
            <div 
              className={`absolute ${position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4`}
            >
              {/* Chat bubble */}
              <div 
                className="mb-2 p-3 rounded-lg shadow-lg max-w-[200px]"
                style={{ backgroundColor: primaryColor }}
              >
                <p className="text-white text-xs">{greeting}</p>
              </div>
              {/* Widget button */}
              <div 
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
