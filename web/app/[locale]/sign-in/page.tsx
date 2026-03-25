"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { GoogleButton } from "@/components/GoogleButton";

export default function SignInPage() {
  const t = useTranslations("auth.signIn");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    setRegistered(new URLSearchParams(window.location.search).get("registered") === "1");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError(t("error"));
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-violet-500/20 -top-40 -left-40 fixed -z-10" />
      <div className="glow-orb w-[400px] h-[400px] bg-indigo-500/15 bottom-20 right-10 fixed -z-10" />
      <div className="glow-orb w-[300px] h-[300px] bg-purple-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed -z-10" />

      <div className="w-full max-w-md">
        {/* Glass card container */}
        <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl rounded-2xl p-8">
          {/* Logo area */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-violet-400" />
              <span className="text-xl font-bold text-white/90 tracking-tight">OpenHelix AI</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-white/90 mb-2">{t("title")}</h1>
            <p className="text-white/40 text-sm">{t("subtitle")}</p>
          </div>

          {/* Success banner */}
          {registered && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">{t("accountCreated")}</p>
            </div>
          )}

          {/* Google OAuth */}
          <div className="mb-6">
            <GoogleButton callbackUrl="/dashboard" />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050507] px-3 text-white/25 text-xs">{t("orEmail")}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-white/50 text-sm">{t("password")}</label>
                <Link href="/forgot-password" className="text-xs text-violet-400/80 hover:text-violet-300 transition-colors">
                  {t("forgotPassword")}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="glass-btn-primary w-full py-3 rounded-xl font-semibold text-base text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("submit")}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-white/30 mt-6">
            {t("noAccount")}{" "}
            <Link href="/sign-up" className="text-violet-400/80 hover:text-violet-300 transition-colors font-medium">
              {t("signUpLink")}
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            {t("footerHome")}
          </Link>
          <Link href="/privacy" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            {t("footerPrivacy")}
          </Link>
          <Link href="/terms" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            {t("footerTerms")}
          </Link>
        </div>
      </div>
    </div>
  );
}
