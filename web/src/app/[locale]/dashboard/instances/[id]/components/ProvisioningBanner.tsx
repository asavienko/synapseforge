"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Instance } from "../types";

interface ProvisioningBannerProps {
  instance: Instance;
  onDismiss: () => void;
  onReady: () => void;
  onFailed: () => void;
}

export function ProvisioningBanner({ instance, onDismiss, onReady, onFailed }: ProvisioningBannerProps) {
  const t = useTranslations("instanceDetail");
  const id = instance.id;
  const [dismissed, setDismissed] = useState(false);
  const [failedBanner, setFailedBanner] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    setElapsedSec(Math.max(0, Math.floor((Date.now() - new Date(instance.createdAt).getTime()) / 1000)));
  }, [instance.createdAt]);

  function getStep(sec: number): string {
    if (sec < 30) return t("provisioning.step1");
    if (sec < 120) return t("provisioning.step2");
    if (sec < 300) return t("provisioning.step3");
    return t("provisioning.step4");
  }

  const MAX_SEC = 480;
  const pct = Math.min(Math.round((elapsedSec / MAX_SEC) * 100), 95);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/instances/${id}/provision-status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.provisionStatus === "ready") {
          onReady();
        } else if (data.provisionStatus === "failed") {
          setFailedBanner(true);
          onFailed();
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [id, onReady, onFailed]);

  if (dismissed) return null;

  if (failedBanner) {
    return (
      <div className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
        <span className="text-base shrink-0">❌</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-red-300">{t("provisioning.failedTitle")}</div>
          <div className="text-xs text-red-400/80 mt-0.5">{t("provisioning.failedDesc")}</div>
        </div>
        <button onClick={() => { setDismissed(true); onDismiss(); }} className="text-red-500 hover:text-red-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
      <span className="text-base shrink-0 mt-0.5">⚙️</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-amber-300 mb-1.5">{t("provisioning.bannerTitle")}</div>
        <div className="w-full h-2 bg-amber-900/40 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-amber-400 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs text-amber-500">{getStep(elapsedSec)}</div>
      </div>
      <button onClick={() => { setDismissed(true); onDismiss(); }} className="text-amber-600 hover:text-amber-300 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
