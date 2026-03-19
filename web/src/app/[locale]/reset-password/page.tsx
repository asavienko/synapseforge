"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Zap, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Missing or invalid reset link. Please request a new one.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02] text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Password updated!</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Your password has been reset. You can now sign in with your new password.
        </p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02]">
      {!token && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Invalid reset link. Please{" "}
          <Link href="/forgot-password" className="underline hover:text-red-300 ml-1">
            request a new one
          </Link>.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">New password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!token}
              placeholder="Min. 8 characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Confirm new password</label>
          <input
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={!token}
            placeholder="Repeat password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:opacity-50"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Reset password
        </button>
      </form>
      <div className="text-center mt-5">
        <Link href="/sign-in" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">OpenHelix AI</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
          <p className="text-zinc-400 text-sm">Choose a strong password for your account.</p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
