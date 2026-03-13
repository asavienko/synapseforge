"use client";

import { useState } from "react";
import { MailWarning, X, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function EmailVerifyBanner() {
  const t = useTranslations("auth.verifyEmail");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (dismissed) return null;

  async function resend() {
    setLoading(true);
    await fetch("/api/auth/resend-verification", { method: "POST" });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-3">
      <MailWarning className="w-4 h-4 text-amber-400 shrink-0" />
      <p className="text-sm text-amber-200 flex-1">
        {t("bannerText")}
      </p>
      {sent ? (
        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> {t("resentConfirm")}
        </span>
      ) : (
        <button
          onClick={resend}
          disabled={loading}
          className="text-xs text-amber-300 hover:text-amber-100 underline underline-offset-2 transition-colors shrink-0 flex items-center gap-1"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {t("resendBtn")}
        </button>
      )}
      <button onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-300 transition-colors shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
