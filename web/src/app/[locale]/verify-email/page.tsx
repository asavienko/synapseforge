"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import { useTranslations } from "next-intl";

type State = "loading" | "success" | "error";

function VerifyContent() {
  const t = useTranslations("verifyEmail");
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [errorType, setErrorType] = useState<string>("");

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    // Came from old redirect-based flow with an error param
    if (error && !token) {
      setErrorType(error);
      setState("error");
      return;
    }

    if (!token) {
      setErrorType("missing");
      setState("error");
      return;
    }

    // Call the verification API
    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (data.ok) {
          setState("success");
          // Redirect to dashboard after a short delay
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

  if (state === "loading") {
    return (
      <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
        <Loader2 className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-semibold text-white mb-2">{t("verifyTitle")}</h2>
        <p className="text-zinc-400 text-sm">{t("verifyDesc")}</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">✅ {t("successTitle")}</h2>
        <p className="text-zinc-400 text-sm mb-6">{t("successDesc")}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
        >
          {t("goToDashboard")}
        </Link>
      </div>
    );
  }

  // Error state — use errorType to look up translated error messages
  const errorKey = (["expired", "missing", "invalid", "default"].includes(errorType) ? errorType : "default") as
    | "expired"
    | "missing"
    | "invalid"
    | "default";

  return (
    <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">
        {t(`errors.${errorKey}.title`)}
      </h2>
      <p className="text-zinc-400 text-sm mb-6">
        {t(`errors.${errorKey}.body`)}
      </p>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          {t("requestNewLink")}
        </Link>
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {t("goDashboard")}
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  const t = useTranslations("verifyEmail");
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">SynapseForge</span>
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
              <Loader2 className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-spin" />
              <p className="text-zinc-400 text-sm">{t("loading")}</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
