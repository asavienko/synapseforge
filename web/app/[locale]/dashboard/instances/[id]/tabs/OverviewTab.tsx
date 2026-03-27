"use client";

import { useState } from "react";
import { Bot, Key, Zap, Activity, MessageSquare, AlertCircle, Send, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { SANDBOX_LIMIT } from "@/lib/sandbox";
import { AnalyticsSummary } from "@/components/AnalyticsSummary";
import { Instance, CredentialRow, UsageData, LogRow, Config } from "../types";
import { SetupChecklistCard } from "../components/SetupChecklistCard";

interface OverviewTabProps {
  instance: Instance;
  id: string;
  credentials: CredentialRow[];
  usageData: UsageData | null;
  usageLoading: boolean;
  recentLogs: LogRow[];
  onGoToCredentials: () => void;
  onGoToDeploy: () => void;
  onGoToActivity?: () => void;
  onGoToKnowledge?: () => void;
  showToast: (text: string, type?: "success" | "error") => void;
}

export function OverviewTab({
  instance,
  id,
  credentials,
  usageData,
  usageLoading,
  recentLogs,
  onGoToCredentials,
  onGoToDeploy,
  onGoToActivity,
  onGoToKnowledge,
}: OverviewTabProps) {
  const t = useTranslations("instanceDetail");
  const typeLabel = instance.type;

  const [overviewTestInput, setOverviewTestInput] = useState("");
  const [overviewTestSending, setOverviewTestSending] = useState(false);
  const [overviewTestResponse, setOverviewTestResponse] = useState<{ text: string; latencyMs?: number } | null>(null);
  const [overviewTestError, setOverviewTestError] = useState<string | null>(null);

  async function sendOverviewTestMessage() {
    if (!overviewTestInput.trim()) return;
    setOverviewTestSending(true);
    setOverviewTestResponse(null);
    setOverviewTestError(null);
    const res = await fetch(`/api/instances/${id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: overviewTestInput.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setOverviewTestError(data.error ?? "Something went wrong");
    } else {
      const text = data.response ?? data.text ?? data.message ?? data.content ?? JSON.stringify(data);
      setOverviewTestResponse({ text, latencyMs: data.latencyMs });
    }
    setOverviewTestSending(false);
  }

  const credKeys = credentials.map((c) => c.key);
  const hasLLMKey = credKeys.some((k) => ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(k));
  const hasChannel = credKeys.some((k) => ["telegram_bot_token", "discord_bot_token", "slack_app_token", "slack_bot_token"].includes(k));
  const isDeployed = !!(instance.hasGateway && instance.provisionStatus === "ready");
  const isSetupComplete = hasLLMKey && hasChannel && isDeployed;

  return (
    <div className="space-y-4">
      <SetupChecklistCard
        instance={instance}
        credentials={credentials}
        onGoToCredentials={onGoToCredentials}
        onGoToKnowledge={onGoToKnowledge}
        instanceId={id}
      />

      {/* Contextual next-step CTA */}
      {(() => {
        if (isSetupComplete) {
          return (
            <Link href={`/dashboard/instances/${id}/share`}
              className="flex items-center justify-center gap-3 w-full bg-emerald-600 hover:bg-emerald-500 transition-colors text-gray-900 dark:text-white font-semibold text-sm px-5 py-3.5 rounded-xl">
              <Share2 className="w-4 h-4" />
              {t("overview.shareAgent")}
            </Link>
          );
        }

        if (!hasLLMKey) {
          return (
            <button onClick={onGoToCredentials}
              className="flex items-center justify-center gap-3 w-full bg-blue-600/20 hover:bg-blue-700/30 border border-blue-500/30 transition-colors text-blue-600 dark:text-blue-300 font-semibold text-sm px-5 py-3.5 rounded-xl">
              <Key className="w-4 h-4" />
              {t("overview.step1")}
            </button>
          );
        }

        if (!isDeployed) {
          return (
            <button onClick={onGoToDeploy}
              className="glass-btn-primary flex items-center justify-center gap-3 w-full font-semibold text-sm px-5 py-3.5 rounded-xl text-white">
              <Zap className="w-4 h-4" />
              {t("overview.step2")}
            </button>
          );
        }

        if (!hasChannel) {
          return (
            <button onClick={onGoToCredentials}
              className="flex items-center justify-center gap-3 w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-colors text-amber-300 font-semibold text-sm px-5 py-3.5 rounded-xl">
              <MessageSquare className="w-4 h-4" />
              {t("overview.step3")}
            </button>
          );
        }

        return null;
      })()}

      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] divide-y divide-gray-200 dark:divide-white/5">
        {instance.description && (
          <div className="p-5">
            <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">{t("overview.description")}</div>
            <p className="text-gray-700 dark:text-zinc-300 text-sm">{instance.description}</p>
          </div>
        )}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: t("overview.created"), value: formatDate(instance.createdAt) },
            { label: t("overview.lastUpdated"), value: formatDate(instance.updatedAt) },
            { label: t("overview.type"), value: typeLabel },
            { label: t("overview.tier"), value: instance.tier.charAt(0).toUpperCase() + instance.tier.slice(1) },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{f.label}</div>
              <div className="text-sm text-gray-700 dark:text-zinc-300">{f.value}</div>
            </div>
          ))}
        </div>
        {instance.config && (() => {
          try {
            const c = JSON.parse(instance.config);
            return (
              <div className="p-5">
                <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3">{t("overview.activeConfiguration")}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {c.agentTemplateName && (
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="text-gray-500 dark:text-zinc-500">{t("overview.configTemplate")}</span>
                      <span className="text-blue-600 dark:text-blue-300 font-medium ml-2">{c.agentTemplateName}</span>
                    </div>
                  )}
                  <div><span className="text-gray-500 dark:text-zinc-500">{t("overview.configModel")}</span> <span className="text-gray-700 dark:text-zinc-200 ml-2">{c.model ?? "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-zinc-500">{t("overview.configTemp")}</span> <span className="text-gray-700 dark:text-zinc-200 ml-2">{c.temperature ?? "—"}</span></div>
                  <div><span className="text-gray-500 dark:text-zinc-500">{t("overview.configMaxTokens")}</span> <span className="text-gray-700 dark:text-zinc-200 ml-2">{c.maxTokens ?? "—"}</span></div>
                </div>
              </div>
            );
          } catch { return null; }
        })()}
      </div>

      {/* Sandbox status widget */}
      {instance.sandboxMode && (() => {
        const used = instance.sandboxUsed ?? 0;
        const exhausted = used >= SANDBOX_LIMIT;
        const pct = Math.min(100, (used / SANDBOX_LIMIT) * 100);
        return (
          <div className={`p-4 rounded-xl border ${exhausted ? "bg-amber-500/5 border-amber-500/30" : "bg-blue-500/5 border-blue-500/15"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${exhausted ? "text-amber-300" : "text-blue-600 dark:text-blue-300"}`}>
                {exhausted ? "⚠️ Free messages used up" : t("overview.sandboxMode")}
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-500">
                {used}/{SANDBOX_LIMIT} {t("overview.messagesUsed")}
              </span>
            </div>
            <div className="h-1.5 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${exhausted ? "bg-amber-500" : "bg-blue-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {exhausted ? (
              <div className="mt-3 flex items-center gap-3">
                <p className="text-xs text-amber-400/80 flex-1">{t("overview.sandboxExhaustedHint")}</p>
                <button
                  onClick={onGoToCredentials}
                  className="shrink-0 text-xs font-semibold text-gray-900 dark:text-white bg-blue-600 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {t("overview.addApiKey")}
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-zinc-600 mt-2">{t("overview.sandboxHint")}</p>
            )}
          </div>
        );
      })()}

      {/* Usage Stats Panel */}
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden" data-testid="usage-panel">
        <div className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("usage.title")}</h3>
          </div>
          {usageLoading && <Loader2 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-600 animate-spin" />}
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.allTime")}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{usageData?.totalMessages ?? "—"}</div>
              <div className="text-xs text-gray-400 dark:text-zinc-600">{t("usage.messages")}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.thisMonth")}</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usageData?.messagesThisMonth ?? "—"}</div>
              <div className="text-xs text-gray-400 dark:text-zinc-600">{t("usage.messages")}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.today")}</div>
              <div className="text-2xl font-bold text-emerald-400">{usageData?.todayMessages ?? "—"}</div>
              <div className="text-xs text-gray-400 dark:text-zinc-600">{t("usage.messages")}</div>
            </div>
          </div>

          {usageData && usageData.totalTokens > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-gray-200 dark:border-white/5">
              <div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.tokensAllTime")}</div>
                <div className="text-lg font-bold text-sky-400">
                  {usageData.totalTokens.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-600">
                  {usageData.totalInputTokens.toLocaleString()} in · {usageData.totalOutputTokens.toLocaleString()} out
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.estCostThisMonth")}</div>
                <div className="text-lg font-bold text-amber-400">
                  ${usageData.estimatedCostUsdThisMonth.toFixed(4)}
                </div>
                <div className="text-xs text-gray-400 dark:text-zinc-600">
                  {usageData.monthTokens.toLocaleString()} tokens · ~${usageData.estimatedCostUsd.toFixed(2)} all time
                </div>
              </div>
            </div>
          )}

          {usageData && (usageData.topModel || usageData.avgLatencyMs !== null) && (
            <div className="flex gap-5 pt-1 border-t border-gray-200 dark:border-white/5">
              {usageData.topModel && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.topModel")}</div>
                  <div className="text-sm font-mono text-gray-700 dark:text-zinc-200">{usageData.topModel}</div>
                </div>
              )}
              {usageData.avgLatencyMs !== null && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.avgLatency")}</div>
                  <div className="text-sm font-mono text-gray-700 dark:text-zinc-200">{usageData.avgLatencyMs}ms</div>
                </div>
              )}
              {usageData.sourceCounts && (
                <div className="ml-auto text-right">
                  <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1">{t("usage.sources")}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-0.5">
                    {usageData.sourceCounts.dashboard > 0 && (
                      <div>{t("usage.dashboardSource")}: {usageData.sourceCounts.dashboard}</div>
                    )}
                    {((usageData.sourceCounts.api ?? 0) + (usageData.sourceCounts["api/openai-compat"] ?? 0)) > 0 && (
                      <div>{t("usage.apiSource")}: {(usageData.sourceCounts.api ?? 0) + (usageData.sourceCounts["api/openai-compat"] ?? 0)}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {usageData && usageData.daily.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-3">{t("usage.last14Days")}</div>
              {(() => {
                const maxCount = Math.max(...usageData.daily.map((d) => d.count), 1);
                return (
                  <div className="flex items-end gap-1 h-16">
                    {usageData.daily.map(({ date, count, tokens }) => {
                      const pct = Math.round((count / maxCount) * 100);
                      const isToday = date === new Date().toISOString().slice(0, 10);
                      const label = tokens > 0
                        ? `${date}: ${count} msg · ${tokens.toLocaleString()} tokens`
                        : `${date}: ${count} messages`;
                      return (
                        <div
                          key={date}
                          className="flex-1 flex flex-col items-center justify-end gap-0.5 group"
                          title={label}
                        >
                          <div
                            className={`w-full rounded-sm transition-all ${
                              isToday ? "bg-blue-500" : count > 0 ? "bg-zinc-600 group-hover:bg-zinc-500" : "bg-gray-100 dark:bg-zinc-800"
                            }`}
                            style={{ height: `${Math.max(pct, count > 0 ? 10 : 2)}%` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {!usageLoading && usageData?.totalMessages === 0 && (
            <p className="text-xs text-gray-400 dark:text-zinc-600 text-center py-2">{t("usage.noMessages")}</p>
          )}
        </div>
      </div>

      {/* Quick test input */}
      {instance.status === "running" && (
        <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("overview.quickTest")}</h3>
            <span className="text-xs text-gray-400 dark:text-zinc-600">{t("overview.quickTestHint")}</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={overviewTestInput}
                onChange={(e) => { setOverviewTestInput(e.target.value); setOverviewTestError(null); setOverviewTestResponse(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") sendOverviewTestMessage(); }}
                placeholder={t("overview.quickTestPlaceholder")}
                disabled={overviewTestSending}
                className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
              />
              <button
                onClick={sendOverviewTestMessage}
                disabled={overviewTestSending || !overviewTestInput.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-600 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 dark:text-white shrink-0"
              >
                {overviewTestSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {overviewTestSending ? "…" : t("overview.sendBtn")}
              </button>
            </div>
            {overviewTestError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{overviewTestError}</span>
              </div>
            )}
            {overviewTestResponse && (
              <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-500" />
                    <span className="text-xs text-gray-500 dark:text-zinc-500">{t("overview.agentResponse")}</span>
                  </div>
                  {overviewTestResponse.latencyMs != null && (
                    <span className="text-xs text-gray-400 dark:text-zinc-600">{overviewTestResponse.latencyMs}ms</span>
                  )}
                </div>
                <div className="text-sm text-gray-700 dark:text-zinc-200 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-white prose-code:text-blue-600 dark:text-blue-300 prose-code:bg-gray-200 dark:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-pre:bg-gray-50 dark:bg-white/5 prose-pre:border prose-pre:border-gray-200 dark:border-white/10 prose-pre:rounded-xl prose-li:text-gray-700 dark:text-zinc-300 prose-strong:text-white prose-a:text-blue-600 dark:text-blue-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {overviewTestResponse.text}
                  </ReactMarkdown>
                </div>
                <button
                  onClick={() => { setOverviewTestInput(""); setOverviewTestResponse(null); }}
                  className="mt-2 text-xs text-gray-400 dark:text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {t("overview.tryAnother")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentLogs.length > 0 && (
        <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("overview.recentActivity")}</h3>
            </div>
            <button
              onClick={onGoToActivity}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-300 transition-colors"
            >
              {t("overview.seeAll")}
            </button>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-white/5">
            {recentLogs.map((log) => {
              const meta = { icon: "·", color: "text-gray-500 dark:text-zinc-400" };
              return (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-base shrink-0 leading-none">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700 dark:text-zinc-300 capitalize">{log.event.replace(/_/g, " ")}</span>
                    {log.details && (
                      <span className="text-xs text-gray-400 dark:text-zinc-600 ml-2 truncate">{log.details}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-zinc-600 shrink-0">{formatRelativeTime(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      <AnalyticsSummary instanceId={id} />

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 flex gap-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{t("overview.upgradeHint")}</span>
      </div>
    </div>
  );
}
