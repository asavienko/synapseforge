"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { GoogleButton } from "@/components/GoogleButton";
import { HelixLogo } from "@/components/icons/BrandIcons";

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

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        setError(t("error"));
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(t("error"));
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050507] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 -top-40 -left-40 fixed -z-10" />
      <div className="glow-orb w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/15 bottom-20 right-10 fixed -z-10" />
      <div className="glow-orb w-[300px] h-[300px] bg-purple-500/5 dark:bg-purple-500/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fixed -z-10" />

      <div className="w-full max-w-md">
        {/* Glass card container */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] backdrop-blur-xl rounded-2xl p-8">
          {/* Logo area */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white/90">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white/90 mb-2">{t("title")}</h1>
            <p className="text-gray-500 dark:text-white/40 text-sm">{t("subtitle")}</p>
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
              <div className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#050507] px-3 text-gray-400 dark:text-white/25 text-xs">{t("orEmail")}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 dark:text-white/50 text-sm mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-500 dark:text-white/50 text-sm">{t("password")}</label>
                <Link href="/forgot-password" className="text-xs text-blue-400/80 hover:text-blue-300 transition-colors">
                  {t("forgotPassword")}
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
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
          <p className="text-center text-sm text-gray-400 dark:text-white/30 mt-6">
            {t("noAccount")}{" "}
            <Link href="/sign-up" className="text-blue-400/80 hover:text-blue-300 transition-colors font-medium">
              {t("signUpLink")}
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors">
            {t("footerHome")}
          </Link>
          <Link href="/privacy" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors">
            {t("footerPrivacy")}
          </Link>
          <Link href="/terms" className="text-xs text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors">
            {t("footerTerms")}
          </Link>
        </div>
      </div>
    </div>
  );
}
