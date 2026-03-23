"use client";

import { useState } from "react";
import { Server, Wifi, WifiOff, Zap, Loader2, AlertCircle, Database, MessageSquare, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRelativeTime, cn } from "@/lib/utils";
import { MobileTableWrapper } from "@/components/MobileTableWrapper";
import { Instance, HealthData, SnapshotsData, CommandRow, GatewayStatus } from "../types";

interface InfrastructureTabProps {
  instance: Instance;
  id: string;
  healthData: HealthData | null;
  snapshotsData: SnapshotsData | null;
  infraLoading: boolean;
  isAdmin: boolean;
  resyncLoading: boolean;
  commands: CommandRow[];
  restoreConfirmId: string | null;
  setRestoreConfirmId: React.Dispatch<React.SetStateAction<string | null>>;
  restoreRequested: string | null;
  gatewayStatus: GatewayStatus | null;
  checkingGateway: boolean;
  currentVersionInfo: { changelog?: string | null; stable?: boolean } | null;
  resyncConfig: () => Promise<void>;
  toggleAutoUpdate: () => Promise<void>;
  checkGatewayNow: () => Promise<void>;
  requestRollback: (snapshotId: string) => Promise<void>;
  showToast: (text: string, type?: "success" | "error") => void;
}

export function InfrastructureTab({
  instance,
  healthData,
  snapshotsData,
  infraLoading,
  isAdmin,
  resyncLoading,
  commands,
  restoreConfirmId,
  setRestoreConfirmId,
  restoreRequested,
  gatewayStatus,
  checkingGateway,
  currentVersionInfo,
  resyncConfig,
  toggleAutoUpdate,
  checkGatewayNow,
  requestRollback,
}: InfrastructureTabProps) {
  const t = useTranslations("instanceDetail");
  const [chatMessage, setChatMessage] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [chatResponse, setChatResponse] = useState<{ text: string; latencyMs?: number } | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  async function sendChatMessage() {
    if (!chatMessage.trim()) return;
    setChatSending(true);
    setChatResponse(null);
    setChatError(null);

    const res = await fetch(`/api/instances/${instance.id}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: chatMessage.trim() }),
    });
    const data = await res.json();

    if (!res.ok) {
      setChatError(data.error ?? "Gateway error");
    } else {
      const text = data.response ?? data.text ?? data.message ?? data.content ?? JSON.stringify(data);
      setChatResponse({ text, latencyMs: data.latencyMs });
    }
    setChatSending(false);
  }

  if (infraLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provision Status */}
      {(instance.provisionStatus || instance.hasGateway) && (
        <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-zinc-500" />
              <h3 className="text-sm font-semibold text-white">{t("infrastructure.vpsProvisioning")}</h3>
            </div>
            {isAdmin ? (
              <button
                onClick={resyncConfig}
                disabled={resyncLoading}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {resyncLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                {t("infrastructure.resyncConfig")}
              </button>
            ) : (
              instance.configSynced === false && (
                <span className="text-xs text-amber-400">{t("infrastructure.configManagerSync")}</span>
              )
            )}
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.status")}</div>
              {(() => {
                const ps = instance.provisionStatus;
                if (ps === "provisioning") return (
                  <span className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium bg-amber-500/20 text-amber-300 border-amber-500/30">
                    <Loader2 className="w-3 h-3 animate-spin" /> {t("infrastructure.provisioning")}
                  </span>
                );
                if (ps === "ready") return (
                  <span className="text-sm px-3 py-1 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {t("infrastructure.ready")}
                  </span>
                );
                if (ps === "failed") return (
                  <span className="text-sm px-3 py-1 rounded-full border font-medium bg-red-500/20 text-red-300 border-red-500/30">
                    {t("infrastructure.failed")}
                  </span>
                );
                if (instance.hasGateway) return (
                  <span className="text-sm px-3 py-1 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {t("infrastructure.ready")}
                  </span>
                );
                return (
                  <span className="text-sm px-3 py-1 rounded-full border font-medium bg-zinc-700/30 text-zinc-400 border-zinc-600/30">{ps ?? "Unknown"}</span>
                );
              })()}
            </div>
            {healthData?.vpsUrl && (
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.vpsUrlLabel")}</div>
                <span className="text-sm text-zinc-300 font-mono">{healthData.vpsUrl}</span>
              </div>
            )}
            {instance.configSynced === false && (
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.config")}</div>
                <span className="flex items-center gap-1.5 text-xs text-amber-400">
                  <AlertCircle className="w-3 h-3" /> {t("infrastructure.outOfSync")}
                </span>
              </div>
            )}
            {healthData?.liveCheck && (
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.lastCheck")}</div>
                <div className="flex items-center gap-2">
                  {healthData.liveCheck.healthy ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-sm text-emerald-300">{healthData.liveCheck.latencyMs}ms</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-sm text-red-400">{healthData.liveCheck.error ?? t("infrastructure.unreachable")}</span>
                    </>
                  )}
                  {healthData.lastCheckedAt && (
                    <span className="text-xs text-zinc-600">· {formatRelativeTime(healthData.lastCheckedAt)}</span>
                  )}
                </div>
              </div>
            )}
            {healthData?.uptimePercentage !== null && healthData?.uptimePercentage !== undefined && (
              <div className="flex items-center gap-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.uptime")}</div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    healthData.uptimePercentage >= 99 ? "text-emerald-400" :
                    healthData.uptimePercentage >= 95 ? "text-amber-400" : "text-red-400"
                  )}>
                    {healthData.uptimePercentage}%
                  </span>
                  <span className="text-xs text-zinc-600">
                    ({healthData.totalChecks} checks)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gateway Status */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">{t("infrastructure.gateway.title")}</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.status")}</div>
            {instance.hasGateway ? (
              <span className="text-sm px-3 py-1 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{t("infrastructure.gateway.connected")}</span>
            ) : (
              <span className="text-sm px-3 py-1 rounded-full border font-medium bg-zinc-700/30 text-zinc-400 border-zinc-600/30">{t("infrastructure.gateway.notConfigured")}</span>
            )}
          </div>

          {instance.hasGateway && (
            <>
              {gatewayStatus && (
                <div className="flex items-center gap-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.gateway.latency")}</div>
                  <div className="flex items-center gap-2">
                    {gatewayStatus.connected ? (
                      <>
                        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm text-emerald-300">{gatewayStatus.latencyMs}{t("infrastructure.gateway.ms")}</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-sm text-red-400">{gatewayStatus.error ?? t("infrastructure.unreachable")}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div>
                <button
                  onClick={checkGatewayNow}
                  disabled={checkingGateway}
                  className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {checkingGateway ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> {t("infrastructure.gateway.checking")}</>
                  ) : (
                    <><Wifi className="w-3 h-3" /> {t("infrastructure.gateway.checkNow")}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Health Status */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Server className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">{t("infrastructure.health.title")}</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.health.status")}</div>
            {(() => {
              const hs = healthData?.healthStatus ?? null;
              const colorMap: Record<string, string> = {
                healthy: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                degraded: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                down: "bg-red-500/20 text-red-300 border-red-500/30",
              };
              const labelMap: Record<string, string> = {
                healthy: t("infrastructure.health.healthy"),
                degraded: t("infrastructure.health.degraded"),
                down: t("infrastructure.health.down"),
              };
              return (
                <span className={`text-sm px-3 py-1 rounded-full border font-medium ${hs ? colorMap[hs] : "bg-zinc-700/30 text-zinc-400 border-zinc-600/30"}`}>
                  {hs ? labelMap[hs] ?? hs : t("infrastructure.health.unknown")}
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.health.lastChecked")}</div>
            <span className="text-sm text-zinc-300">{healthData?.lastCheckedAt ? formatRelativeTime(healthData.lastCheckedAt) : t("infrastructure.health.noData")}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.health.vpsUrl")}</div>
            <span className="text-sm text-zinc-300 font-mono">{healthData?.vpsUrl ?? t("infrastructure.health.notConfigured")}</span>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="p-5 pb-3">
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider">{t("infrastructure.health.history")}</h4>
          </div>
          {!healthData || healthData.checks.length === 0 ? (
            <div className="px-5 pb-8 text-center">
              <p className="text-zinc-500 text-sm">{t("infrastructure.health.noData")}</p>
            </div>
          ) : (
            <MobileTableWrapper>
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-xs text-zinc-500 border-b border-white/5">
                    <th className="text-left px-5 py-2">{t("infrastructure.health.time")}</th>
                    <th className="text-left px-5 py-2">{t("infrastructure.health.status")}</th>
                    <th className="text-left px-5 py-2">{t("infrastructure.health.responseTime")}</th>
                    <th className="text-left px-5 py-2">{t("infrastructure.health.error")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {healthData.checks.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5 text-zinc-400 text-xs">{formatRelativeTime(c.checkedAt)}</td>
                      <td className="px-5 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === "healthy" ? "bg-emerald-500/20 text-emerald-300" :
                          c.status === "degraded" ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-red-500/20 text-red-300"
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-2.5 text-zinc-400 text-xs">{c.responseMs != null ? `${c.responseMs}ms` : "—"}</td>
                      <td className="px-5 py-2.5 text-zinc-500 text-xs text-wrap-safe">{c.error ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </MobileTableWrapper>
          )}
        </div>
      </div>

      {/* Version */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Zap className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">{t("infrastructure.version.title")}</h3>
        </div>
        <div className="p-5">
          <div className="bg-white/3 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">{t("infrastructure.version.currentVersion")}</p>
                <p className="text-sm text-white font-mono mt-1">{instance?.currentVersion ?? t("infrastructure.version.versionUnknown")}</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">{t("infrastructure.version.autoUpdate")}</label>
                <button
                  onClick={toggleAutoUpdate}
                  className={`relative w-9 h-5 rounded-full transition-colors ${instance?.autoUpdate ? "bg-violet-600" : "bg-zinc-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${instance?.autoUpdate ? "translate-x-4 left-0.5" : "translate-x-0 left-0.5"}`} />
                </button>
              </div>
            </div>
            {currentVersionInfo?.changelog && (
              <div className="mt-3 p-3 bg-white/3 rounded-lg border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">{t("infrastructure.version.changelog")}</p>
                <p className="text-xs text-zinc-400 whitespace-pre-line">{currentVersionInfo.changelog}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backups */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">{t("infrastructure.backups.title")}</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider w-28">{t("infrastructure.backups.lastBackup")}</div>
            <span className="text-sm text-zinc-300">{snapshotsData?.lastBackupAt ? formatRelativeTime(snapshotsData.lastBackupAt) : t("infrastructure.backups.never")}</span>
          </div>
        </div>
        {!snapshotsData || snapshotsData.snapshots.length === 0 ? (
          <div className="px-5 pb-8 text-center">
            <p className="text-zinc-500 text-sm">{t("infrastructure.backups.noSnapshots")}</p>
          </div>
        ) : (
          <MobileTableWrapper>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-white/5">
                  <th className="text-left px-5 py-2">{t("infrastructure.health.time")}</th>
                  <th className="text-left px-5 py-2">{t("infrastructure.backups.snapshotId")}</th>
                  <th className="text-left px-5 py-2">{t("infrastructure.backups.size")}</th>
                  <th className="text-left px-5 py-2">{t("infrastructure.health.status")}</th>
                  <th className="px-5 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {snapshotsData.snapshots.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 text-zinc-400 text-xs">{formatRelativeTime(s.createdAt)}</td>
                    <td className="px-5 py-2.5 text-zinc-300 text-xs font-mono">{s.snapshotId?.slice(0, 12)}</td>
                    <td className="px-5 py-2.5 text-zinc-400 text-xs">{s.sizeBytes != null ? `${(s.sizeBytes / 1024 / 1024).toFixed(1)} MB` : "—"}</td>
                    <td className="px-5 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.healthy ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{s.healthy ? t("infrastructure.health.healthy") : t("infrastructure.health.down")}</span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {restoreRequested === s.snapshotId ? (
                        <span className="text-xs text-emerald-400">{t("infrastructure.backups.restoreRequested")}</span>
                      ) : restoreConfirmId === s.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => requestRollback(s.snapshotId)}
                            className="text-xs px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors touch-target"
                          >{t("infrastructure.backups.confirmRestore")}</button>
                          <button
                            onClick={() => setRestoreConfirmId(null)}
                            className="text-xs text-zinc-500 hover:text-white touch-target"
                          >{t("common.cancel")}</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRestoreConfirmId(s.id)}
                          className="text-xs text-zinc-500 hover:text-violet-400 transition-colors touch-target"
                        >{t("infrastructure.backups.restore")}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </MobileTableWrapper>
        )}
        <div className="p-5 border-t border-white/5">
          <p className="text-xs text-zinc-600">{t("infrastructure.backups.note")}</p>
        </div>
      </div>

      {/* Command Queue */}
      {commands.length > 0 && (
        <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">{t("infrastructure.commandQueue.title")}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {commands.slice(0, 10).map((cmd) => (
              <div key={cmd.id} className="flex items-center justify-between px-5 py-3 text-xs">
                <span className="text-zinc-400 font-mono">{cmd.type}</span>
                <div className="flex items-center gap-3">
                  {cmd.note && <span className="text-zinc-600">{cmd.note}</span>}
                  <span className={`font-medium ${
                    cmd.status === "done" ? "text-emerald-400" :
                    cmd.status === "running" ? "text-blue-400" :
                    cmd.status === "failed" ? "text-red-400" :
                    "text-zinc-400"
                  }`}>{cmd.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Chat */}
      {instance.hasGateway && instance.status === "running" && (
        <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-white">{t("infrastructure.testChat.title")}</h3>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-zinc-500">{t("infrastructure.testChat.note")}</p>
            <div className="flex gap-3">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                placeholder={t("infrastructure.testChat.placeholder")}
                rows={2}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
              <button
                onClick={sendChatMessage}
                disabled={chatSending || !chatMessage.trim()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-white self-end"
              >
                {chatSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {chatSending ? t("infrastructure.testChat.sending") : t("infrastructure.testChat.send")}
              </button>
            </div>
            {chatError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{chatError}</span>
              </div>
            )}
            {chatResponse && (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("infrastructure.testChat.responseLabel")}</span>
                  {chatResponse.latencyMs != null && (
                    <span className="text-xs text-zinc-600">{chatResponse.latencyMs}{t("infrastructure.gateway.ms")}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{chatResponse.text}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
