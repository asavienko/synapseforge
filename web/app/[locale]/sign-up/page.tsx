"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Zap, Loader2, Check, Gift } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { GoogleButton } from "@/components/GoogleButton";
import zxcvbn from "zxcvbn";
import { analytics } from "@/lib/analytics";

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
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [emailError, setEmailError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailRegistered, setEmailRegistered] = useState(false);

  // Debounced email availability check
  useEffect(() => {
    if (!form.email || !form.email.includes("@")) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(form.email)}`);
        const data = await res.json();
        setEmailAvailable(data.valid);
        if (!data.valid && data.error === "already_registered") {
          setEmailError(t("alreadyRegistered"));
          setEmailRegistered(true);
        } else if (!data.valid && data.error === "invalid_format") {
          setEmailError(t("invalidEmail"));
          setEmailRegistered(false);
        } else {
          setEmailError("");
          setEmailRegistered(false);
        }
      } catch {
        // Silently fail - let server handle validation
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.email, t]);

  useEffect(() => {
    // Prefer URL param; fall back to cookie
    const refFromUrl = searchParams.get("ref");
    const refFromCookie = getReferralCode();
    setReferralCode(refFromUrl ?? refFromCookie);
    analytics.signupStarted();

    // Store template ID for onboarding pre-fill
    const templateId = searchParams.get("template");
    if (templateId) {
      sessionStorage.setItem("pendingTemplate", templateId);
    }
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
      setError(data.error || t("somethingWrong"));
      return;
    }

    // Show success state before redirect
    setSuccess(true);
    analytics.signupCompleted("email");

    // Delay redirect to show success message
    setTimeout(async () => {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/sign-in?registered=1");
      } else {
        const tmplId = searchParams.get("template") ?? sessionStorage.getItem("pendingTemplate");
        router.push(tmplId ? `/onboarding?template=${tmplId}` : "/onboarding");
      }
    }, 1500);
  }

  const isAlreadyRegistered =
    error &&
    (error.toLowerCase().includes("already") || error.toLowerCase().includes("exists"));

  const strengthLabels: Array<"tooWeak" | "weak" | "fair" | "strong" | "veryStrong"> = [
    "tooWeak",
    "weak",
    "fair",
    "strong",
    "veryStrong",
  ];

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient glow orbs */}
      <div className="glow-orb w-[500px] h-[500px] bg-violet-500/20 -top-40 -right-40 fixed -z-10" />
      <div className="glow-orb w-[400px] h-[400px] bg-indigo-500/15 bottom-10 left-10 fixed -z-10" />
      <div className="glow-orb w-[300px] h-[300px] bg-purple-500/10 top-1/3 left-1/2 -translate-x-1/2 fixed -z-10" />

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

          {/* Referral banner */}
          {referralCode && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6">
              <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-sm text-emerald-300">
                You were invited! You&apos;ll get <span className="font-semibold">1 free month</span> when you upgrade.
              </p>
            </div>
          )}

          {/* Google OAuth */}
          <div className="mb-6">
            <GoogleButton callbackUrl={searchParams.get("template") ? `/onboarding?template=${searchParams.get("template")}` : "/onboarding"} referralCode={referralCode ?? undefined} />
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

          {/* Features list */}
          <div className="flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-6">
            <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="text-violet-300 font-medium mb-1">{t("freePlanTitle")}</div>
              <div className="text-white/40 space-y-0.5">
                {[t("freePlan1"), t("freePlan2"), t("freePlan3")].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1.5">{t("name")}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder={t("namePlaceholder")}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1.5">{t("email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val && !val.includes("@")) {
                    setEmailError(t("invalidEmail"));
                  } else {
                    setEmailError("");
                  }
                }}
                required
                placeholder="you@company.com"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
              {emailError && (
                <p className="text-xs text-red-400 mt-1">{emailError}</p>
              )}
              {!emailError && emailAvailable === true && form.email.includes("@") && (
                <p className="text-xs text-emerald-400 mt-1">✓ Email available</p>
              )}
              {emailChecking && (
                <p className="text-xs text-white/30 mt-1">Checking...</p>
              )}
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1.5">{t("password")}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (e.target.value) {
                    setPasswordStrength(zxcvbn(e.target.value).score as 0 | 1 | 2 | 3 | 4);
                  } else {
                    setPasswordStrength(0);
                  }
                }}
                required
                minLength={8}
                placeholder={t("passwordHint")}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength
                            ? passwordStrength <= 1
                              ? "bg-red-500"
                              : passwordStrength === 2
                              ? "bg-amber-500"
                              : passwordStrength === 3
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs ${
                      passwordStrength <= 1
                        ? "text-red-400"
                        : passwordStrength === 2
                        ? "text-amber-400"
                        : passwordStrength === 3
                        ? "text-blue-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {t(`passwordStrength.${strengthLabels[passwordStrength]}`)}
                  </p>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              isAlreadyRegistered ? (
                <div className="text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                  <span className="text-amber-300">{t("alreadyRegistered")}</span>
                  {" → "}
                  <Link href="/sign-in" className="text-violet-400/80 hover:text-violet-300 font-semibold transition-colors">
                    {t("signInInstead")}
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || success}
              className="glass-btn-primary w-full py-3 rounded-xl font-semibold text-base text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || success ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {success ? t("creatingAccount") : t("submit")}
            </button>
          </form>

          {/* Success Banner */}
          {success && (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-emerald-300 font-medium">{t("successTitle")}</p>
              <p className="text-emerald-400/70 text-sm mt-1">{t("successMessage")}</p>
            </div>
          )}
        </div>

        {/* Sign in link */}
        <p className="text-center text-sm text-white/30 mt-6">
          {t("hasAccount")}{" "}
          <Link href="/sign-in" className="text-violet-400/80 hover:text-violet-300 transition-colors font-medium">
            {t("signInLink")}
          </Link>
        </p>

        {/* Footer links */}
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            Home
          </Link>
          <Link href="/privacy" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-white/30 hover:text-white/50 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
