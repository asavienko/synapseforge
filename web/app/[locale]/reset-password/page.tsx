"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Zap, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError(t("invalidToken"));
    }
  }, [token, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("invalidToken"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push("/sign-in?reset=1");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {t("invalidToken")}
        </p>
        <Link
          href="/forgot-password"
          className="inline-block mt-4 text-violet-400 hover:text-violet-300 transition-colors"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <>
      {success ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">{t("successTitle")}</h2>
          <p className="text-zinc-400 text-sm">{t("successMessage")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">{t("password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-zinc-600 mt-1">{t("passwordHint")}</p>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">{t("confirmPassword")}</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
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
            disabled={loading || !password || !confirmPassword}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {t("submit")}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");

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
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
