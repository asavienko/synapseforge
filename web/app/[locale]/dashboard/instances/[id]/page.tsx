"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Bot, ArrowLeft, Play, Square, Trash2, Loader2, X,
} from "lucide-react";
import { STATUS_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useInstanceData } from "./hooks/useInstanceData";
import { TABS } from "./types";
import { useAnalytics } from "@/components/AnalyticsProvider";
import { ProvisioningBanner } from "./components/ProvisioningBanner";
import { OverviewTab } from "./tabs/OverviewTab";
import { ChatTab } from "./tabs/ChatTab";
import { ConfigurationTab } from "./tabs/ConfigurationTab";
import { CredentialsTab } from "./tabs/CredentialsTab";
import { DeployTab } from "./tabs/DeployTab";
import { InfrastructureTab } from "./tabs/InfrastructureTab";
import { ActivityLogTab } from "./tabs/ActivityLogTab";
import { WebhookDeliveriesTab } from "./tabs/WebhookDeliveriesTab";
import { LogsTab } from "./tabs/LogsTab";
import { KnowledgeSuggestions } from "@/components/KnowledgeSuggestions";
import { ConversationInsights } from "@/components/ConversationInsights";

// Lazy load heavy components
import dynamic from "next/dynamic";
const KnowledgeBaseManager = dynamic(() => import("@/components/KnowledgeBaseManager").then(mod => ({ default: mod.KnowledgeBaseManager })));
const EmbedTab = dynamic(() => import("@/components/EmbedTab").then(mod => ({ default: mod.EmbedTab })));
const AnalyticsTab = dynamic(() => import("@/components/AnalyticsTab").then(mod => ({ default: mod.AnalyticsTab })));
const ApiKeysManager = dynamic(() => import("@/components/ApiKeysManager").then(mod => ({ default: mod.ApiKeysManager })));

