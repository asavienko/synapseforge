"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Zap, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  missing: { title: "Invalid link", body: "The verification link is missing a token. Please use the link from your email." },
  invalid: { title: "Link not found", body: "This verification link is invalid or has already been used." },
  expired: { title: "Link expired", body: "This verification link has expired. Request a new one from your dashboard." },
};

function VerifyContent() {
  const params = useSearchParams();
  const error = params.get("error");

  if (error) {
    const msg = ERROR_MESSAGES[error] ?? { title: "Something went wrong", body: "Unable to verify your email." };
    return (
      <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{msg.title}</h2>
        <p className="text-zinc-400 text-sm mb-6">{msg.body}</p>
        <Link href="/dashboard" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
          Go to dashboard →
        </Link>
      </div>
    );
  }

  // If we're on this page without error or success, it means the token is being processed
  return (
    <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
      <Clock className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-pulse" />
      <h2 className="text-xl font-semibold text-white mb-2">Verifying…</h2>
      <p className="text-zinc-400 text-sm">Please wait while we verify your email.</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">SynapseForge</span>
          </Link>
        </div>
        <Suspense fallback={<div className="text-center text-zinc-500 text-sm">Loading…</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
