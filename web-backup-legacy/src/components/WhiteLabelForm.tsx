"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface WhiteLabelFormProps {
  initialConfig: {
    brandName: string;
    brandColor: string;
    logoUrl: string;
    customDomain: string;
    hidePoweredBy: boolean;
  };
  isAgency: boolean;
}

export function WhiteLabelForm({ initialConfig, isAgency }: WhiteLabelFormProps) {
  const t = useTranslations("whiteLabel");
  const [form, setForm] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/white-label", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: form.brandName,
          brandColor: form.brandColor,
          logoUrl: form.logoUrl || null,
          customDomain: form.customDomain || null,
          hidePoweredBy: form.hidePoweredBy,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          {t("brandName")}
        </label>
        <input
          type="text"
          value={form.brandName}
          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
          placeholder="OpenHelix AI"
        />
      </div>

      {/* Brand Color */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          {t("brandColor")}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.brandColor}
            onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
            className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={form.brandColor}
            onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
            placeholder="#7c3aed"
          />
        </div>
      </div>

      {/* Logo URL */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          {t("logoUrl")}
        </label>
        <input
          type="url"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
          placeholder="https://example.com/logo.png"
        />
      </div>

      {/* Custom Domain */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
          {t("customDomain")}
          {!isAgency && (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {t("agencyRequired")}
            </span>
          )}
        </label>
        <input
          type="text"
          value={form.customDomain}
          onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
          disabled={!isAgency}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="app.yourdomain.com"
        />
      </div>

      {/* Hide Powered By */}
      <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5">
        <label className="text-sm text-zinc-300 cursor-pointer select-none" htmlFor="hidePoweredBy">
          {t("hidePoweredBy")}
        </label>
        <button
          id="hidePoweredBy"
          type="button"
          role="switch"
          aria-checked={form.hidePoweredBy}
          onClick={() => setForm({ ...form, hidePoweredBy: !form.hidePoweredBy })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            form.hidePoweredBy ? "bg-violet-600" : "bg-zinc-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              form.hidePoweredBy ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
      >
        {saved ? t("saved") : saving ? "..." : t("save")}
      </button>
    </form>
  );
}
