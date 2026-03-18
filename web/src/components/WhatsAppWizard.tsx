"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Send, Copy, AlertCircle, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Provider = "twilio" | "meta";
type WizardStep = "provider" | "step1" | "step2" | "step2_saving" | "step2_error" | "step3" | "live";

export interface WhatsAppWizardProps {
  instanceId: string;
  initialCreds?: { accountSid: string; number: string } | null;
  className?: string;
}

interface MetaSetupState {
  phoneNumber: string;
  businessName: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WhatsAppWizard({ instanceId, initialCreds, className }: WhatsAppWizardProps) {
  const t = useTranslations("instanceDetail.credentials.whatsapp");

  const [provider, setProvider] = useState<Provider | null>(null);
  const [step, setStep] = useState<WizardStep>(initialCreds ? "live" : "provider");
  const [metaState, setMetaState] = useState<MetaSetupState>({
    phoneNumber: "",
    businessName: "",
  });
  
  // Twilio form state (for backward compatibility)
  const [twilioForm, setTwilioForm] = useState({
    accountSid: "",
    authToken: "",
    number: "",
  });
  
  const [error, setError] = useState<string | null>(null);
  const [liveNumber, setLiveNumber] = useState<string | null>(initialCreds?.number ?? null);
  const [testPhone, setTestPhone] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [metaStatus, setMetaStatus] = useState<{
    enabled: boolean;
    phoneNumber: string | null;
    businessName: string | null;
  } | null>(null);

  // Check Meta WhatsApp status on mount
  useEffect(() => {
    checkMetaStatus();
  }, []);

  async function checkMetaStatus() {
    try {
      const res = await fetch(`/api/instances/${instanceId}/whatsapp/status`);
      if (res.ok) {
        const data = await res.json();
        setMetaStatus(data);
        
        // If Meta is enabled, switch to live state
        if (data.enabled) {
          setProvider("meta");
          setLiveNumber(data.phoneNumber);
          setStep("live");
        }
      }
    } catch {
      // Ignore errors - Meta integration might not be available
    }
  }

  // ─── Provider Selection ─────────────────────────────────────────────────────

  function handleProviderSelect(selected: Provider) {
    setProvider(selected);
    setStep("step1");
    setError(null);
  }

  // ─── Meta OAuth Flow ────────────────────────────────────────────────────────

  async function handleMetaSetup() {
    if (!metaState.phoneNumber.trim() || !metaState.businessName.trim()) return;
    
    setError(null);
    setStep("step2_saving");

    try {
      const res = await fetch(`/api/instances/${instanceId}/whatsapp/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: metaState.phoneNumber.trim(),
          businessName: metaState.businessName.trim(),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || t("saveFailed"));
        setStep("step2_error");
      } else if (data.authUrl) {
        // Redirect to Meta OAuth
        window.location.href = data.authUrl;
      }
    } catch {
      setError(t("saveFailed"));
      setStep("step2_error");
    }
  }

  // ─── Twilio Flow (Backward Compatibility) ───────────────────────────────────

  function handleTwilioNext() {
    if (!twilioForm.accountSid.trim() || !twilioForm.authToken.trim() || !twilioForm.number.trim()) return;
    setError(null);
    setStep("step2");
  }

  async function handleTwilioSave() {
    setStep("step2_saving");
    setError(null);
    try {
      const res = await fetch(`/api/instances/${instanceId}/setup-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountSid: twilioForm.accountSid.trim(),
          authToken: twilioForm.authToken.trim(),
          whatsappNumber: twilioForm.number.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("saveFailed"));
        setStep("step2_error");
      } else {
        setLiveNumber(data.number ?? twilioForm.number.trim());
        setStep("step3");
      }
    } catch {
      setError(t("saveFailed"));
      setStep("step2_error");
    }
  }

  // ─── Test Message ───────────────────────────────────────────────────────────

