"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [emailVal, setEmailVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailAddress: emailVal }),
    });

    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">OpenHelix AI</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot your password?</h1>
          <p className="text-zinc-400 text-sm">Enter your email and we&apos;ll send a reset link.</p>
        </div>

        {sent ? (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">Check your inbox</h2>
            <p className="text-zinc-400 text-sm mb-6">If an account exists for <strong className="text-zinc-200">{emailVal}</strong>, you&apos;ll receive a password reset link shortly.</p>
            <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={emailVal}
                  onChange={(e) => setEmailVal(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Send reset link
              </button>
            </form>
            <div className="text-center mt-6">
              <Link href="/sign-in" className="flex items-center justify-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
