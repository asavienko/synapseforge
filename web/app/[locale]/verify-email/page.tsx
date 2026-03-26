"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle, Mail, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { HelixLogo } from "@/components/icons/BrandIcons";

type State = "check-inbox" | "loading" | "success" | "error" | "resent";

function VerifyContent() {
  const t = useTranslations("verifyEmail");
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [errorType, setErrorType] = useState<string>("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    // No token — user arrived from the dashboard redirect gate (not from email link)
    if (!token) {
      if (error) {
        setErrorType(error);
        setState("error");
      } else {
        setState("check-inbox");
      }
      return;
    }

    // Has token — verify it
    setState("loading");
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.ok) {
          setState("success");
          setTimeout(() => router.push("/dashboard?verified=1"), 2000);
        } else {
          setErrorType(data.error ?? "invalid");
          setState("error");
        }
      })
      .catch(() => {
        setErrorType("default");
        setState("error");
      });
  }, [params, router]);

  async function resendEmail() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (res.ok) {
        setState("resent");
      } else {
        const data = await res.json();
        setErrorType(data.error ?? "default");
        setState("error");
      }
    } catch {
      setErrorType("default");
      setState("error");
    } finally {
      setResending(false);
    }
  }

  // ── Check inbox (no token — came from dashboard gate) ──────────────────────
  if (state === "check-inbox") {
    return (
      <div className="glow-border rounded-2xl p-8 bg-white dark:bg-white/[0.02] text-center">
        <div className="w-14 h-14 rounded-full bg-blue-600/20 dark:bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("checkInboxTitle")}</h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">{t("checkInboxDesc")}</p>
        <button
          onClick={resendEmail}
          disabled={resending}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold text-white mb-4"
        >
          {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {t("resendButton")}
        </button>
        <p className="text-xs text-gray-500 dark:text-zinc-500 mb-6">{t("checkSpam")}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Continue to dashboard →
        </Link>
      </div>
    );
  }

  // ── Resent confirmation ────────────────────────────────────────────────────
  if (state === "resent") {
    return (
      <div className="glow-border rounded-2xl p-8 bg-white dark:bg-white/[0.02] text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("resentTitle")}</h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">{t("resentDesc")}</p>
        <button
          onClick={() => setState("check-inbox")}
          className="text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
        >
          {t("sendAgain")}
        </button>
      </div>
    );
  }

  // ── Verifying (token present, fetching) ───────────────────────────────────
  if (state === "loading") {
    return (
      <div className="glow-border rounded-2xl p-8 bg-white dark:bg-white/[0.02] text-center">
        <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("verifyTitle")}</h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm">{t("verifyDesc")}</p>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (state === "success") {
    return (
      <div className="glow-border rounded-2xl p-8 bg-white dark:bg-white/[0.02] text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">✅ {t("successTitle")}</h2>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">{t("successDesc")}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        >
          {t("goToDashboard")}
        </Link>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  const errorKey = (["expired", "missing", "invalid", "default"].includes(errorType)
    ? errorType
    : "default") as "expired" | "missing" | "invalid" | "default";

  return (
    <div className="glow-border rounded-2xl p-8 bg-white dark:bg-white/[0.02] text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t(`errors.${errorKey}.title`)}</h2>
      <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">{t(`errors.${errorKey}.body`)}</p>
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={resendEmail}
          disabled={resending}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        >
          {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          {t("resendButton")}
        </button>
        <Link href="/sign-in" className="text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">
          {t("backToSignIn")}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations("verifyEmail");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white/90">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="glow-border rounded-2xl p-8 bg-white dark:bg-white/[0.02] text-center">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500 dark:text-zinc-400 text-sm">{t("loading")}</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
