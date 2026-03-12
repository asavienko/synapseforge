"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Zap, Loader2, Check, Gift } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { GoogleButton } from "@/components/GoogleButton";

/** Read referral code: prefer URL ?ref=, fallback to cookie */
function getReferralCode(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)referral_code=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SignUpPage() {
  const t = useTranslations("auth.signUp");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Prefer URL param; fall back to cookie
    const refFromUrl = searchParams.get("ref");
    const refFromCookie = getReferralCode();
    setReferralCode(refFromUrl ?? refFromCookie);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, referralCode: referralCode ?? undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong.");
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/sign-in?registered=1");
    } else {
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight text-white">SynapseForge</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-zinc-400 mt-2 text-sm">{t("subtitle")}</p>
        </div>

        <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
          {/* Referral banner */}
          {referralCode && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5">
              <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                You were invited! You&apos;ll get <span className="font-semibold">1 free month</span> when you upgrade.
              </p>
            </div>
          )}
          {/* Google OAuth — fastest path to sign up */}
          <div className="mb-6">
            <GoogleButton callbackUrl="/onboarding" referralCode={referralCode ?? undefined} />
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#111113] px-3 text-zinc-500">or sign up with email</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-6">
            <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="text-violet-300 font-medium mb-1">Free plan includes:</div>
              <div className="text-zinc-400 space-y-0.5">
                {["1 AI instance (minimal tier)", "Dedicated manager assigned", "Upgrade by request anytime"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t("name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t("password")}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                placeholder={t("passwordHint")}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-lg font-semibold text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t("submit")}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          {t("hasAccount")}{" "}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 transition-colors">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
