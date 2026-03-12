"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Zap, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const len = password.length;
  let label: string;
  let color: string;
  let bars: number;

  if (len < 8) {
    label = "Too short";
    color = "bg-red-500";
    bars = 1;
  } else if (len < 12) {
    label = "Fair";
    color = "bg-yellow-500";
    bars = 2;
  } else {
    label = "Strong";
    color = "bg-emerald-500";
    bars = 3;
  }

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= bars ? color : "bg-white/10"
            )}
          />
        ))}
      </div>
      <p className={cn(
        "text-xs",
        bars === 1 ? "text-red-400" : bars === 2 ? "text-yellow-400" : "text-emerald-400"
      )}>
        {label}
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError(t("mismatch")); return; }
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong.");
      return;
    }

    // Auto-sign-in with the new password
    if (data.email) {
      const result = await signIn("credentials", {
        email: data.email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (!result?.error) {
        router.push("/dashboard");
        return;
      }
    }

    // Fallback: show success + redirect to sign-in
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/sign-in"), 3000);
  }

  if (!token && typeof window !== "undefined") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-zinc-400">
            {t("invalidLink")}{" "}
            <Link href="/forgot-password" className="text-violet-400 hover:text-violet-300">
              {t("requestNew")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">SynapseForge</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>
          <p className="text-zinc-400 text-sm">{t("subtitle")}</p>
        </div>

        {done ? (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">{t("successTitle")}</h2>
            <p className="text-zinc-400 text-sm">{t("successDesc")}</p>
          </div>
        ) : (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">{t("newPassword")}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder={t("passwordHint")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
                <PasswordStrength password={password} />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">{t("confirmPassword")}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder={t("repeatPassword")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Resetting…" : t("submit")}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
