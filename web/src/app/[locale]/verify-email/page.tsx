"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, AlertCircle, Clock } from "lucide-react";
import { Suspense } from "react";
import { useTranslations } from "next-intl";

function VerifyContent() {
  const t = useTranslations("verifyEmail");
  const params = useSearchParams();
  const error = params.get("error");

  if (error) {
    const key = ["missing", "invalid", "expired"].includes(error) ? error : "default";
    return (
      <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{t(`errors.${key}.title` as Parameters<typeof t>[0])}</h2>
        <p className="text-zinc-400 text-sm mb-6">{t(`errors.${key}.body` as Parameters<typeof t>[0])}</p>
        <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
          {t("goDashboard")}
        </Link>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
      <Clock className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-pulse" />
      <h2 className="text-xl font-semibold text-white mb-2">{t("verifying")}</h2>
      <p className="text-zinc-400 text-sm">{t("verifyingDesc")}</p>
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
        <Suspense fallback={<div className="text-center text-zinc-500 text-sm">{t("loading")}</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
