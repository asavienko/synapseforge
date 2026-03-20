"use client";

import { Activity, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/utils";
import { LogRow } from "../types";
import { LOG_ICONS, groupLogsByDay } from "../utils";
import { formatAbsoluteTime } from "../utils";

interface ActivityLogTabProps {
  logs: LogRow[];
  logsLoading: boolean;
  logFilter: "all" | "config" | "chat" | "errors" | "keys" | "provision";
  setLogFilter: React.Dispatch<React.SetStateAction<"all" | "config" | "chat" | "errors" | "keys" | "provision">>;
  loadLogs: () => Promise<void>;
}

export function ActivityLogTab({
  logs,
  logsLoading,
  logFilter,
  setLogFilter,
  loadLogs,
}: ActivityLogTabProps) {
  const t = useTranslations("instanceDetail");

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    if (logFilter === "config") return ["config_changed", "config_synced"].includes(log.event);
    if (logFilter === "chat") return log.event === "chat_message";
    if (logFilter === "errors") return ["error", "provision_failed", "key_revoked"].includes(log.event);
    if (logFilter === "keys") return ["key_generated", "key_revoked"].includes(log.event);
    if (logFilter === "provision") return log.event.startsWith("provision_");
    return true;
  });

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">{t("activity.title")}</h3>
          {logsLoading && <Loader2 className="w-3.5 h-3.5 text-zinc-600 animate-spin" />}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={logFilter}
            onChange={(e) => setLogFilter(e.target.value as typeof logFilter)}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="all">{t("activity.filterAll")}</option>
            <option value="config">{t("activity.filterConfig")}</option>
            <option value="chat">{t("activity.filterChat")}</option>
            <option value="errors">{t("activity.filterErrors")}</option>
            <option value="keys">{t("activity.filterKeys")}</option>
            <option value="provision">{t("activity.filterProvision")}</option>
          </select>
          <span className="text-xs text-zinc-600">{t("activity.autoRefresh")}</span>
          <button onClick={loadLogs} className="text-xs text-zinc-500 hover:text-white transition-colors">{t("activity.refresh")}</button>
        </div>
      </div>

      {logsLoading && logs.length === 0 ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 text-zinc-500 animate-spin" /></div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center">
          <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">{t("activity.noActivity")}</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center">
          <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">{t("activity.noResults")}</p>
          <button onClick={() => setLogFilter("all")} className="mt-2 text-xs text-violet-400 hover:text-violet-300">{t("activity.clearFilter")}</button>
        </div>
      ) : (
        <div>
          {groupLogsByDay(filteredLogs).map(({ label, logs: dayLogs }) => (
            <div key={label}>
              <div className="px-4 py-2 bg-white/[0.01] border-b border-white/5">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
              </div>
              <div className="divide-y divide-white/5">
                {dayLogs.map((log) => {
                  let meta = LOG_ICONS[log.event];
                  if (!meta && log.event.startsWith("provision_")) {
                    meta = { icon: "⚙️", color: "text-amber-400" };
                  }
                  meta = meta ?? { icon: "·", color: "text-zinc-400" };
                  const relTime = formatRelativeTime(log.createdAt);
                  const absTime = formatAbsoluteTime(log.createdAt);
                  return (
                    <div key={log.id} className="flex items-start gap-4 p-4">
                      <span className="text-base mt-0.5 shrink-0 leading-none">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-200 capitalize">{log.event.replace(/_/g, " ")}</div>
                        {log.details && <div className="text-xs text-zinc-500 mt-0.5">{log.details}</div>}
                      </div>
                      <div title={absTime} className="text-xs text-zinc-600 shrink-0 cursor-default">{relTime}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
