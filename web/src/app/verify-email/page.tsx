/**
 * Root /verify-email page — redirects to the locale-aware version.
 *
 * The verification email sends users to /verify-email?token=..., but the
 * actual verification logic lives at /[locale]/verify-email. This page
 * preserves all query params and forwards the user instantly.
 *
 * Using a client-side redirect to preserve all search params (token, error).
 * A server-side redirect at this level can't read search params reliably.
 */
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Zap } from "lucide-react";

function RedirectToLocale() {
  const params = useSearchParams();

  useEffect(() => {
    const qs = params.toString();
    const target = `/en/verify-email${qs ? `?${qs}` : ""}`;
    window.location.replace(target);
  }, [params]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center animate-pulse">
        <Zap className="w-6 h-6 text-violet-400" />
      </div>
      <p className="text-zinc-500 text-sm">Verifying your email…</p>
    </div>
  );
}

export default function VerifyEmailRootPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Suspense fallback={
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-zinc-500 text-sm">Loading…</p>
          </div>
        }>
          <RedirectToLocale />
        </Suspense>
      </div>
    </div>
  );
}
