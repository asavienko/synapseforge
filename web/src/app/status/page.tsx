"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Database, Mail, CreditCard } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  database: boolean;
  databaseLatency: number;
  stripe: boolean;
  resend: boolean;
  timestamp: string;
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        setError("Failed to fetch health status");
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      name: "Database",
      icon: Database,
      status: health?.database ?? false,
      latency: health?.databaseLatency,
    },
    {
      name: "Stripe Payments",
      icon: CreditCard,
      status: health?.stripe ?? null,
    },
    {
      name: "Email (Resend)",
      icon: Mail,
      status: health?.resend ?? null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">OpenHelix AI</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Overall Status */}
            <div
              className={`p-6 rounded-xl border mb-8 ${
                health?.status === "healthy"
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-3">
                {health?.status === "healthy" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
                <div>
                  <p
                    className={`text-lg font-semibold ${
                      health?.status === "healthy" ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {health?.status === "healthy" ? "All Systems Operational" : "Some Systems Degraded"}
                  </p>
                  <p className="text-sm text-zinc-500">
                    Last updated: {new Date(health?.timestamp ?? "").toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Service Status</h2>
              {services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.latency !== undefined && service.latency > 0 && (
                        <p className="text-sm text-zinc-500">{service.latency}ms latency</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.status === null ? (
                      <span className="text-sm text-zinc-500">Not configured</span>
                    ) : service.status ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm text-emerald-400">Operational</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-red-400">Down</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-12 p-6 bg-white/[0.02] border border-white/5 rounded-xl">
              <h3 className="font-semibold mb-2">About This Page</h3>
              <p className="text-sm text-zinc-400">
                This page shows the real-time status of OpenHelix AI services. Status is checked
                every 30 seconds. For issues or questions, contact us at{" "}
                <a href="mailto:support@openhelixai.com" className="text-violet-400 hover:underline">
                  support@openhelixai.com
                </a>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}