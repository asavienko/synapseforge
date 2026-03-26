"use client";

import { useState, useEffect } from "react";
import { Loader2, Terminal, Download, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface LogsTabProps {
  instanceId: string;
  hasVps: boolean;
}

interface LogLine {
  timestamp: string;
  level: string;
  message: string;
  source?: string;
}

export function LogsTab({ instanceId, hasVps }: LogsTabProps) {
  const t = useTranslations("instanceDetail");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(false);

  async function fetchLogs() {
    if (!hasVps) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/instances/${instanceId}/logs/realtime?lines=${lines}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch
  useEffect(() => {
    if (hasVps) fetchLogs();
  }, [instanceId, hasVps, lines]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !hasVps) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, hasVps, lines]);

  function downloadLogs() {
    const content = logs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `instance-logs-${instanceId}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getLevelColor(level: string): string {
    switch (level.toLowerCase()) {
      case "error": return "text-red-400";
      case "warn": return "text-amber-400";
      case "info": return "text-sky-400";
      case "debug": return "text-zinc-500";
      default: return "text-zinc-400";
    }
  }

  if (!hasVps) {
    return (
      <div className="glow-border rounded-2xl bg-white/[0.02] p-8 text-center">
        <Terminal className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-sm font-semibold text-white mb-2">Instance Logs</h3>
        <p className="text-sm text-zinc-500 max-w-md mx-auto">
          Real-time logs are available once your instance is provisioned on a VPS.
          Sandbox instances do not have remote logs.
        </p>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-semibold text-white">Instance Logs</h3>
          {loading && <Loader2 className="w-3.5 h-3.5 text-zinc-600 animate-spin" />}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={lines}
            onChange={(e) => setLines(Number(e.target.value))}
            className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-violet-500"
          >
            <option value={50}>50 lines</option>
            <option value={100}>100 lines</option>
            <option value={250}>250 lines</option>
            <option value={500}>500 lines</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/10 bg-white/5 text-violet-500 focus:ring-violet-500"
            />
            Auto-refresh
          </label>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {logs.length > 0 && (
            <button
              onClick={downloadLogs}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Log content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs bg-black/20">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-zinc-600">
            {loading ? "Loading logs..." : "No logs available"}
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 hover:bg-white/5 px-2 py-0.5 rounded">
                <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
                <span className={`shrink-0 w-12 ${getLevelColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <span className="text-zinc-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}