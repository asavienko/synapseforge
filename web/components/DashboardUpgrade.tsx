"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardUpgrade({ currentPlan }: { currentPlan: string; hasManager?: boolean }) {
  const t = useTranslations("common");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (currentPlan !== "free") return null;

  async function requestUpgrade() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestedPlan: "pro" }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("upgradeRequestError"));
    }
  }

  if (sent) {
    return (
      <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
        <Check className="w-3 h-3" /> {t("upgradeRequestSent")}
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={requestUpgrade}
        disabled={loading}
        className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors flex items-center gap-1 mt-0.5"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
        {loading ? t("sendingUpgrade") : t("requestUpgradePro")}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
