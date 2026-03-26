"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2, Mail, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function EmailVerificationBanner({ email }: { email?: string | null }) {
  const t = useTranslations("auth.verifyEmail");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function resendEmail() {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(t("resendSuccess") || "Verification email sent! Check your inbox.");
      } else {
        setError(data.error || t("resendError") || "Failed to send email. Please try again.");
      }
    } catch {
      setError(t("resendError") || "Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-200">{t("bannerTitle") || "Verify your email"}</h3>
          <p className="text-xs text-amber-200/70 mt-1">
            {t("bannerDesc") || `Please verify your email address${email ? ` (${email})` : ""} to access all features. Check your inbox for the verification link.`}
          </p>
          
          {message && (
            <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">{message}</div>
          )}
          {error && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={resendEmail}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-200 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              {loading ? t("sending") || "Sending..." : t("resend") || "Resend email"}
            </button>
            
            <Link
              href="/verify-email"
              className="text-xs text-amber-300/70 hover:text-amber-200 transition-colors"
            >
              {t("moreOptions") || "More options →"}
            </Link>
          </div>
        </div>
        
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-300/50 hover:text-amber-200 transition-colors p-1"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}