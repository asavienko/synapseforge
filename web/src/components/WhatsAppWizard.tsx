"use client";

import { useState } from "react";
import { Check, Loader2, Send, Copy, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// ─── Webhook URL display (client-only, needs window.location) ─────────────────

function WebhookUrlRow() {
  const [copied, setCopied] = useState(false);
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/webhooks/whatsapp`
    : "/api/webhooks/whatsapp";

  return (
    <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
      <code className="flex-1 text-xs text-zinc-300 font-mono break-all">{webhookUrl}</code>
      <button
        onClick={() => { navigator.clipboard.writeText(webhookUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="shrink-0 text-xs text-violet-400 hover:text-violet-300 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = "step1" | "step2" | "step2_saving" | "step2_error" | "step3" | "live";

export interface WhatsAppWizardProps {
  instanceId: string;
  initialCreds?: { accountSid: string; number: string } | null;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WhatsAppWizard({ instanceId, initialCreds, className }: WhatsAppWizardProps) {
  const t = useTranslations("instanceDetail.credentials.whatsapp");

  const [step, setStep] = useState<WizardStep>(initialCreds ? "live" : "step1");
  const [form, setForm] = useState({ accountSid: "", authToken: "", number: "" });
  const [error, setError] = useState<string | null>(null);
  const [liveNumber, setLiveNumber] = useState<string | null>(initialCreds?.number ?? null);
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const stepIndex = step === "step1"
    ? 0
    : step === "step2" || step === "step2_saving" || step === "step2_error"
      ? 1
      : 2; // step3 or live

  const steps = [t("wizardStep1"), t("wizardStep2"), t("wizardStep3")];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleNext() {
    if (!form.accountSid.trim() || !form.authToken.trim() || !form.number.trim()) return;
    setError(null);
    setStep("step2");
  }

  async function handleSaveVerify() {
    setStep("step2_saving");
    setError(null);
    try {
      const res = await fetch(`/api/instances/${instanceId}/setup-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountSid: form.accountSid.trim(),
          authToken: form.authToken.trim(),
          whatsappNumber: form.number.trim(),
        }),
      });
      const data = await res.json() as { ok?: boolean; error?: string; number?: string };
      if (!res.ok) {
        setError(data.error ?? t("saveFailed"));
        setStep("step2_error");
      } else {
        setLiveNumber(data.number ?? form.number.trim());
        setStep("step3");
      }
    } catch {
      setError(t("saveFailed"));
      setStep("step2_error");
    }
  }

  async function handleSendTest() {
    if (!testPhone.trim()) return;
    setTestSending(true);
    setTestSent(false);
    try {
      const res = await fetch(`/api/instances/${instanceId}/test-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testPhone.trim() }),
      });
      if (res.ok) {
        setTestSent(true);
      } else {
        const data = await res.json() as { error?: string };
        setError(data.error ?? t("saveFailed"));
      }
    } catch {
      setError(t("saveFailed"));
    }
    setTestSending(false);
  }

  function handleGoLive() {
    setStep("live");
  }

  function handleEditCreds() {
    setStep("step1");
    setForm({ accountSid: "", authToken: "", number: "" });
    setError(null);
    setTestSent(false);
    setTestPhone("");
  }

  function handleCopyNumber() {
    const num = liveNumber ?? "";
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const isLive = step === "live";

  return (
    <div className={cn("glow-border rounded-2xl bg-white/[0.02] overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-lg">
          💬
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
          <p className="text-xs text-zinc-500 truncate">{t("desc")}</p>
        </div>
        {isLive && (
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
            {t("connected")}
          </span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Step indicator (hidden on live state) */}
        {!isLive && (
          <div className="flex items-center gap-1 sm:gap-2">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-1 sm:gap-2 min-w-0">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors",
                  i < stepIndex
                    ? "bg-violet-600 text-white"
                    : i === stepIndex
                      ? "bg-violet-600 text-white ring-2 ring-violet-400/40"
                      : "bg-white/10 text-zinc-500"
                )}>
                  {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs truncate hidden sm:block",
                  i === stepIndex ? "text-violet-300 font-medium" : "text-zinc-500"
                )}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "h-px flex-1 mx-1 min-w-[12px]",
                    i < stepIndex ? "bg-violet-600" : "bg-white/10"
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Enter Credentials ── */}
        {step === "step1" && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-300">
              {t("twilioNote")}
            </div>

            {/* Account SID */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("accountSidLabel")}</label>
              <input
                type="text"
                value={form.accountSid}
                onChange={(e) => setForm((f) => ({ ...f, accountSid: e.target.value }))}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
            </div>

            {/* Auth Token */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("authTokenLabel")}</label>
              <input
                type="password"
                value={form.authToken}
                onChange={(e) => setForm((f) => ({ ...f, authToken: e.target.value }))}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("whatsappNumberLabel")}</label>
              <input
                type="text"
                value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                placeholder="+14155238886"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
            </div>

            <p className="text-xs text-zinc-500">
              <a
                href="https://console.twilio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                {t("getCredentialsHint")}
              </a>
            </p>

            <button
              onClick={handleNext}
              disabled={!form.accountSid.trim() || !form.authToken.trim() || !form.number.trim()}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            >
              {t("nextBtn")}
            </button>
          </div>
        )}

        {/* ── Step 2: Verify & Save ── */}
        {(step === "step2" || step === "step2_saving" || step === "step2_error") && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-500">{t("accountSidLabel")}:</span>
                  <span className="font-mono text-zinc-300 truncate">
                    {form.accountSid.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-500">{t("whatsappNumberLabel")}:</span>
                  <span className="font-mono text-zinc-300">{form.number}</span>
                </div>
              </div>
            </div>

            {/* Error */}
            {step === "step2_error" && error && (
              <div className="flex items-start gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => { setStep("step1"); setError(null); }}
                disabled={step === "step2_saving"}
                className="flex-1 text-sm text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
              >
                {t("backToFix")}
              </button>
              <button
                onClick={handleSaveVerify}
                disabled={step === "step2_saving"}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                {step === "step2_saving" && <Loader2 className="w-4 h-4 animate-spin" />}
                {step === "step2_saving" ? t("verifying") : t("saveVerifyBtn")}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Test Message ── */}
        {step === "step3" && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
            {/* Connected checkmark */}
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{t("credentialsSaved")}</span>
            </div>

            {/* Test send form */}
            {!testSent ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">{t("sendTestMessage")}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder={t("testNumberPlaceholder")}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                  />
                  <button
                    onClick={handleSendTest}
                    disabled={testSending || !testPhone.trim()}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
                  >
                    {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {t("sendTestBtn")}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-3 py-2.5">
                <Check className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium">{t("testSentLive")}</span>
              </div>
            )}

            {/* Skip / Go live */}
            <div className="flex flex-col gap-2">
              {(testSent) && (
                <button
                  onClick={handleGoLive}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                >
                  {t("liveTitle")} 🎉
                </button>
              )}
              <button
                onClick={handleGoLive}
                className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1.5"
              >
                {t("skipTest")}
              </button>
            </div>
          </div>
        )}

        {/* ── Live / Completion State ── */}
        {isLive && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="text-center space-y-1.5">
              <div className="text-3xl">🎉</div>
              <h4 className="text-base font-semibold text-white">{t("liveTitle")}</h4>
              <p className="text-xs text-zinc-400">{t("liveHint")}</p>
            </div>

            {/* ── Critical: Twilio Webhook URL ── */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-amber-300">⚠️ One required step in Twilio</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                In your <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Twilio console</a>, go to your WhatsApp Sender → Messaging → Webhook URL and paste this:
              </p>
              <WebhookUrlRow />
            </div>

            {liveNumber && (
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-sm font-mono text-zinc-200 break-all">{liveNumber}</span>
                <button
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {t("copyNumber")}
                </button>
              </div>
            )}

            <button
              onClick={handleEditCreds}
              className="w-full text-xs text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors"
            >
              {t("editCreds")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