export default function InstanceDetailPage() {
  const t = useTranslations("instanceDetail");
  const data = useInstanceData();
  const {
    id, instance, loading, saving, toast, setToast, gatewayError, setGatewayError,
    tab, setTab, config, setConfig, configDirty, setConfigDirty, savingConfig,
    credentials, credsLoading, usageData, usageLoading, logs, logsLoading, logFilter, setLogFilter,
    loadLogs, healthData, snapshotsData, infraLoading, isAdmin, resyncLoading, commands,
    restoreConfirmId, setRestoreConfirmId, restoreRequested, gatewayStatus, checkingGateway,
    currentVersionInfo, resyncConfig, toggleAutoUpdate, checkGatewayNow, requestRollback,
    chatMessages, setChatMessages, chatLoading, setChatLoading, chatNoCredentials, setChatNoCredentials,
    chatProvider, setChatProvider, showFirstRunBanner, setShowFirstRunBanner, chatHistoryLoaded,
    toggleStatus, deleteInstance, saveConfig, loadInstance, loadCredentials, loadRecentLogs, showToast,
    saveCredential, deleteCredential, requestSync, referralCode, referralLoading, pendingConfirm, setPendingConfirm,
    prevSandboxModeRef,
  } = data;

  const { track } = useAnalytics();

  // Track tab changes
  useEffect(() => {
    track("instance_tab_viewed", { instanceId: id, tab });
  }, [tab, id, track]);

  const [recentLogs, setRecentLogs] = useState<Array<{ id: string; event: string; details?: string; createdAt: string }>>([]);
  const [showGraduationModal, setShowGraduationModal] = useState(false);
  const [showQuickKeyModal, setShowQuickKeyModal] = useState(false);
  const [inlineKeyValue, setInlineKeyValue] = useState("");
  const [inlineKeyProvider, setInlineKeyProvider] = useState<"openai" | "anthropic" | "openrouter">("openai");
  const [inlineKeySaving, setInlineKeySaving] = useState(false);
  const [inlineKeyError, setInlineKeyError] = useState("");

  // Load recent logs for overview
  useEffect(() => {
    if (tab === "Overview") {
      loadRecentLogs().then(setRecentLogs);
      if (credentials.length === 0) loadCredentials();
    }
  }, [tab]);

  // Detect sandbox→real graduation
  useEffect(() => {
    if (!instance) return;
    const prev = prevSandboxModeRef.current;
    const curr = instance.sandboxMode ?? false;
    if (prev === true && curr === false) {
      setShowGraduationModal(true);
    }
    prevSandboxModeRef.current = curr;
  }, [instance?.sandboxMode]);

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
      setInlineKeyValue("");
      setShowQuickKeyModal(false);
      await loadInstance();
      loadCredentials();
    } else {
      const data = await res.json();
      setInlineKeyError(data.error ?? "Failed to save credential");
    }
    setInlineKeySaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 text-gray-500 dark:text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!instance) return null;

  const typeLabel = instance.type;

  return (
    <>
      <div className="pt-14 md:pt-0 p-4 md:p-8 max-w-4xl overflow-x-hidden">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border ${
            toast.type === "error" ? "bg-red-600/90 border-red-500 text-white" : "bg-emerald-600/90 border-emerald-500 text-white"
          }`}>{toast.text}</div>
        )}

        {/* Back */}
        <Link href="/dashboard/instances" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-500 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("backToInstances")}
        </Link>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 md:w-7 md:h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[180px] md:max-w-none">{instance.name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[instance.status]}`}>{instance.status}</span>
              {instance.healthStatus && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  instance.healthStatus === "healthy" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                  instance.healthStatus === "degraded" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                  "bg-red-500/15 text-red-400 border border-red-500/20"
                }`}>
                  {instance.healthStatus === "healthy" ? "● Healthy" : 
                   instance.healthStatus === "degraded" ? "● Degraded" : 
                   "● Down"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <p className="text-gray-500 dark:text-zinc-400">{typeLabel} · {instance.tier} {t("tierSuffix")}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(id);
                  showToast("Instance ID copied to clipboard");
                }}
                className="text-xs text-gray-500 dark:text-zinc-500 hover:text-blue-600 dark:text-blue-400 transition-colors font-mono bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded"
                title="Copy instance ID"
              >
                {id.slice(0, 8)}...{id.slice(-4)}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleStatus} disabled={saving}
              className={`flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                instance.status === "running" ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : instance.status === "running" ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden md:inline">{instance.status === "running" ? t("stop") : t("start")}</span>
            </button>
            <button onClick={deleteInstance} className="flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Provisioning progress banner */}
        {instance.provisionStatus === "provisioning" && (
          <ProvisioningBanner
            instance={instance}
            onDismiss={() => {}}
            onReady={() => {
              showToast("Agent is live!");
              loadInstance();
              setTimeout(() => setTab("Chat"), 1500);
            }}
            onFailed={() => loadInstance()}
          />
        )}

        {/* Gateway error banner */}
        {gatewayError && (
          <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-amber-300">
              <span className="font-semibold">{t("infrastructure.gateway.gatewayError")}:</span> {gatewayError}
            </div>
            <button onClick={() => setGatewayError(null)} className="text-amber-500 hover:text-amber-300 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="relative mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 border-b border-gray-200 dark:border-white/5 pb-px overflow-x-auto scrollbar-none tab-scroll-snap">
            {TABS.map((tabKey) => {
              const tabLabels: Record<string, string> = {
                "Overview": t("tabs.overview"),
                "Chat": t("chat.tab"),
                "Deploy": t("deploy.tab"),
                "Configuration": t("tabs.configuration"),
                "API Keys": t("tabs.apiKeys"),
                "Webhooks": t("tabs.webhooks"),
                "Activity Log": t("tabs.activityLog"),
                "Logs": "Logs",
                "Insights": t("insights.tab"),
                "Infrastructure": t("infrastructure.tab"),
                "Credentials": t("credentials.tab"),
                "Knowledge": t("knowledge.tab"),
                "Embed": "Embed",
                "Analytics": "Analytics",
              };
              return (
                <button key={tabKey} data-tab={tabKey} onClick={() => setTab(tabKey)}
                  className={cn("px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px shrink-0 whitespace-nowrap touch-target",
                    tab === tabKey ? "border-blue-500 text-white" : "border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:text-zinc-300"
                  )}>{tabLabels[tabKey]}
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white dark:from-[#0a0a0f] to-transparent sm:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white dark:from-[#0a0a0f] to-transparent sm:hidden" />
        </div>

        {/* Tab Content */}
        {tab === "Overview" && (
          <OverviewTab
            instance={instance}
            id={id}
            credentials={credentials}
            usageData={usageData}
            usageLoading={usageLoading}
            recentLogs={recentLogs}
            onGoToCredentials={() => { setTab("Credentials"); loadCredentials(); }}
            onGoToDeploy={() => setTab("Deploy")}
            onGoToActivity={() => setTab("Activity Log")}
            onGoToKnowledge={() => setTab("Knowledge")}
            showToast={showToast}
          />
        )}

        {tab === "Chat" && (
          <ChatTab
            instance={instance}
            id={id}
            credentials={credentials}
            config={config}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            chatLoading={chatLoading}
            setChatLoading={setChatLoading}
            chatNoCredentials={chatNoCredentials}
            setChatNoCredentials={setChatNoCredentials}
            chatProvider={chatProvider}
            setChatProvider={setChatProvider}
            showFirstRunBanner={showFirstRunBanner}
            setShowFirstRunBanner={setShowFirstRunBanner}
            showToast={showToast}
            toggleStatus={toggleStatus}
            saving={saving}
            loadInstance={loadInstance}
            onGoToCredentials={() => { setTab("Credentials"); loadCredentials(); }}
          />
        )}

        {tab === "Configuration" && (
          <ConfigurationTab
            instance={instance}
            id={id}
            config={config}
            setConfig={setConfig}
            configDirty={configDirty}
            setConfigDirty={setConfigDirty}
            savingConfig={savingConfig}
            saveConfig={saveConfig}
            showToast={showToast}
          />
        )}

        {tab === "Credentials" && (
          <CredentialsTab
            instance={instance}
            id={id}
            credentials={credentials}
            credsLoading={credsLoading}
            saveCredential={saveCredential}
            deleteCredential={deleteCredential}
            requestSync={requestSync}
            loadCredentials={loadCredentials}
            loadInstance={loadInstance}
            showToast={showToast}
          />
        )}

        {tab === "Deploy" && (
          <DeployTab
            instance={instance}
            instanceId={id}
            credentials={credentials}
            credsLoading={credsLoading}
            onGoToCredentials={() => { setTab("Credentials"); loadCredentials(); }}
          />
        )}

        {tab === "Knowledge" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <KnowledgeBaseManager instanceId={id} />
            </div>
            <div className="lg:col-span-1">
              <KnowledgeSuggestions instanceId={id} />
            </div>
          </div>
        )}

        {tab === "Infrastructure" && (
          <InfrastructureTab
            instance={instance}
            id={id}
            healthData={healthData}
            snapshotsData={snapshotsData}
            infraLoading={infraLoading}
            isAdmin={isAdmin}
            resyncLoading={resyncLoading}
            commands={commands}
            restoreConfirmId={restoreConfirmId}
            setRestoreConfirmId={setRestoreConfirmId}
            restoreRequested={restoreRequested}
            gatewayStatus={gatewayStatus}
            checkingGateway={checkingGateway}
            currentVersionInfo={currentVersionInfo}
            resyncConfig={resyncConfig}
            toggleAutoUpdate={toggleAutoUpdate}
            checkGatewayNow={checkGatewayNow}
            requestRollback={requestRollback}
            showToast={showToast}
          />
        )}

        {tab === "Activity Log" && (
          <ActivityLogTab
            logs={logs}
            logsLoading={logsLoading}
            logFilter={logFilter}
            setLogFilter={setLogFilter}
            loadLogs={loadLogs}
          />
        )}

        {tab === "Logs" && (
          <LogsTab
            instanceId={id}
            hasVps={!!instance.hasGateway}
          />
        )}

        {tab === "Insights" && <ConversationInsights instanceId={id} />}

        {tab === "Embed" && <EmbedTab instanceId={id} instanceName={instance.name} referralCode={referralCode} />}

        {tab === "Analytics" && <AnalyticsTab instanceId={id} />}

        {tab === "API Keys" && <ApiKeysManager instanceId={id} />}

        {tab === "Webhooks" && <WebhookDeliveriesTab instanceId={id} />}
      </div>

      {/* Generic Confirm Modal */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setPendingConfirm(null)}
        >
          <div className="bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <p className="text-sm text-gray-900 dark:text-white mb-6 leading-relaxed">{pendingConfirm.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setPendingConfirm(null)} className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-zinc-400 hover:text-white border border-gray-200 dark:border-white/10 hover:border-white/20 transition-colors">Cancel</button>
              <button onClick={() => { const fn = pendingConfirm.onConfirm; setPendingConfirm(null); fn(); }} className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Graduation Modal */}
      {showGraduationModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowGraduationModal(false)}
        >
          <div className="bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/10 rounded-2xl p-7 w-full max-w-lg">
            <div className="text-center mb-7">
              <div className="text-4xl mb-3">🚀</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your agent is live!</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">You&apos;re now running on your own API key — no message limits. Connect a channel so real customers can start talking to your agent.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button onClick={() => { setShowGraduationModal(false); setTab("Credentials"); }} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-white/[0.03] hover:bg-sky-600/10 border border-gray-200 dark:border-white/10 hover:border-sky-500/30 rounded-xl transition-all">
                <span className="text-2xl">✈️</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Telegram</span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-500">Live in ~5 min</span>
              </button>
              <button onClick={() => { setShowGraduationModal(false); setTab("Credentials"); }} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-white/[0.03] hover:bg-emerald-600/10 border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 rounded-xl transition-all">
                <span className="text-2xl">💬</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">WhatsApp</span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-500">Live in ~10 min</span>
              </button>
              <button onClick={() => { setShowGraduationModal(false); setTab("Deploy"); }} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-white/[0.03] hover:bg-blue-700/10 border border-gray-200 dark:border-white/10 hover:border-blue-500/30 rounded-xl transition-all">
                <span className="text-2xl">🌐</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Web Widget</span>
                <span className="text-[11px] text-gray-500 dark:text-zinc-500">Paste one snippet</span>
              </button>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 mb-0.5">Your agent&apos;s public URL</p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 font-mono truncate">/chat/{id}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/chat/${id}`)} className="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-300 bg-blue-600/10 hover:bg-blue-700/20 border border-blue-500/20 px-3 py-1.5 rounded-lg transition-colors">Copy link</button>
            </div>

            <button onClick={() => setShowGraduationModal(false)} className="w-full text-center text-xs text-gray-400 dark:text-zinc-600 hover:text-zinc-400 transition-colors py-1">I&apos;ll set up channels later</button>
          </div>
        </div>
      )}
    </>
  );
}

// Import AlertCircle for the gateway error banner
import { AlertCircle } from "lucide-react";
