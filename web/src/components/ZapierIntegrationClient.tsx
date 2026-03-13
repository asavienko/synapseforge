"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ExternalLink, Zap, Check, Copy } from "lucide-react";

const ZAPIER_TRIGGERS = [
  { key: "new_message", icon: "💬", nameKey: "newMessageName", descKey: "newMessageDesc" },
  { key: "instance_deployed", icon: "🚀", nameKey: "instanceDeployedName", descKey: "instanceDeployedDesc" },
  { key: "instance_down", icon: "🔴", nameKey: "instanceDownName", descKey: "instanceDownDesc" },
];

const ZAPIER_ACTIONS = [
  { key: "send_message", icon: "📨", nameKey: "sendMessageName", descKey: "sendMessageDesc" },
];

export function ZapierIntegrationClient() {
  const t = useTranslations("integrations");
  const [copied, setCopied] = useState(false);
  const apiBase =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://synapseforge.ai";

  function copyApiUrl() {
    navigator.clipboard.writeText(`${apiBase}/api/v1/chat`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      {/* Zapier card */}
      <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#FF4A00]/10 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#FF4A00]" />
          </div>
          <div>
            <h2 className="text-white font-semibold">{t("zapier.title")}</h2>
            <p className="text-zinc-500 text-sm">{t("zapier.subtitle")}</p>
          </div>
          <a
            href="https://zapier.com/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            {t("zapier.openZapier")} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Triggers */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {t("zapier.triggers")}
          </h3>
          <div className="space-y-2">
            {ZAPIER_TRIGGERS.map((trigger) => (
              <div
                key={trigger.key}
                className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5"
              >
                <span className="text-xl leading-none mt-0.5">{trigger.icon}</span>
                <div>
                  <p className="text-sm text-white font-medium">{t(`zapier.${trigger.nameKey}`)}</p>
                  <p className="text-xs text-zinc-500">{t(`zapier.${trigger.descKey}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            {t("zapier.actions")}
          </h3>
          <div className="space-y-2">
            {ZAPIER_ACTIONS.map((action) => (
              <div
                key={action.key}
                className="flex items-start gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5"
              >
                <span className="text-xl leading-none mt-0.5">{action.icon}</span>
                <div>
                  <p className="text-sm text-white font-medium">{t(`zapier.${action.nameKey}`)}</p>
                  <p className="text-xs text-zinc-500">{t(`zapier.${action.descKey}`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* API endpoint card */}
      <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">{t("apiEndpoint.title")}</h2>
        <p className="text-zinc-500 text-sm mb-4">{t("apiEndpoint.subtitle")}</p>
        <div className="flex items-center gap-2 bg-black/40 rounded-xl px-4 py-3 font-mono text-sm">
          <span className="text-zinc-400 flex-1 truncate">{apiBase}/api/v1/chat</span>
          <button
            onClick={copyApiUrl}
            className="text-zinc-500 hover:text-white transition-colors shrink-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">{t("apiEndpoint.hint")}</p>
      </div>

      {/* Make.com card */}
      <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6 opacity-75">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">{t("make.title")}</h2>
            <p className="text-zinc-500 text-sm mt-1">{t("make.subtitle")}</p>
          </div>
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
            {t("comingSoon")}
          </span>
        </div>
      </div>
    </div>
  );
}
