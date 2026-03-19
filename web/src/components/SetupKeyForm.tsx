"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";

type Provider = "openai" | "anthropic" | "openrouter";

const PROVIDER_KEY: Record<Provider, string> = {
  openai: "openai_api_key",
  anthropic: "anthropic_api_key",
  openrouter: "openrouter_api_key",
};

const PROVIDER_PLACEHOLDER: Record<Provider, string> = {
  openai: "sk-...",
  anthropic: "sk-ant-...",
  openrouter: "sk-or-...",
};

const PROVIDER_LABEL_KEY: Record<Provider, "providerOpenAI" | "providerAnthropic" | "providerOpenRouter"> = {
  openai: "providerOpenAI",
  anthropic: "providerAnthropic",
  openrouter: "providerOpenRouter",
};

export function SetupKeyForm() {
  const t = useTranslations("setupKey");
  const router = useRouter();
  const searchParams = useSearchParams();
  const instanceIdFromQuery = searchParams.get("instance");

  const [provider, setProvider] = useState<Provider>("openai");
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!keyValue.trim()) return;
    setSaving(true);
    setError("");

    try {
      // Resolve instanceId — use query param if present, otherwise fetch first instance
      let instanceId = instanceIdFromQuery;
      if (!instanceId) {
        const res = await fetch("/api/instances");
        if (res.ok) {
          const instances = await res.json() as { id: string }[];
          if (instances.length > 0) instanceId = instances[0].id;
        }
      }

      if (!instanceId) {
        setError(t("error"));
        setSaving(false);
        return;
      }

      const credKey = PROVIDER_KEY[provider];
      const res = await fetch(`/api/instances/${instanceId}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: credKey, value: keyValue.trim() }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Provider tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
        {(["openai", "anthropic", "openrouter"] as Provider[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setProvider(p); setKeyValue(""); setError(""); }}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${
              provider === p
                ? "bg-violet-600 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t(PROVIDER_LABEL_KEY[p])}
          </button>
        ))}
      </div>

      {/* Key input */}
      <input
        type="password"
        value={keyValue}
        onChange={(e) => setKeyValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
        placeholder={PROVIDER_PLACEHOLDER[provider]}
        autoComplete="off"
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
      />

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || saved || !keyValue.trim()}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-xl text-sm font-semibold text-white"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("saving")}
          </>
        ) : saved ? (
          t("saved")
        ) : (
          <>
            {t("save")}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Alt providers note */}
      {provider === "openai" && (
        <p className="text-xs text-zinc-500 text-center">{t("altProviders")}</p>
      )}
    </div>
  );
}
