"use client";

import { useEffect } from "react";
import { X, Check, Loader2, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { createInstance } from "@/lib/api";
import type { WizardProps } from "./types";
import { useWizardState, STEPS, AGENT_TEMPLATES } from "./hooks/useWizardState";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ApiKeysStep } from "./steps/ApiKeysStep";
import { ChannelsStep } from "./steps/ChannelsStep";
import { PersonaStep } from "./steps/PersonaStep";
import { DeployStep, generateConfigPreview } from "./steps/DeployStep";
import { SuccessStep } from "./steps/SuccessStep";

export function InstanceSetupWizard({ onClose, onCreated }: WizardProps) {
  const t = useTranslations("instanceSetup");
  const {
    step,
    submitting,
    error,
    success,
    copied,
    configPreview,
    createdInstanceId,
    state,
    setSubmitting,
    setError,
    setSuccess,
    setConfigPreview,
    setCreatedInstanceId,
    updateState,
    selectAgentTemplate,
    selectProvider,
    goNext,
    goPrev,
    goToStep,
    copyConfig,
  } = useWizardState();

  const stepIndex = STEPS.indexOf(step);

  // Validation for next button
  const canGoNext = (() => {
    if (step === "template") return state.agentTemplateId.length > 0 && state.name.trim().length > 0;
    if (step === "provider") return state.apiKey.trim().length > 0;
    return true;
  })();

  // Regenerate config preview when reaching deploy step
  useEffect(() => {
    if (step === "deploy") {
      setConfigPreview(generateConfigPreview(state));
    }
  }, [step, state, setConfigPreview]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      // 1. Create the instance using the standardized API
      const chosenAgentTemplate = AGENT_TEMPLATES.find((t) => t.id === state.agentTemplateId);
      const response = await createInstance({
        name: state.name,
        type: state.instanceType,
        description: chosenAgentTemplate?.desc ?? `${state.systemPrompt.slice(0, 80)}...`,
        systemPrompt: state.systemPrompt,
        agentTemplateId: state.agentTemplateId || undefined,
        agentTemplateName: chosenAgentTemplate?.name ?? undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error("Failed to create instance");
      }

      const instance = response.data;
      const instanceId = instance.id;
      setCreatedInstanceId(instanceId);
      analytics.instanceCreated(state.instanceType);

      // 2. Save credentials (using standard fetch for now - will be refactored in future)
      const apiKeyField = state.llmProvider === "openai"
        ? "openai_api_key"
        : state.llmProvider === "anthropic"
        ? "anthropic_api_key"
        : "openrouter_api_key";

      const credentialsToSave: Array<{ key: string; value: string }> = [];

      if (state.apiKey) {
        credentialsToSave.push({ key: apiKeyField, value: state.apiKey });
      }
      if (state.telegramEnabled && state.telegramToken) {
        credentialsToSave.push({ key: "telegram_bot_token", value: state.telegramToken });
      }
      if (state.discordEnabled && state.discordToken) {
        credentialsToSave.push({ key: "discord_bot_token", value: state.discordToken });
      }
      if (state.slackEnabled && state.slackAppToken) {
        credentialsToSave.push({ key: "slack_app_token", value: state.slackAppToken });
      }
      if (state.slackEnabled && state.slackBotToken) {
        credentialsToSave.push({ key: "slack_bot_token", value: state.slackBotToken });
      }

      for (const cred of credentialsToSave) {
        await fetch(`/api/instances/${instanceId}/credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cred),
        });
      }

      // 3. If Hetzner deploy, kick off VPS provisioning via the user-facing endpoint
      if (state.deployMode === "hetzner") {
        const provRes = await fetch(`/api/instances/${instanceId}/deploy`, {
          method: "POST",
        });
        if (!provRes.ok) {
          const d = await provRes.json().catch(() => ({}));
          // Non-fatal: instance is created with credentials, user can deploy from the Deploy tab
          setError(`Instance created! VPS provisioning will start from the Deploy tab. (${d.error ?? provRes.status})`);
        }
      }

      setSuccess(true);
      onCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-white truncate">{t("title")}</h2>
            <div className="flex items-center gap-1 sm:gap-2 mt-2 overflow-hidden">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button
                    onClick={() => i < stepIndex && goToStep(s)}
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center transition-colors shrink-0",
                      i < stepIndex
                        ? "bg-violet-600 text-white cursor-pointer"
                        : i === stepIndex
                        ? "bg-violet-600/30 border border-violet-500 text-violet-300"
                        : "bg-white/5 text-zinc-600"
                    )}
                  >
                    {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn("w-3 sm:w-6 h-0.5 rounded shrink-0", i < stepIndex ? "bg-violet-600" : "bg-white/10")} />
                  )}
                </div>
              ))}
              <span className="text-xs text-zinc-500 ml-1 sm:ml-2 truncate">{t(`steps.${step}`)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors shrink-0 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {success ? (
            <SuccessStep
              state={state}
              error={error}
              createdInstanceId={createdInstanceId}
              onClose={onClose}
            />
          ) : (
            <>
              {step === "template" && (
                <BasicInfoStep
                  state={state}
                  updateState={updateState}
                  selectAgentTemplate={selectAgentTemplate}
                />
              )}
              {step === "provider" && (
                <ApiKeysStep
                  state={state}
                  updateState={updateState}
                  selectProvider={selectProvider}
                />
              )}
              {step === "channels" && (
                <ChannelsStep
                  state={state}
                  updateState={updateState}
                />
              )}
              {step === "persona" && (
                <PersonaStep
                  state={state}
                  updateState={updateState}
                />
              )}
              {step === "deploy" && (
                <DeployStep
                  state={state}
                  updateState={updateState}
                  configPreview={configPreview}
                  copied={copied}
                  error={error}
                  copyConfig={copyConfig}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-t border-white/5 shrink-0">
            <button
              onClick={stepIndex === 0 ? onClose : goPrev}
              className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              {stepIndex === 0 ? "Cancel" : "Back"}
            </button>

            {step !== "deploy" ? (
              <button
                onClick={goNext}
                disabled={!canGoNext}
                className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span className="hidden sm:inline">{submitting ? t("deploy.deploying") : t("deploy.createInstance")}</span>
                <span className="sm:hidden">{submitting ? t("deploy.deploying") : "Create"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
