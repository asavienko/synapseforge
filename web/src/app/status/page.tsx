"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity,
  Server,
  Database,
  Zap,
  Clock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface StatusData {
  overallStatus: "operational" | "degraded" | "down";
  timestamp: string;
  services: {
    api: { status: string; latencyMs: number };
    database: { status: string; latencyMs: number | null; error?: string };
  };
  stats: {
    totalInstances: number;
    runningInstances: number;
    healthyInstances: number;
    uptimePercentage: number;
  };
  incidents: Array<{
    id: string;
    type: string;
    description: string | null;
    timestamp: string;
  }>;
}

const statusConfig = {
  operational: {
    label: "All Systems Operational",
    description: "Everything is running smoothly",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  degraded: {
    label: "Degraded Performance",
    description: "Some services may be experiencing issues",
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  down: {
    label: "Major Outage",
    description: "We are experiencing significant issues",
    icon: XCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
};

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("Unable to load status data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentStatus = data?.overallStatus || "operational";
  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to SynapseForge</span>
          </Link>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-400" />
            <span className="font-semibold">Status</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Overall Status */}
        <div className={`rounded-2xl border ${config.borderColor} ${config.bgColor} p-8 mb-8`}>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center shrink-0`}>
              <StatusIcon className={`w-8 h-8 ${config.color}`} />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${config.color} mb-1`}>
                {config.label}
              </h1>
              <p className="text-zinc-400">{config.description}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <button 
                onClick={fetchStatus}
                disabled={loading}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* API Status */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold">API</h3>
                  <p className="text-sm text-zinc-500">REST API Endpoints</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">Operational</span>
              </div>
            </div>
            <div className="text-sm text-zinc-500">
              Latency: {data?.services.api.latencyMs || "--"}ms
            </div>
          </div>

          {/* Database Status */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Database</h3>
                  <p className="text-sm text-zinc-500">PostgreSQL Primary</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {data?.services.database.status === "operational" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-400">Operational</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-sm text-red-400">Down</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-zinc-500">
              {data?.services.database.latencyMs 
                ? `Latency: ${data.services.database.latencyMs}ms`
                : data?.services.database.error || "Checking..."}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-zinc-500">Uptime (24h)</span>
            </div>
            <div className="text-2xl font-bold">
              {data?.stats.uptimePercentage || "--"}%
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-zinc-500">Total Agents</span>
            </div>
            <div className="text-2xl font-bold">
              {data?.stats.totalInstances?.toLocaleString() || "--"}
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-zinc-500">Running</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {data?.stats.runningInstances?.toLocaleString() || "--"}
            </div>
          </div>
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-zinc-500">Healthy</span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {data?.stats.healthyInstances?.toLocaleString() || "--"}
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold">Recent Incidents (24h)</h2>
          </div>
          
          {data?.incidents && data.incidents.length > 0 ? (
            <div className="space-y-3">
              {data.incidents.map((incident, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg border border-white/5"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">
                        {incident.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(incident.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">
                      {incident.description || "No details available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p>No incidents in the last 24 hours</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>Status page updates automatically every 30 seconds.</p>
          <p className="mt-1">
            For updates, follow{" "}
            <a href="https://twitter.com/synapseforge" className="text-violet-400 hover:text-violet-300">
              @synapseforge
            </a>
            {" "}or{" "}
            <Link href="/contact" className="text-violet-400 hover:text-violet-300">
              contact support
            </Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
