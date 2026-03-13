"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Rocket,
  Loader2,
  CheckCircle2,
  XCircle,
  Server,
  Globe,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HetznerRegion,
  REGION_LABELS,
  TIER_LABEL,
  TIER_COST,
} from "@/lib/provisioning";
import { useTranslations } from "next-intl";

type ProvisionStatus = "pending" | "provisioning" | "ready" | "failed";

interface ProvisioningWizardProps {
  instanceId: string;
  instanceName: string;
  tier: string;
  provisionStatus?: string | null;
  /** API endpoint to call for provisioning — defaults to admin route */
  provisionEndpoint?: string;
  /** Pre-select a region in the configure step */
  defaultRegion?: HetznerRegion;
  onClose: () => void;
  /** Called when provisioning completes (ready or failed) */
  onDone?: (status: "ready" | "failed") => void;
}

type WizardStep = "configure" | "in-progress" | "success" | "failed";

const PROVISION_STEP_KEYS = [
  { key: "creatingServer", maxSec: 15 },
  { key: "installingDocker", maxSec: 60 },
  { key: "startingOpenClaw", maxSec: 300 },
  { key: "runningHealthCheck", maxSec: 480 },
] as const;

function getProgressStep(elapsedSec: number): number {
  let cumulative = 0;
  for (let i = 0; i < PROVISION_STEP_KEYS.length; i++) {
    cumulative += PROVISION_STEP_KEYS[i].maxSec;
    if (elapsedSec < cumulative) return i;
  }
  return PROVISION_STEP_KEYS.length - 1;
}

export function ProvisioningWizard({
  instanceId,
  instanceName,
  tier,
  provisionStatus,
  provisionEndpoint,
  defaultRegion,
  onClose,
  onDone,
}: ProvisioningWizardProps) {
  const t = useTranslations("provisioningWizard");
  const apiEndpoint =
    provisionEndpoint ?? `/api/admin/instances/${instanceId}/provision`;

  const [step, setStep] = useState<WizardStep>(
    provisionStatus === "provisioning" ? "in-progress" :
    provisionStatus === "ready" ? "success" :
    provisionStatus === "failed" ? "failed" :
    "configure"
  );

  const [region, setRegion] = useState<HetznerRegion>(defaultRegion ?? "nbg1");
  const [provisioning, setProvisioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state
  const [vpsIp, setVpsIp] = useState<string | null>(null);
  const [vpsUrl, setVpsUrl] = useState<string | null>(null);

  // Progress animation
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentProgressStep, setCurrentProgressStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function startTimerAndPolling() {
    startTimeRef.current = Date.now();
    setElapsedSec(0);
    setCurrentProgressStep(0);

    // Elapsed timer every second
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSec(elapsed);
      setCurrentProgressStep(getProgressStep(elapsed));
    }, 1000);

    // Poll provision-status every 5s
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/instances/${instanceId}/provision-status`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.provisionStatus === "ready") {
          stopAll();
          setVpsIp(data.ip ?? null);
          setVpsUrl(data.vpsUrl ?? null);
          setStep("success");
          onDone?.("ready");
        } else if (data.provisionStatus === "failed") {
          stopAll();
          setError(data.error ?? "Provisioning failed");
          setStep("failed");
          onDone?.("failed");
        }
      } catch {
        // swallow poll errors
      }
    }, 5000);
  }

  function stopAll() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  async function handleProvision() {
    setProvisioning(true);
    setError(null);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region }),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to start provisioning");
        setProvisioning(false);
        return;
      }

      setStep("in-progress");
      startTimerAndPolling();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
    setProvisioning(false);
  }

  async function handleRetry() {
    setStep("configure");
    setError(null);
    stopAll();
  }

  const tierLabel = TIER_LABEL[tier] ?? tier;
  const tierCost = TIER_COST[tier] ?? "";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm">{t("title")}</h2>
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">{instanceName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step 1: Configure ── */}
        {step === "configure" && (
          <div className="p-6 space-y-5">
            {/* Tier display */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                {t("serverTier")}
              </label>
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
                <Server className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{tierLabel}</div>
                  {tierCost && (
                    <div className="text-xs text-zinc-500 mt-0.5">{tierCost}</div>
                  )}
                </div>
                <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full capitalize">
                  {tier}
                </span>
              </div>
            </div>

            {/* Region selector */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                <Globe className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                {t("region")}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as HetznerRegion)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors appearance-none cursor-pointer"
              >
                {(Object.entries(REGION_LABELS) as [HetznerRegion, string][]).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost estimate */}
            {tierCost && (
              <div className="flex items-center gap-2 bg-violet-500/5 border border-violet-500/20 rounded-xl px-4 py-3 text-xs text-violet-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                <span>
                  {t("estimatedCost", { cost: tierCost, tier })}
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">
                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleProvision}
                disabled={provisioning}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
              >
                {provisioning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {provisioning ? t("starting") : t("provisionNow")}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: In Progress ── */}
        {step === "in-progress" && (
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
              </div>
              <h3 className="font-semibold text-white">{t("inProgressTitle")}</h3>
              <p className="text-xs text-zinc-500 mt-1">{t("inProgressDesc")}</p>
            </div>

            {/* Steps list */}
            <div className="space-y-3">
              {PROVISION_STEP_KEYS.map((s, i) => {
                const isDone = i < currentProgressStep;
                const isActive = i === currentProgressStep;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : isActive
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-white/[0.02] border-white/5"
                    )}
                  >
                    <div className="w-5 h-5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isActive ? (
                        <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-600">
                          {i + 1}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-sm",
                        isDone
                          ? "text-emerald-300"
                          : isActive
                          ? "text-white font-medium"
                          : "text-zinc-600"
                      )}
                    >
                      {t(s.key)}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-xs text-zinc-600 font-mono">
                        {elapsedSec}s
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-zinc-600 text-center">
              {t("pollingNote")}
            </p>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === "success" && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-lg">✅ {t("successTitle")}</h3>
              <p className="text-sm text-zinc-400 mt-1">
                {t("successDesc")}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl divide-y divide-white/5">
              {vpsIp && (
                <div className="flex items-center gap-3 px-4 py-3 text-sm">
                  <Server className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-400">{t("ipAddress")}</span>
                  <span className="ml-auto font-mono text-white text-xs">{vpsIp}</span>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3 text-sm">
                <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-zinc-400">{t("tier")}</span>
                <span className="ml-auto text-white text-xs capitalize">{tier}</span>
              </div>
              {vpsUrl && (
                <div className="flex items-center gap-3 px-4 py-3 text-sm">
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="text-zinc-400">{t("gateway")}</span>
                  <a
                    href={vpsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto font-mono text-violet-400 hover:text-violet-300 text-xs truncate max-w-[140px]"
                  >
                    {vpsUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
              >
                {t("goToDashboard")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Failed ── */}
        {step === "failed" && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="font-bold text-white text-lg">❌ {t("failedTitle")}</h3>
              <p className="text-sm text-zinc-400 mt-1">{t("failedDesc")}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <a
                href="mailto:support@synapseforge.ai"
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-3 rounded-xl text-sm font-semibold text-zinc-300"
              >
                {t("contactSupport")}
              </a>
              <button
                onClick={handleRetry}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-3 rounded-xl text-sm font-semibold"
              >
                <Rocket className="w-4 h-4" /> {t("tryAgain")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
