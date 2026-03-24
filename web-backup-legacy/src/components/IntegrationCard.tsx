"use client";

import { useState } from "react";
import { ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface IntegrationCardProps {
  name: string;
  icon: string;
  description: string;
  docsUrl: string;
  credKey: string;
  placeholder: string;
  enabled: boolean;
  instanceId: string;
  onSave: (key: string, value: string) => Promise<void>;
  onTest?: (toolName: string) => Promise<string>;
  toolName?: string; // tool to test with this credential
}

export function IntegrationCard({
  name,
  icon,
  description,
  docsUrl,
  credKey,
  placeholder,
  enabled,
  instanceId: _instanceId,
  onSave,
  onTest,
  toolName,
}: IntegrationCardProps) {
  const t = useTranslations("integrationCard");
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    await onSave(credKey, value.trim());
    setValue("");
    setSaving(false);
  }

  async function handleTest() {
    if (!toolName || !onTest) return;
    setTesting(true);
    const result = await onTest(toolName);
    setTestResult(result.slice(0, 200));
    setTesting(false);
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        enabled
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-white/8 bg-white/3"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white">{name}</h4>
            {enabled && (
              <span className="text-xs text-emerald-400 font-medium">
                ✓ {t("connected")}
              </span>
            )}
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-400 ml-auto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{description}</p>

          {/* Key input */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={enabled ? t("updateKey") : placeholder}
                className="w-full bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 pr-8 focus:outline-none focus:border-violet-500/50"
              />
              <button
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600"
                type="button"
              >
                {show ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={!value.trim() || saving}
              className="px-3 py-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-lg transition-colors"
              type="button"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("save")
              )}
            </button>
          </div>

          {/* Test button */}
          {enabled && toolName && onTest && (
            <div className="mt-2">
              <button
                onClick={handleTest}
                disabled={testing}
                className="text-xs text-zinc-500 hover:text-violet-400 transition-colors flex items-center gap-1"
                type="button"
              >
                {testing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "⚡"
                )}{" "}
                {t("testConnection")}
              </button>
              {testResult && (
                <p className="text-xs text-zinc-500 mt-1 font-mono truncate">
                  {testResult}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
