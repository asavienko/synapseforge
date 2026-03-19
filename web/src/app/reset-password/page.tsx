"use client";
/**
 * Root /reset-password — redirects to the locale-aware version preserving query params.
 * The password reset email sends users here; the actual UI is at /[locale]/reset-password.
 */
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Zap } from "lucide-react";

function RedirectToLocale() {
  const params = useSearchParams();
  useEffect(() => {
    const qs = params.toString();
    window.location.replace(`/en/reset-password${qs ? `?${qs}` : ""}`);
  }, [params]);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center animate-pulse">
        <Zap className="w-6 h-6 text-violet-400" />
      </div>
      <p className="text-zinc-500 text-sm">Loading…</p>
    </div>
  );
}

export default function ResetPasswordRootPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Suspense fallback={<div className="text-zinc-500 text-sm">Loading…</div>}>
          <RedirectToLocale />
        </Suspense>
      </div>
    </div>
  );
}
