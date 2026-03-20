"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Zap, Loader2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-zinc-400 text-sm">{t("subtitle")}</p>
        </div>

        <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">{t("successTitle")}</h2>
              <p className="text-zinc-400 text-sm mb-6">{t("successMessage")}</p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("backToSignIn")}
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">{t("email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("submit")}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("backToSignIn")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
