"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { WizardState } from "../types";

interface SuccessStepProps {
  state: WizardState;
  error: string;
  createdInstanceId: string | null;
  onClose: () => void;
}

export function SuccessStep({ state, error, createdInstanceId, onClose }: SuccessStepProps) {
  const t = useTranslations("instanceSetup");
  const router = useRouter();

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{t("deploy.success")}</h3>
      {state.deployMode === "hetzner" && !error && (
        <p className="text-sm text-zinc-400">{t("deploy.provisioningNote")}</p>
      )}
      {error && (
        <p className="text-sm text-amber-300 mt-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="mt-6 flex flex-col gap-3">
        {createdInstanceId && (
          <button
            onClick={() => {
              onClose();
              router.push(`/dashboard/instances/${createdInstanceId}` as Parameters<typeof router.push>[0]);
            }}
            className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl text-sm font-semibold text-white"
          >
            {state.deployMode === "hetzner" ? "Monitor deployment →" : "Go to instance →"}
          </button>
        )}
        <button
          onClick={onClose}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
