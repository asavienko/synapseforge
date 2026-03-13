"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface SandboxUpgradeCardProps {
  onAddKey: () => void;
}

export function SandboxUpgradeCard({ onAddKey }: SandboxUpgradeCardProps) {
  const t = useTranslations("sandbox");
  const [email, setEmail] = useState("");
  const [notifyState, setNotifyState] = useState<"idle" | "loading" | "done">("idle");
  const [notifyError, setNotifyError] = useState("");

  const handleNotify = async () => {
    if (!email || !email.includes("@")) {
      setNotifyError(t("invalidEmail"));
      return;
    }
    setNotifyState("loading");
    setNotifyError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "sandbox_exhausted" }),
      });
      if (!res.ok) throw new Error("Failed");
      setNotifyState("done");
    } catch {
      setNotifyState("idle");
      setNotifyError(t("notifyError"));
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto my-2">
      {/* Icon + heading */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
          <Zap className="w-4.5 h-4.5 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug">
          {t("usedFreeMessages")}
        </h3>
      </div>

      {/* Subtext */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
        {t("upgradeDesc")}
      </p>

      {/* CTAs */}
      <div className="flex flex-col gap-2 mb-4">
        <a
          href="https://cal.com/synapseforge/setup"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center text-sm font-semibold px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors"
        >
          {t("bookCall")}
        </a>
        <button
          onClick={onAddKey}
          className="w-full text-center text-sm px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/10 rounded-xl transition-colors"
        >
          {t("addApiKey")}
        </button>
      </div>

      {/* Email capture */}
      {notifyState === "done" ? (
        <p className="text-xs text-emerald-400 text-center mt-1">{t("notifySuccess")}</p>
      ) : (
        <div className="flex gap-2 mt-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNotify()}
            placeholder={t("emailPlaceholder")}
            className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            onClick={handleNotify}
            disabled={notifyState === "loading"}
            className="text-xs px-3 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-300 border border-white/10 rounded-lg transition-colors shrink-0"
          >
            {notifyState === "loading" ? "…" : t("notifyMe")}
          </button>
        </div>
      )}
      {notifyError && (
        <p className="text-xs text-red-400 mt-1">{notifyError}</p>
      )}
    </div>
  );
}
