import { useState, useEffect } from "react";
import type { Step, WizardState } from "../types";
import { TEMPLATE_PROMPTS, type InstanceTemplate, type LLMProvider } from "@/lib/openclaw-config";

export const STEPS: Step[] = ["template", "provider", "channels", "persona", "deploy"];

export const AGENT_TEMPLATES = [
  {
    id: "customer_support",
    name: "Customer Support Bot",
    emoji: "🎧",
    desc: "Handle inquiries, FAQs, and support tickets 24/7",
    model: "openai/gpt-4o",
    systemPrompt:
      "You are a friendly and professional customer support agent. Help customers resolve their issues efficiently and empathetically. If you cannot resolve an issue, tell the customer you'll escalate it to a human agent and collect their contact information.",
    color: "blue" as const,
  },
  {
    id: "sales_assistant",
    name: "Sales Assistant",
    emoji: "💼",
    desc: "Qualify leads, answer product questions, book demos",
    model: "openai/gpt-4o",
    systemPrompt:
      "You are a sales assistant. Your goal is to understand potential customers' needs, qualify their interest, and help them take the next step. Ask relevant questions about their use case, team size, and timeline. Collect contact info for follow-up.",
    color: "emerald" as const,
  },
  {
    id: "faq_bot",
    name: "FAQ Bot",
    emoji: "❓",
    desc: "Answer common questions based on your knowledge base",
    model: "openai/gpt-4o-mini",
    systemPrompt:
      "You are a FAQ bot. Answer questions clearly and concisely based on the information you've been given. If you don't know the answer to something, say so clearly and offer to connect them with a human for more help.",
    color: "amber" as const,
  },
  {
    id: "internal_helpdesk",
    name: "Internal Helpdesk",
    emoji: "🛠️",
    desc: "Automate internal workflows and employee support",
    model: "openai/gpt-4o",
    systemPrompt:
      "You are an internal helpdesk assistant. Help employees with IT questions, HR policies, onboarding tasks, and general internal queries. Provide clear, actionable answers and escalate to the appropriate team when needed.",
    color: "violet" as const,
  },
  {
    id: "content_writer",
    name: "Content Assistant",
    emoji: "✍️",
    desc: "Draft content, summaries, and translations",
    model: "anthropic/claude-sonnet-4-6",
    systemPrompt:
      "You are a content assistant. Help write, edit, summarize, and translate text. Match the tone and style requested. Produce clean, professional output ready to use.",
    color: "pink" as const,
  },
  {
    id: "custom",
    name: "Custom Agent",
    emoji: "⚙️",
    desc: "Start blank — configure everything yourself",
    model: "openai/gpt-4o",
    systemPrompt: "You are a helpful AI assistant.",
    color: "zinc" as const,
  },
];

export const TEMPLATE_COLOR_IDLE: Record<string, string> = {
  blue: "border-white/10 bg-white/[0.02] hover:border-blue-500/40 hover:bg-blue-500/5",
  emerald: "border-white/10 bg-white/[0.02] hover:border-emerald-500/40 hover:bg-emerald-500/5",
  amber: "border-white/10 bg-white/[0.02] hover:border-amber-500/40 hover:bg-amber-500/5",
  violet: "border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5",
  pink: "border-white/10 bg-white/[0.02] hover:border-pink-500/40 hover:bg-pink-500/5",
  zinc: "border-white/10 bg-white/[0.02] hover:border-white/20",
};

export const TEMPLATE_COLOR_ACTIVE: Record<string, string> = {
  blue: "border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30",
  emerald: "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30",
  amber: "border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/30",
  violet: "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30",
  pink: "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500/30",
  zinc: "border-white/30 bg-white/[0.06] ring-1 ring-white/20",
};

export const TEMPLATE_ICONS: Record<InstanceTemplate, string> = {
  general: "🤖",
  customer_support: "💬",
  faq_bot: "❓",
  lead_qualification: "🎯",
};

// Map our gallery template ID → legacy InstanceTemplate
const LEGACY_MAP: Record<string, InstanceTemplate> = {
  customer_support: "customer_support",
  sales_assistant: "lead_qualification",
  faq_bot: "faq_bot",
  internal_helpdesk: "general",
  content_writer: "general",
  custom: "general",
};

const INITIAL_STATE: WizardState = {
  name: "",
  instanceType: "assistant",
  template: "general",
  agentTemplateId: "",
  llmProvider: "openai",
  apiKey: "",
  model: "openai/gpt-4o",
  telegramEnabled: false,
  telegramToken: "",
  discordEnabled: false,
  discordToken: "",
  slackEnabled: false,
  slackAppToken: "",
  slackBotToken: "",
  systemPrompt: TEMPLATE_PROMPTS.general,
  temperature: 0.7,
  maxTokens: 1024,
  deployMode: "manual",
};

export function useWizardState() {
  const [step, setStep] = useState<Step>("template");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [configPreview, setConfigPreview] = useState("");
  const [createdInstanceId, setCreatedInstanceId] = useState<string | null>(null);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const updateState = (partial: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const selectTemplate = (tpl: InstanceTemplate) => {
    updateState({
      template: tpl,
      systemPrompt: TEMPLATE_PROMPTS[tpl],
    });
  };

  const selectAgentTemplate = (tpl: typeof AGENT_TEMPLATES[0]) => {
    const currentName = state.name;
    updateState({
      agentTemplateId: tpl.id,
      template: LEGACY_MAP[tpl.id] ?? "general",
      systemPrompt: tpl.systemPrompt,
      model: tpl.model,
      // Pre-fill name with template name only if field is still empty
      name: currentName.trim() ? currentName : tpl.id !== "custom" ? tpl.name : "",
    });
  };

  const selectProvider = (provider: LLMProvider) => {
    const { MODEL_OPTIONS } = require("@/lib/openclaw-config");
    const firstModel = MODEL_OPTIONS[provider][0].value;
    updateState({ llmProvider: provider, model: firstModel, apiKey: "" });
  };

  const goNext = () => {
    const stepIndex = STEPS.indexOf(step);
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  };

  const goPrev = () => {
    const stepIndex = STEPS.indexOf(step);
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  };

  const goToStep = (targetStep: Step) => {
    const currentIndex = STEPS.indexOf(step);
    const targetIndex = STEPS.indexOf(targetStep);
    if (targetIndex < currentIndex) {
      setStep(targetStep);
    }
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(configPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    // State
    step,
    submitting,
    error,
    success,
    copied,
    configPreview,
    createdInstanceId,
    state,
    // Actions
    setStep,
    setSubmitting,
    setError,
    setSuccess,
    setConfigPreview,
    setCreatedInstanceId,
    updateState,
    selectTemplate,
    selectAgentTemplate,
    selectProvider,
    goNext,
    goPrev,
    goToStep,
    copyConfig,
  };
}
