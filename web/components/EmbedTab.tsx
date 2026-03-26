"use client";

import { useState } from "react";
import { Copy, Check, Code, Palette, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

interface EmbedTabProps {
  instanceId: string;
  instanceName: string;
  referralCode?: string;
}

export function EmbedTab({ instanceId, instanceName, referralCode }: EmbedTabProps) {
  const t = useTranslations("embedTab");
  const [copied, setCopied] = useState(false);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");
  const [color, setColor] = useState("#8b5cf6");
  const [greeting, setGreeting] = useState(`Hi! I'm ${instanceName}. How can I help you today?`);
  const [showBranding, setShowBranding] = useState(true);

  const embedCode = `<!-- OpenHelix AI Chat Widget -->
<script 
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"
  data-instance-id="${instanceId}"
  data-position="${position}"
  data-color="${color}"
  data-greeting="${greeting}"
  data-branding="${showBranding}"${referralCode ? `\n  data-ref="${referralCode}"` : ''}></script>
<!-- End OpenHelix AI Chat Widget -->`.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("embedCodeTitle")}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-500">{t("embedCodeDesc")}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <pre className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-xs text-gray-700 dark:text-zinc-300 font-mono overflow-x-auto">
              {embedCode}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-200 dark:bg-white/10 hover:bg-white/20 text-xs text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t("copied")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t("copy")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customization */}
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("customizeTitle")}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-500">{t("customizeDesc")}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Position */}
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-2 block">{t("positionLabel")}</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPosition("bottom-right")}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  position === "bottom-right"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:bg-white/10"
                }`}
              >
                {t("positionRight")}
              </button>
              <button
                onClick={() => setPosition("bottom-left")}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  position === "bottom-left"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:bg-white/10"
                }`}
              >
                {t("positionLeft")}
              </button>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-2 block">{t("colorLabel")}</label>
            <div className="flex gap-2">
              {["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#000000"].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-colors ${
                    color === c ? "border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Greeting */}
          <div>
            <label className="text-xs text-gray-500 dark:text-zinc-400 mb-2 block">{t("greetingLabel")}</label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder={t("greetingPlaceholder")}
            />
          </div>

          {/* Branding */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-zinc-400">{t("brandingLabel")}</span>
            <button
              onClick={() => setShowBranding(!showBranding)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                showBranding ? "bg-blue-600" : "bg-gray-200 dark:bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  showBranding ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("installTitle")}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-500">{t("installDesc")}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <ol className="text-sm text-gray-500 dark:text-zinc-400 space-y-2 list-decimal list-inside">
            <li>{t("step1")}</li>
            <li>{t("step2")} <code className="text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800/50 px-1 rounded">&lt;/body&gt;</code></li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
          </ol>

          <div className="mt-4 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-300">{t("proTip")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
