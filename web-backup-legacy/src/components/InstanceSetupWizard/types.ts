"use client";

import type { InstanceTemplate } from "@/lib/openclaw-config";

// Re-export the type for use in components
export type { LLMProvider } from "@/lib/openclaw-config";

// ─── Agent Templates ──────────────────────────────────────────────────────────

export interface AgentTemplate {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  model: string;
  systemPrompt: string;
  color: "blue" | "emerald" | "amber" | "violet" | "pink" | "zinc";
}

export type Step = "template" | "provider" | "channels" | "persona" | "deploy";

export interface WizardState {
  // Step 1
  name: string;
  instanceType: string;
  template: InstanceTemplate;
  agentTemplateId: string; // id from AGENT_TEMPLATES
  // Step 2
  llmProvider: import("@/lib/openclaw-config").LLMProvider;
  apiKey: string;
  model: string;
  // Step 3
  telegramEnabled: boolean;
  telegramToken: string;
  discordEnabled: boolean;
  discordToken: string;
  slackEnabled: boolean;
  slackAppToken: string;
  slackBotToken: string;
  // Step 4
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  // Step 5
  deployMode: "hetzner" | "manual";
}

export interface WizardProps {
  onClose: () => void;
  onCreated: () => void;
}
