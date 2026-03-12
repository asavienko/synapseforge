"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Plus, Loader2, X, Check } from "lucide-react";
import { STATUS_COLORS, INSTANCE_TYPES } from "@/lib/utils";
import { AGENT_TEMPLATES, AgentTemplate } from "@/lib/agent-templates";

interface Instance {
  id: string;
  name: string;
  type: string;
  status: string;
  tier: string;
  description?: string;
  createdAt: string;
}

function Toast({ text, type }: { text: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl border flex items-center gap-2 ${
      type === "success"
        ? "bg-emerald-600/90 border-emerald-500 text-white"
        : "bg-red-600/90 border-red-500 text-white"
    }`}>
      {text}
    </div>
  );
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", type: "assistant", description: "" });
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Template gallery state
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [step, setStep] = useState<"template" | "details">("template");

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadInstances() {
    const res = await fetch("/api/instances");
    const data = await res.json();
    setInstances(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadInstances(); }, []);

  function openCreateModal() {
    setShowCreate(true);
    setStep("template");
    setSelectedTemplate(null);
    setForm({ name: "", type: "assistant", description: "" });
    setError("");
  }

  function selectTemplate(template: AgentTemplate) {
    setSelectedTemplate(template);
    setForm({
      name: template.defaultAgentName,
      type: template.instanceType,
      description: "",
    });
    setStep("details");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const res = await fetch("/api/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        systemPrompt: selectedTemplate?.systemPrompt,
        agentTemplateName: selectedTemplate?.name,
        agentTemplateId: selectedTemplate?.id,
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error || "Failed to create instance.");
    } else {
      setShowCreate(false);
      setForm({ name: "", type: "assistant", description: "" });
      setSelectedTemplate(null);
      setStep("template");
      loadInstances();
      showToast("Instance created successfully.");
    }
  }

  return (
    <div className="p-8">
      {toast && <Toast text={toast.text} type={toast.type} />}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Instances</h1>
          <p className="text-zinc-400 mt-1">Manage your deployed AI agents.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
        >
          <Plus className="w-4 h-4" />
          New Instance
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <div className="glow-border rounded-2xl p-16 bg-white/[0.02] text-center">
          <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No instances yet</h3>
          <p className="text-zinc-400 text-sm mb-6">Create your first AI instance to get started.</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            Create Instance
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((instance) => (
            <Link
              key={instance.id}
              href={`/dashboard/instances/${instance.id}`}
              className="glow-border rounded-2xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-violet-400" />
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[instance.status]}`}>
                  {instance.status}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1 truncate">{instance.name}</h3>
              <p className="text-xs text-zinc-500 mb-3 capitalize">{instance.type} · {instance.tier}</p>
              {instance.description && (
                <p className="text-sm text-zinc-400 line-clamp-2">{instance.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">New AI Instance</h2>
                {step === "template" && (
                  <p className="text-xs text-zinc-500 mt-0.5">Choose a template to get started quickly.</p>
                )}
                {step === "details" && selectedTemplate && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-500">Template:</span>
                    <span className="text-xs font-semibold text-violet-300">{selectedTemplate.icon} {selectedTemplate.name}</span>
                    <button
                      onClick={() => setStep("template")}
                      className="text-xs text-zinc-600 hover:text-zinc-400 ml-1 underline"
                    >
                      change
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => { setShowCreate(false); setStep("template"); setSelectedTemplate(null); }}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Template gallery */}
            {step === "template" && (
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AGENT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => selectTemplate(template)}
                      className="group text-left p-4 rounded-xl border border-white/10 hover:border-violet-500/60 hover:bg-violet-500/5 transition-all"
                    >
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <div className="text-sm font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                        {template.name}
                      </div>
                      <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Details form */}
            {step === "details" && (
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {/* Template prompt preview */}
                {selectedTemplate && selectedTemplate.id !== "custom" && (
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-xs font-medium text-violet-300">Pre-filled system prompt</span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {selectedTemplate.systemPrompt}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                      You can customize this in the Configuration tab after creating.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="My Sales Agent"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  >
                    {INSTANCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value} className="bg-zinc-900">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description (optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="What does this agent do?"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("template")}
                    className="flex-1 py-3 border border-white/10 hover:border-white/20 text-zinc-300 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
