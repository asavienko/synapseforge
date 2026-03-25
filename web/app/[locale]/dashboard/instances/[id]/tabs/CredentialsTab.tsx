"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Zap, Loader2, Check, X, Wifi, Trash, Eye, EyeOff, AlertCircle, Key } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { IntegrationCard } from "@/components/IntegrationCard";
import { WhatsAppWizard } from "@/components/WhatsAppWizard";
import { Tooltip, CREDENTIAL_HELP } from "@/components/Tooltip";
import { Instance, CredentialRow } from "../types";
import { LLM_CRED_KEYS, CREDENTIAL_KEY_LABELS } from "../types";

interface CredentialsTabProps {
  instance: Instance;
  id: string;
  credentials: CredentialRow[];
  credsLoading: boolean;
  saveCredential: (key: string, value: string) => Promise<boolean>;
  deleteCredential: (key: string) => void;
  requestSync: () => Promise<void>;
  loadCredentials: () => Promise<void>;
  loadInstance: () => Promise<void>;
  showToast: (text: string, type?: "success" | "error") => void;
}

export function CredentialsTab({
  instance,
  id,
  credentials,
  credsLoading,
  saveCredential,
  deleteCredential,
  requestSync,
  loadCredentials,
  loadInstance,
  showToast,
}: CredentialsTabProps) {
  const t = useTranslations("instanceDetail");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingCred, setSavingCred] = useState(false);
  const [validatingCred, setValidatingCred] = useState(false);
  const [credValidState, setCredValidState] = useState<Record<string, "valid" | "invalid">>({});
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addValue, setAddValue] = useState("");
  const [configPreviewText, setConfigPreviewText] = useState<string | null>(null);
  const [configPreviewLoading, setConfigPreviewLoading] = useState(false);
  const [syncRequesting, setSyncRequesting] = useState(false);
  const [revealedCreds, setRevealedCreds] = useState<Record<string, string>>({});
  const [revealingCred, setRevealingCred] = useState<string | null>(null);

  // Telegram setup state
  const [telegramTokenInput, setTelegramTokenInput] = useState("");
  const [telegramConnecting, setTelegramConnecting] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [telegramConnected, setTelegramConnected] = useState<{ username: string; name: string } | null>(null);

  // Discord setup state
  const [discordTokenInput, setDiscordTokenInput] = useState("");
  const [discordConnecting, setDiscordConnecting] = useState(false);
  const [discordError, setDiscordError] = useState<string | null>(null);
  const [discordInviteUrl, setDiscordInviteUrl] = useState<string | null>(null);
  const [discordConnected, setDiscordConnected] = useState<{ username: string; inviteUrl: string } | null>(null);

  // Slack setup state
  const [slackAppTokenInput, setSlackAppTokenInput] = useState("");
  const [slackBotTokenInput, setSlackBotTokenInput] = useState("");
  const [slackConnecting, setSlackConnecting] = useState(false);
  const [slackError, setSlackError] = useState<string | null>(null);
  const [slackConnected, setSlackConnected] = useState<{ botName: string; teamName: string } | null>(null);

  async function testAndSaveCredential(key: string, value: string) {
    if (!value.trim()) return;
    setValidatingCred(true);
    setCredValidState((p) => { const n = { ...p }; delete n[key]; return n; });

    const validateRes = await fetch(`/api/instances/${id}/credentials?validate=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    const validateData = await validateRes.json() as { valid: boolean; error?: string };

    if (!validateData.valid) {
      setCredValidState((p) => ({ ...p, [key]: "invalid" }));
      setValidatingCred(false);
      showToast(validateData.error ?? "API key validation failed", "error");
      return;
    }

    setCredValidState((p) => ({ ...p, [key]: "valid" }));
    setValidatingCred(false);
    await saveCredential(key, value);
    setEditingKey(null);
    setEditValue("");
    setAddingKey(null);
    setAddValue("");
  }

  async function handleSaveCredential(key: string, value: string) {
    setSavingCred(true);
    const success = await saveCredential(key, value);
    if (success) {
      setEditingKey(null);
      setEditValue("");
      setAddingKey(null);
      setAddValue("");
    }
    setSavingCred(false);
  }

  async function setupTelegram(token: string) {
    if (!token.trim()) return;
    setTelegramConnecting(true);
    setTelegramError(null);
    setTelegramConnected(null);

    const res = await fetch(`/api/instances/${id}/setup-telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim(), setWebhook: true }),
    });
    const data = await res.json() as { ok?: boolean; botUsername?: string; botName?: string; error?: string; webhookSet?: boolean; webhookUrl?: string };

    if (!res.ok || !data.ok) {
      setTelegramError(data.error ?? "Failed to connect Telegram");
    } else {
      setTelegramConnected({ username: data.botUsername ?? "", name: data.botName ?? "" });
      setTelegramTokenInput("");
      await loadCredentials();
      await loadInstance();
      showToast(`✅ ${data.botUsername} is live on Telegram!`);
    }
    setTelegramConnecting(false);
  }

  async function setupDiscord(token: string) {
    if (!token.trim()) return;
    setDiscordConnecting(true);
    setDiscordError(null);
    setDiscordConnected(null);
    const res = await fetch(`/api/instances/${id}/setup-discord`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim() }),
    });
    const data = await res.json() as { ok?: boolean; botUsername?: string; inviteUrl?: string; error?: string };
    if (!res.ok || !data.ok) {
      setDiscordError(data.error ?? "Failed to connect Discord");
    } else {
      const connected = { username: data.botUsername ?? "", inviteUrl: data.inviteUrl ?? "" };
      setDiscordConnected(connected);
      setDiscordInviteUrl(data.inviteUrl ?? null);
      setDiscordTokenInput("");
      await loadCredentials();
      await loadInstance();
      showToast(`Discord connected: ${data.botUsername}`);
    }
    setDiscordConnecting(false);
  }

  async function setupSlack(appToken: string, botToken: string) {
    if (!appToken.trim()) return;
    setSlackConnecting(true);
    setSlackError(null);
    setSlackConnected(null);
    const res = await fetch(`/api/instances/${id}/setup-slack`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appToken: appToken.trim(), botToken: botToken.trim() }),
    });
    const data = await res.json() as { ok?: boolean; botName?: string; teamName?: string; error?: string };
    if (!res.ok || !data.ok) {
      setSlackError(data.error ?? "Failed to connect Slack");
    } else {
      setSlackConnected({ botName: data.botName ?? "", teamName: data.teamName ?? "" });
      setSlackAppTokenInput("");
      setSlackBotTokenInput("");
      await loadCredentials();
      await loadInstance();
      showToast(`Slack connected: ${data.botName} in ${data.teamName}`);
    }
    setSlackConnecting(false);
  }

  async function handleRequestSync() {
    setSyncRequesting(true);
    await requestSync();
    setSyncRequesting(false);
  }

  async function loadConfigPreview() {
    setConfigPreviewLoading(true);
    const res = await fetch(`/api/instances/${id}/config-preview`);
    if (res.ok) {
      setConfigPreviewText(await res.text());
    } else {
      setConfigPreviewText("// Failed to load config preview");
    }
    setConfigPreviewLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* User-level Credential Vault section */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Your API Key Vault</h3>
              <p className="text-xs text-zinc-500">Global API keys available to all instances</p>
            </div>
          </div>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Manage in Settings →
          </Link>
        </div>
        <div className="p-4">
          <UserCredentialVaultPreview instanceId={id} />
        </div>
      </div>

      {/* Out of sync banner */}
      {instance.configSynced === false && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm text-amber-300 flex-1">{t("credentials.configOutOfSync")}</span>
          {instance.hasGateway && (
            <button
              onClick={handleRequestSync}
              disabled={syncRequesting}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              {syncRequesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
              {t("credentials.syncNow")}
            </button>
          )}
        </div>
      )}

      {/* Connected Channels Overview */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.connectedChannels")}</h3>
        </div>
        <div className="divide-y divide-white/5">
          {/* Telegram */}
          {(() => {
            const hasTelegram = credentials.some((c) => c.key === "telegram_bot_token");
            const tgUsername = instance.telegramBotUsername ?? (telegramConnected?.username ?? null);
            return (
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-base shrink-0">✈</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{t("credentials.telegram.header")}</div>
                  {hasTelegram && tgUsername ? (
                    <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {tgUsername} — {t("credentials.connected")}
                    </div>
                  ) : hasTelegram ? (
                    <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t("credentials.tokenSaved")}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 mt-0.5">{t("credentials.notConnected")}</div>
                  )}
                </div>
                {!hasTelegram && (
                  <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">{t("credentials.notSetUp")}</span>
                )}
                {hasTelegram && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">{t("credentials.live")}</span>
                )}
              </div>
            );
          })()}
          {/* Discord */}
          {(() => {
            const hasDiscord = credentials.some((c) => c.key === "discord_bot_token");
            return (
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-base shrink-0">🎮</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{t("credentials.discord.header")}</div>
                  {hasDiscord ? (
                    <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> {t("credentials.tokenSaved")}</div>
                  ) : (
                    <div className="text-xs text-zinc-500 mt-0.5">{t("credentials.notConnected")}</div>
                  )}
                </div>
                {hasDiscord ? (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">{t("credentials.live")}</span>
                ) : (
                  <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">{t("credentials.notSetUp")}</span>
                )}
              </div>
            );
          })()}
          {/* Slack */}
          {(() => {
            const hasSlack = credentials.some((c) => c.key === "slack_app_token" || c.key === "slack_bot_token");
            return (
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-base shrink-0">💬</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{t("credentials.slack.header")}</div>
                  {hasSlack ? (
                    <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> {t("credentials.tokenSaved")}</div>
                  ) : (
                    <div className="text-xs text-zinc-500 mt-0.5">{t("credentials.notConnected")}</div>
                  )}
                </div>
                {hasSlack ? (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">{t("credentials.live")}</span>
                ) : (
                  <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">{t("credentials.notSetUp")}</span>
                )}
              </div>
            );
          })()}
          {/* WhatsApp */}
          {(() => {
            const hasWhatsapp = credentials.some((c) => c.key === "twilio_account_sid");
            return (
              <div className="flex items-center gap-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shrink-0">💬</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{t("credentials.whatsapp.title")}</div>
                  {hasWhatsapp ? (
                    <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1"><Check className="w-3 h-3" /> {t("credentials.whatsapp.connected")}</div>
                  ) : (
                    <div className="text-xs text-zinc-500 mt-0.5">{t("credentials.notConnected")}</div>
                  )}
                </div>
                {hasWhatsapp ? (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">{t("credentials.connected")}</span>
                ) : (
                  <span className="text-xs text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">{t("credentials.notSetUp")}</span>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Config preview */}
      <div className="glow-border rounded-2xl bg-white/[0.02] p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-semibold text-white">{t("credentials.openclawConfig")}</span>
          </div>
          <button
            onClick={() => { if (!configPreviewText) loadConfigPreview(); else setConfigPreviewText(null); }}
            disabled={configPreviewLoading}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            {configPreviewLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
            {configPreviewText ? t("credentials.hideConfig") : t("credentials.viewConfig")}
          </button>
        </div>
        {configPreviewText && (
          <pre data-testid="config-preview" className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 overflow-x-auto max-h-64 font-mono">
            {configPreviewText}
          </pre>
        )}
      </div>

      {/* LLM Provider section */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.llmProvider")}</h3>
        </div>
        {credsLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
        ) : (
          <div className="divide-y divide-white/5">
            {["openai_api_key", "anthropic_api_key", "openrouter_api_key"].map((key) => {
              const existing = credentials.find((c) => c.key === key);
              const isEditing = editingKey === key;
              const isAdding = addingKey === key;
              const currentValue = isEditing ? editValue : addValue;
              const validState = credValidState[key];
              return (
                <div key={key} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-white">{CREDENTIAL_KEY_LABELS[key]}</div>
                        {CREDENTIAL_HELP[key] && (
                          <Tooltip content={CREDENTIAL_HELP[key]} />
                        )}
                      </div>
                      {existing && !isEditing && (
                        <div className="text-xs font-mono text-zinc-500 mt-0.5">
                          {revealedCreds[key] ? (
                            <span className="text-zinc-300">{revealedCreds[key]}</span>
                          ) : (
                            existing.maskedValue
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {existing && !isEditing && (
                        <>
                          <button
                            onClick={async () => {
                              if (revealedCreds[key]) {
                                setRevealedCreds((p) => { const n = { ...p }; delete n[key]; return n; });
                                return;
                              }
                              setRevealingCred(key);
                              try {
                                const res = await fetch(`/api/instances/${id}/credentials/${key}/reveal`);
                                if (res.ok) {
                                  const data = await res.json();
                                  setRevealedCreds((p) => ({ ...p, [key]: data.value }));
                                } else {
                                  showToast("Failed to reveal credential", "error");
                                }
                              } catch {
                                showToast("Failed to reveal credential", "error");
                              } finally {
                                setRevealingCred(null);
                              }
                            }}
                            disabled={revealingCred === key}
                            className="text-xs text-zinc-500 hover:text-zinc-300 bg-white/5 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            {revealingCred === key ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : revealedCreds[key] ? (
                              <><EyeOff className="w-3 h-3" /> Hide</>
                            ) : (
                              <><Eye className="w-3 h-3" /> Reveal</>
                            )}
                          </button>
                          <button
                            onClick={() => { setEditingKey(key); setEditValue(""); setCredValidState((p) => { const n = { ...p }; delete n[key]; return n; }); }}
                            className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            {t("credentials.editCredential")}
                          </button>
                          <button
                            onClick={() => deleteCredential(key)}
                            className="text-zinc-600 hover:text-red-400 transition-colors"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {!existing && !isAdding && (
                        <button
                          onClick={() => { setAddingKey(key); setAddValue(""); setCredValidState((p) => { const n = { ...p }; delete n[key]; return n; }); }}
                          className="text-xs text-zinc-500 hover:text-white bg-white/5 px-2 py-1 rounded-lg transition-colors"
                        >
                          {t("credentials.addCredential")}
                        </button>
                      )}
                    </div>
                  </div>
                  {(isEditing || isAdding) && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={currentValue}
                          onChange={(e) => {
                            isEditing ? setEditValue(e.target.value) : setAddValue(e.target.value);
                            if (validState) setCredValidState((p) => { const n = {...p}; delete n[key]; return n; });
                          }}
                          placeholder={t("credentials.valuePlaceholder")}
                          autoFocus
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                        />
                        <button
                          onClick={() => LLM_CRED_KEYS.includes(key)
                            ? testAndSaveCredential(key, currentValue)
                            : handleSaveCredential(key, currentValue)}
                          disabled={validatingCred || savingCred || !currentValue}
                          className={cn(
                            "flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40",
                            validState === "valid"
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                              : validState === "invalid"
                              ? "bg-red-600/80 hover:bg-red-500 text-white"
                              : "bg-violet-600 hover:bg-violet-500 text-white"
                          )}
                        >
                          {(validatingCred || savingCred) && <Loader2 className="w-3 h-3 animate-spin" />}
                          {!validatingCred && !savingCred && validState === "valid" && <Check className="w-3 h-3" />}
                          {!validatingCred && !savingCred && validState !== "valid" && <Check className="w-3 h-3" />}
                          {validatingCred ? t("credentials.testingCredential") : savingCred ? t("credentials.saving")
                            : LLM_CRED_KEYS.includes(key) ? t("credentials.testAndSave")
                            : t("credentials.saveCredential")}
                        </button>
                        <button
                          onClick={() => { setEditingKey(null); setAddingKey(null); setCredValidState((p) => { const n = {...p}; delete n[key]; return n; }); }}
                          className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {validState === "invalid" && (
                        <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                          {t("credentials.validationFailed")}
                        </p>
                      )}
                      {validState === "valid" && (
                        <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">
                          {t("credentials.validationSuccess")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Telegram Connect Card */}
      <TelegramConnectCard
        instance={instance}
        credentials={credentials}
        telegramTokenInput={telegramTokenInput}
        setTelegramTokenInput={setTelegramTokenInput}
        telegramConnecting={telegramConnecting}
        telegramError={telegramError}
        telegramConnected={telegramConnected}
        addingKey={addingKey}
        setAddingKey={setAddingKey}
        setupTelegram={setupTelegram}
        deleteCredential={deleteCredential}
        setTelegramConnected={setTelegramConnected}
        setTelegramError={setTelegramError}
        t={t}
      />

      {/* Discord Connect Card */}
      <DiscordConnectCard
        instance={instance}
        credentials={credentials}
        discordTokenInput={discordTokenInput}
        setDiscordTokenInput={setDiscordTokenInput}
        discordConnecting={discordConnecting}
        discordError={discordError}
        discordConnected={discordConnected}
        discordInviteUrl={discordInviteUrl}
        addingKey={addingKey}
        setAddingKey={setAddingKey}
        setupDiscord={setupDiscord}
        deleteCredential={deleteCredential}
        setDiscordConnected={setDiscordConnected}
        setDiscordInviteUrl={setDiscordInviteUrl}
        setDiscordError={setDiscordError}
        t={t}
      />

      {/* Slack Connect Card */}
      <SlackConnectCard
        instance={instance}
        credentials={credentials}
        slackAppTokenInput={slackAppTokenInput}
        setSlackAppTokenInput={setSlackAppTokenInput}
        slackBotTokenInput={slackBotTokenInput}
        setSlackBotTokenInput={setSlackBotTokenInput}
        slackConnecting={slackConnecting}
        slackError={slackError}
        slackConnected={slackConnected}
        addingKey={addingKey}
        setAddingKey={setAddingKey}
        setupSlack={setupSlack}
        deleteCredential={deleteCredential}
        setSlackConnected={setSlackConnected}
        setSlackError={setSlackError}
        t={t}
      />

      {/* WhatsApp via Twilio */}
      <WhatsAppWizard
        instanceId={id}
        initialCreds={credentials.some((c) => c.key === "twilio_account_sid")
          ? { accountSid: "••••••••", number: credentials.find((c) => c.key === "twilio_whatsapp_number")?.maskedValue ?? "••••••••" }
          : null}
      />

      {/* Integrations Section */}
      <IntegrationsSection
        id={id}
        credentials={credentials}
        saveCredential={saveCredential}
        t={t}
      />
    </div>
  );
}

// UserCredentialVaultPreview component
function UserCredentialVaultPreview({ instanceId }: { instanceId: string }) {
  const [credentials, setCredentials] = useState<Array<{ id: string; provider: string; lastFour: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCredentials();
  }, []);

  async function loadCredentials() {
    try {
      const res = await fetch("/api/user/credentials");
      if (!res.ok) throw new Error("Failed to load credentials");
      const data = await res.json();
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load user credentials:", err);
    } finally {
      setLoading(false);
    }
  }

  const PROVIDER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    openai: { label: "OpenAI", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    anthropic: { label: "Anthropic", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    openrouter: { label: "OpenRouter", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-zinc-400 mb-2">No global API keys stored</p>
        <p className="text-xs text-zinc-500">Add API keys in Settings to use them across all your instances</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {credentials.map((cred) => {
        const config = PROVIDER_CONFIG[cred.provider];
        return (
          <div
            key={cred.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl border",
              config.bg,
              config.border
            )}
          >
            <div className="flex items-center gap-3">
              <Key className={cn("w-4 h-4", config.color)} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{config.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    Global
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono">
                  ••••••••••••{cred.lastFour}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Available
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// TelegramConnectCard component
function TelegramConnectCard({
  instance,
  credentials,
  telegramTokenInput,
  setTelegramTokenInput,
  telegramConnecting,
  telegramError,
  telegramConnected,
  addingKey,
  setAddingKey,
  setupTelegram,
  deleteCredential,
  setTelegramConnected,
  setTelegramError,
  t,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const hasTelegram = credentials.some((c: CredentialRow) => c.key === "telegram_bot_token");
  const tgUsername = instance.telegramBotUsername ?? (telegramConnected?.username ?? null);

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.telegram.header")}</h3>
        {hasTelegram && (
          <button
            onClick={() => {
              deleteCredential("telegram_bot_token");
              setTelegramConnected(null);
              setTelegramError(null);
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {t("credentials.disconnect")}
          </button>
        )}
      </div>
      <div className="p-5">
        {hasTelegram ? (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xl shrink-0">✈</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">
                  {tgUsername || "Bot connected"}
                </span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{t("credentials.connected")}</span>
              </div>
              <p className="text-xs text-zinc-500">{t("credentials.telegram.live")}</p>
              <button
                onClick={() => {
                  setTelegramTokenInput("");
                  setTelegramError(null);
                  setTelegramConnected(null);
                  setAddingKey("telegram_bot_token");
                }}
                className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t("credentials.replaceToken")}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl shrink-0">✈</div>
              <div>
                <p className="text-sm font-medium text-white mb-0.5">{t("credentials.telegram.connect")}</p>
                <p className="text-xs text-zinc-500">
                  Create a bot via{" "}
                  <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">@BotFather</a>
                  , then paste the token here.
                </p>
              </div>
            </div>

            {addingKey === "telegram_bot_token" ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={telegramTokenInput}
                    onChange={(e) => { setTelegramTokenInput(e.target.value); setTelegramError(null); }}
                    placeholder="1234567890:AAFake_tokenHere..."
                    autoFocus
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                  />
                  <button
                    onClick={() => setupTelegram(telegramTokenInput)}
                    disabled={telegramConnecting || !telegramTokenInput.trim()}
                    className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    {telegramConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    {telegramConnecting ? t("credentials.connecting") : t("credentials.telegram.connectBtn")}
                  </button>
                  <button
                    onClick={() => { setAddingKey(null); setTelegramTokenInput(""); setTelegramError(null); }}
                    className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {telegramError && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{telegramError}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAddingKey("telegram_bot_token"); setTelegramError(null); setTelegramTokenInput(""); }}
                className="flex items-center gap-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                {t("credentials.telegram.connect")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// DiscordConnectCard component
function DiscordConnectCard({
  instance,
  credentials,
  discordTokenInput,
  setDiscordTokenInput,
  discordConnecting,
  discordError,
  discordConnected,
  discordInviteUrl,
  addingKey,
  setAddingKey,
  setupDiscord,
  deleteCredential,
  setDiscordConnected,
  setDiscordInviteUrl,
  setDiscordError,
  t,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const hasDiscord = credentials.some((c: CredentialRow) => c.key === "discord_bot_token");

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.discord.header")}</h3>
        {(hasDiscord || discordConnected) && (
          <button
            onClick={() => {
              deleteCredential("discord_bot_token");
              setDiscordConnected(null);
              setDiscordInviteUrl(null);
              setDiscordError(null);
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {t("credentials.disconnect")}
          </button>
        )}
      </div>
      <div className="p-5">
        {(hasDiscord || discordConnected) ? (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">🎮</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">
                  {instance.discordBotUsername ?? discordConnected?.username ?? "Bot connected"}
                </span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{t("credentials.connected")}</span>
              </div>
              <p className="text-xs text-zinc-500">{t("credentials.discord.live")}</p>
              {(discordConnected?.inviteUrl || discordInviteUrl) && (
                <a
                  href={discordConnected?.inviteUrl ?? discordInviteUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {t("credentials.discord.inviteToServer")}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl shrink-0">🎮</div>
              <div>
                <p className="text-sm font-medium text-white mb-0.5">{t("credentials.discord.connect")}</p>
                <p className="text-xs text-zinc-500">
                  1. Create a bot at{" "}
                  <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">discord.com/developers</a>{" "}
                  2. Copy the bot token
                </p>
              </div>
            </div>

            {addingKey === "discord_connect" ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={discordTokenInput}
                    onChange={(e) => { setDiscordTokenInput(e.target.value); setDiscordError(null); }}
                    placeholder={t("credentials.discord.botTokenPlaceholder")}
                    autoFocus
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                  <button
                    onClick={() => setupDiscord(discordTokenInput)}
                    disabled={discordConnecting || !discordTokenInput.trim()}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    {discordConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    {discordConnecting ? t("credentials.connecting") : t("credentials.discord.connectBtn")}
                  </button>
                  <button
                    onClick={() => { setAddingKey(null); setDiscordTokenInput(""); setDiscordError(null); }}
                    className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {discordError && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{discordError}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAddingKey("discord_connect"); setDiscordError(null); setDiscordTokenInput(""); }}
                className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                {t("credentials.discord.connect")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// SlackConnectCard component
function SlackConnectCard({
  instance,
  credentials,
  slackAppTokenInput,
  setSlackAppTokenInput,
  slackBotTokenInput,
  setSlackBotTokenInput,
  slackConnecting,
  slackError,
  slackConnected,
  addingKey,
  setAddingKey,
  setupSlack,
  deleteCredential,
  setSlackConnected,
  setSlackError,
  t,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const hasSlack = credentials.some((c: CredentialRow) => c.key === "slack_app_token" || c.key === "slack_bot_token");

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.slack.header")}</h3>
        {(hasSlack || slackConnected) && (
          <button
            onClick={async () => {
              await deleteCredential("slack_app_token");
              await deleteCredential("slack_bot_token");
              setSlackConnected(null);
              setSlackError(null);
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {t("credentials.disconnect")}
          </button>
        )}
      </div>
      <div className="p-5">
        {(hasSlack || slackConnected) ? (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-xl shrink-0">💬</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">
                  {(instance.slackBotName ?? slackConnected?.botName)
                    ? `@${instance.slackBotName ?? slackConnected?.botName}`
                    : "Bot connected"}
                  {(instance.slackTeamName ?? slackConnected?.teamName) && (
                    <span className="text-zinc-400 font-normal"> in {instance.slackTeamName ?? slackConnected?.teamName}</span>
                  )}
                </span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{t("credentials.connected")}</span>
              </div>
              <p className="text-xs text-zinc-500">{t("credentials.slack.live")}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-xl shrink-0">💬</div>
              <div>
                <p className="text-sm font-medium text-white mb-0.5">{t("credentials.slack.connect")}</p>
                <p className="text-xs text-zinc-500">{t("credentials.slack.instructions")}</p>
              </div>
            </div>

            {addingKey === "slack_connect" ? (
              <div className="space-y-2">
                <input
                  type="password"
                  value={slackAppTokenInput}
                  onChange={(e) => { setSlackAppTokenInput(e.target.value); setSlackError(null); }}
                  placeholder={t("credentials.slack.appTokenPlaceholder")}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors font-mono"
                />
                <input
                  type="password"
                  value={slackBotTokenInput}
                  onChange={(e) => { setSlackBotTokenInput(e.target.value); setSlackError(null); }}
                  placeholder={t("credentials.slack.botTokenPlaceholder")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition-colors font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setupSlack(slackAppTokenInput, slackBotTokenInput)}
                    disabled={slackConnecting || !slackAppTokenInput.trim()}
                    className="flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
                  >
                    {slackConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    {slackConnecting ? t("credentials.connecting") : t("credentials.slack.connectBtn")}
                  </button>
                  <button
                    onClick={() => { setAddingKey(null); setSlackAppTokenInput(""); setSlackBotTokenInput(""); setSlackError(null); }}
                    className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg border border-white/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {slackError && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{slackError}</p>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setAddingKey("slack_connect"); setSlackError(null); setSlackAppTokenInput(""); setSlackBotTokenInput(""); }}
                className="flex items-center gap-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 text-yellow-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <Zap className="w-4 h-4" />
                {t("credentials.slack.connect")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// IntegrationsSection component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IntegrationsSection({ id, credentials, saveCredential, t }: { id: string; credentials: CredentialRow[]; saveCredential: (key: string, value: string) => Promise<boolean>; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-xs text-zinc-500 uppercase tracking-wider">{t("credentials.integrations.title")}</h3>
        <p className="text-xs text-zinc-600 mt-0.5">{t("credentials.integrations.subtitle")}</p>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{t("credentials.integrations.webIntelligence")}</p>
        <IntegrationCard
          name="Tavily Search"
          icon="🔍"
          description={t("credentials.integrations.tavilyDesc")}
          docsUrl="https://tavily.com"
          credKey="tavily_api_key"
          placeholder="tvly-..."
          enabled={credentials.some((c) => c.key === "tavily_api_key")}
          instanceId={id}
          onSave={async (key, value) => { await saveCredential(key, value); }}
          toolName="web_search"
        />
        <IntegrationCard
          name="Brave Search"
          icon="🦁"
          description={t("credentials.integrations.braveDesc")}
          docsUrl="https://brave.com/search/api/"
          credKey="brave_api_key"
          placeholder={t("credentials.integrations.bravePlaceholder")}
          enabled={credentials.some((c) => c.key === "brave_api_key")}
          instanceId={id}
          onSave={async (key, value) => { await saveCredential(key, value); }}
          toolName="brave_search"
        />

        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider pt-2">{t("credentials.integrations.socialMedia")}</p>
        <IntegrationCard
          name="Facebook Page Token"
          icon="📘"
          description={t("credentials.integrations.facebookDesc")}
          docsUrl="https://developers.facebook.com/docs/pages/access-tokens"
          credKey="facebook_page_token"
          placeholder={t("credentials.integrations.facebookTokenPlaceholder")}
          enabled={credentials.some((c) => c.key === "facebook_page_token")}
          instanceId={id}
          onSave={async (key, value) => { await saveCredential(key, value); }}
          toolName="facebook_get_comments"
        />

        <IntegrationCard
          name="Firecrawl"
          icon="🔥"
          description="AI web scraping and crawling. Extract clean content from any URL for your AI agent."
          docsUrl="https://firecrawl.dev"
          credKey="firecrawl_api_key"
          placeholder="fc-..."
          enabled={credentials.some((c) => c.key === "firecrawl_api_key")}
          instanceId={id}
          onSave={async (key, value) => { await saveCredential(key, value); }}
          toolName="firecrawl_scrape"
        />
        <IntegrationCard
          name="CoinGecko"
          icon="🦎"
          description="Real-time cryptocurrency prices, market data, and coin information."
          docsUrl="https://coingecko.com/api/documentation"
          credKey="coingecko_api_key"
          placeholder="CG-..."
          enabled={credentials.some((c) => c.key === "coingecko_api_key")}
          instanceId={id}
          onSave={async (key, value) => { await saveCredential(key, value); }}
          toolName="crypto_price"
        />
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider pt-2">{t("credentials.integrations.businessTools")}</p>
        <IntegrationCard
          name="GitHub"
          icon="🐙"
          description={t("credentials.integrations.githubDesc")}
          docsUrl="https://github.com/settings/tokens"
          credKey="github_token"
          placeholder="ghp_..."
          enabled={credentials.some((c) => c.key === "github_token")}
          instanceId={id}
          onSave={async (key, value) => { await saveCredential(key, value); }}
          toolName="github_search_issues"
        />
      </div>
    </div>
  );
}