  async function handleSendTest() {
    if (!testPhone.trim()) return;
    setTestSending(true);
    setTestSent(false);
    
    try {
      const endpoint = provider === "meta" 
        ? `/api/instances/${instanceId}/whatsapp/test`
        : `/api/instances/${instanceId}/test-whatsapp`;
        
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testPhone.trim() }),
      });
      
      if (res.ok) {
        setTestSent(true);
      } else {
        const data = await res.json();
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
    setTwilioForm({ accountSid: "", authToken: "", number: "" });
    setMetaState({ phoneNumber: "", businessName: "" });
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

  // ─── Disconnect ─────────────────────────────────────────────────────────────

  async function handleDisconnect() {
    if (!confirm(t("disconnectConfirm"))) return;

    try {
      const res = await fetch(`/api/instances/${instanceId}/whatsapp`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setStep("provider");
        setProvider(null);
        setLiveNumber(null);
        setMetaStatus(null);
      } else {
        const data = await res.json();
        setError(data.error || t("disconnectFailed"));
      }
    } catch {
      setError(t("disconnectFailed"));
    }
  }

  // ─── Derived ────────────────────────────────────────────────────────────────

  const stepIndex = step === "provider"
    ? 0
    : step === "step1"
      ? 1
      : step === "step2" || step === "step2_saving" || step === "step2_error"
        ? 2
        : 3; // step3 or live

  const steps = provider === "meta" 
    ? [t("meta.step1"), t("meta.step2"), t("meta.step3"), t("meta.step4")]
    : [t("wizardStep1"), t("wizardStep2"), t("wizardStep3")];

  const isLive = step === "live";

  // ─── Render ─────────────────────────────────────────────────────────────────

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
        {/* Provider Selection */}
        {step === "provider" && (
          <div className="space-y-3">
            <p className="text-xs text-zinc-400">{t("selectProvider")}</p>
            
            <button
              onClick={() => handleProviderSelect("meta")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl shrink-0">
                📘
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{t("meta.title")}</div>
                <div className="text-xs text-zinc-500">{t("meta.desc")}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </button>

            <button
              onClick={() => handleProviderSelect("twilio")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
                ☎️
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{t("twilio.title")}</div>
                <div className="text-xs text-zinc-500">{t("twilio.desc")}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        )}

        {/* Step indicator (hidden on provider selection and live state) */}
        {!isLive && step !== "provider" && (
          <div className="flex items-center gap-1 sm:gap-2">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center gap-1 sm:gap-2 min-w-0">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors",
                  i < stepIndex - 1
                    ? "bg-violet-600 text-white"
                    : i === stepIndex - 1
                      ? "bg-violet-600 text-white ring-2 ring-violet-400/40"
                      : "bg-white/10 text-zinc-500"
                )}>
                  {i < stepIndex - 1 ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className={cn(
                  "text-xs truncate hidden sm:block",
                  i === stepIndex - 1 ? "text-violet-300 font-medium" : "text-zinc-500"
                )}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "h-px flex-1 mx-1 min-w-[12px]",
                    i < stepIndex - 1 ? "bg-violet-600" : "bg-white/10"
                  )} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Enter Details ── */}
        {step === "step1" && provider === "meta" && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 text-xs text-blue-300">
              {t("meta.setupNote")}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("meta.phoneLabel")}</label>
              <input
                type="text"
                value={metaState.phoneNumber}
                onChange={(e) => setMetaState((s) => ({ ...s, phoneNumber: e.target.value }))}
                placeholder="+1234567890"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
              <p className="text-xs text-zinc-600">{t("meta.phoneHint")}</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("meta.businessNameLabel")}</label>
              <input
                type="text"
                value={metaState.businessName}
                onChange={(e) => setMetaState((s) => ({ ...s, businessName: e.target.value }))}
                placeholder={t("meta.businessNamePlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <p className="text-xs text-zinc-500">
              <a
                href="https://business.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
              >
                {t("meta.getStartedHint")}
              </a>
            </p>

            <button
              onClick={handleMetaSetup}
              disabled={!metaState.phoneNumber.trim() || !metaState.businessName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            >
              {t("meta.connectBtn")}
            </button>
          </div>
        )}

        {/* ── Twilio Step 1: Credentials ── */}
        {step === "step1" && provider === "twilio" && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-300">
              {t("twilioNote")}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("accountSidLabel")}</label>
              <input
                type="text"
                value={twilioForm.accountSid}
                onChange={(e) => setTwilioForm((f) => ({ ...f, accountSid: e.target.value }))}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("authTokenLabel")}</label>
              <input
                type="password"
                value={twilioForm.authToken}
                onChange={(e) => setTwilioForm((f) => ({ ...f, authToken: e.target.value }))}
                placeholder="••••••••••••••••••••••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400">{t("whatsappNumberLabel")}</label>
              <input
                type="text"
                value={twilioForm.number}
                onChange={(e) => setTwilioForm((f) => ({ ...f, number: e.target.value }))}
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
              onClick={handleTwilioNext}
              disabled={!twilioForm.accountSid.trim() || !twilioForm.authToken.trim() || !twilioForm.number.trim()}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            >
              {t("nextBtn")}
            </button>
          </div>
        )}

        {/* ── Step 2: Meta OAuth Redirect ── */}
        {step === "step2_saving" && provider === "meta" && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 text-center">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-zinc-300">{t("meta.redirecting")}</p>
            <p className="text-xs text-zinc-500 mt-1">{t("meta.redirectHint")}</p>
          </div>
        )}

        {/* ── Step 2: Verify & Save (Twilio) ── */}
        {(step === "step2" || step === "step2_saving" || step === "step2_error") && provider === "twilio" && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="space-y-2">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-500">{t("accountSidLabel")}:</span>
                  <span className="font-mono text-zinc-300 truncate">
                    {twilioForm.accountSid.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-500">{t("whatsappNumberLabel")}:</span>
                  <span className="font-mono text-zinc-300">{twilioForm.number}</span>
                </div>
              </div>
            </div>

            {step === "step2_error" && error && (
              <div className="flex items-start gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => { setStep("step1"); setError(null); }}
                disabled={step === "step2_saving"}
                className="flex-1 text-sm text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
              >
                {t("backToFix")}
              </button>
              <button
                onClick={handleTwilioSave}
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
            <div className="flex items-center gap-2 text-emerald-400">
              <Check className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{t("credentialsSaved")}</span>
            </div>

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

            <div className="flex flex-col gap-2">
              {testSent && (
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

            {provider === "twilio" && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-300">⚠️ {t("twilioWebhookRequired")}</p>
                <p className="text-xs text-zinc-400">{t("twilioWebhookInstructions")}</p>
              </div>
            )}

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

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleEditCreds}
                className="flex-1 text-xs text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors"
              >
                {t("editCreds")}
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-4 py-2.5 rounded-xl transition-colors"
              >
                {t("disconnect")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
