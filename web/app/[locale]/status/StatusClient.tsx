"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Server,
  LayoutDashboard,
  MessageSquare,
  Webhook,
  Cloud
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentStatus {
  status: "operational" | "degraded" | "major_outage";
  uptime: number;
}

interface SystemStatus {
  status: "operational" | "degraded" | "major_outage" | "unknown";
  uptimePercentage: number | null;
  lastUpdated: string;
  components: {
    api: ComponentStatus;
    dashboard: ComponentStatus;
    chat: ComponentStatus;
    webhooks: ComponentStatus;
    provisioning: ComponentStatus;
  };
  instances: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
  recentIncidents: Array<{
    date: string;
    count: number;
    affected: string[];
  }>;
}

const COMPONENT_ICONS = {
  api: Server,
  dashboard: LayoutDashboard,
  chat: MessageSquare,
  webhooks: Webhook,
  provisioning: Cloud,
};

const STATUS_COLORS = {
  operational: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  degraded: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  major_outage: "text-red-400 bg-red-400/10 border-red-400/20",
  unknown: "text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-400/10 border-gray-200 dark:border-zinc-400/20",
};

const STATUS_LABELS = {
  operational: "Operational",
  degraded: "Degraded Performance",
  major_outage: "Major Outage",
  unknown: "Unknown",
};

export function StatusClient() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    // Refresh every 60 seconds
    const interval = setInterval(loadStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed to load status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-zinc-400">{error || "Failed to load status"}</p>
        <button
          onClick={loadStatus}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Status */}
      <div
        className={cn(
          "rounded-2xl border p-6 text-center",
          STATUS_COLORS[status.status]
        )}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          {status.status === "operational" ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : status.status === "degraded" ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <span className="text-xl font-semibold">{STATUS_LABELS[status.status]}</span>
        </div>
        {status.uptimePercentage !== null && (
          <p className="text-sm opacity-80">
            {status.uptimePercentage}% uptime in the last 24 hours
          </p>
        )}
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(status.components).map(([key, component]) => {
          const Icon = COMPONENT_ICONS[key as keyof typeof COMPONENT_ICONS];
          return (
            <div
              key={key}
              className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {key}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    STATUS_COLORS[component.status]
                  )}
                >
                  {STATUS_LABELS[component.status]}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-500">
                {component.uptime}% uptime
              </div>
            </div>
          );
        })}
      </div>

      {/* Instance Stats */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Agent Instances</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{status.instances.total}</div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{status.instances.healthy}</div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{status.instances.degraded}</div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">Degraded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{status.instances.down}</div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">Down</div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      {status.recentIncidents.length > 0 && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h2>
          <div className="space-y-3">
            {status.recentIncidents.map((incident) => (
              <div
                key={incident.date}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg"
              >
                <div>
                  <div className="text-sm text-gray-900 dark:text-white">{incident.date}</div>
                  {incident.affected.length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      Affected: {incident.affected.slice(0, 3).join(", ")}
                      {incident.affected.length > 3 && ` +${incident.affected.length - 3} more`}
                    </div>
                  )}
                </div>
                <div className="text-sm text-red-400">{incident.count} issues</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-400 dark:text-zinc-600">
        Last updated: {new Date(status.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}
