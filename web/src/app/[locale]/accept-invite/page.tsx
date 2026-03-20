"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Invalid invite link."); return; }

    fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setStatus("success");
          // Redirect to forgot-password to set their real password
          setTimeout(() => router.push(`/forgot-password?email=${encodeURIComponent(data.email)}`), 1500);
        } else {
          setStatus("error");
          setErrorMsg(data.error || "Invalid or expired invite link.");
        }
      })
      .catch(() => { setStatus("error"); setErrorMsg("Something went wrong. Please try again."); });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">OpenHelix AI</span>
          </div>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
            <p className="text-zinc-400">Setting up your account…</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Welcome to OpenHelix AI!</h1>
            <p className="text-zinc-400">Redirecting you to set up your password…</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h1 className="text-xl font-bold text-white">Invite link issue</h1>
            <p className="text-zinc-400">{errorMsg}</p>
            <Link href="/sign-up" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              Sign up instead →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
