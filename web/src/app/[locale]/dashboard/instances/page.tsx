"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Plus, Loader2, X, Sparkles, ArrowRight, Search } from "lucide-react";
import { STATUS_COLORS, INSTANCE_TYPES, formatRelativeTime } from "@/lib/utils";
import { agentTemplates, categoryColors, difficultyColors, getTemplateById, type AgentTemplate } from "@/lib/templates";
import { useTranslations } from "next-intl";
import { InstanceSetupWizard } from "@/components/InstanceSetupWizard";

interface Instance {
  id: string;
  name: string;
  type: string;
  status: string;
  tier: string;
  description?: string;
  createdAt: string;
  healthStatus?: string | null;
  lastCheckedAt?: string | null;
  provisionStatus?: string | null;
}

function HealthDot({ healthStatus, lastCheckedAt }: { healthStatus?: string | null; lastCheckedAt?: string | null }) {
  const t = useTranslations("dashboard.instances");
  const tooltip = lastCheckedAt
    ? `Last checked: ${formatRelativeTime(lastCheckedAt)}`
    : t("noHealthData");

  if (healthStatus === "healthy") {
    return (
      <span title={tooltip} className="inline-flex items-center gap-1 text-xs text-zinc-500 cursor-default">
        <span className="relative inline-flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
        </span>
      </span>
    );
  }
  if (healthStatus === "degraded") {
    return (
      <span title={tooltip} className="inline-flex items-center gap-1 text-xs text-zinc-500 cursor-default">
        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
      </span>
    );
  }
  if (healthStatus === "down") {
    return (
      <span title={tooltip} className="inline-flex items-center gap-1 text-xs text-zinc-500 cursor-default">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
      </span>
    );
  }
  return (
    <span title={tooltip} className="inline-flex items-center gap-1 text-xs text-zinc-500 cursor-default">
      <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />
    </span>
  );
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
  const t = useTranslations("dashboard.instances");
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdFromUrl = searchParams.get("template");

  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [planLimitHit, setPlanLimitHit] = useState(false);
  const [form, setForm] = useState({ name: "", type: "assistant", description: "" });
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);

  // Handle template from URL
  useEffect(() => {
    if (templateIdFromUrl) {
      const template = getTemplateById(templateIdFromUrl);
      if (template) {
        setSelectedTemplate(template);
        setShowTemplateSelector(true);
      }
    }
  }, [templateIdFromUrl]);

  function showToast(text: string, type: "success" | "error" = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }

  const loadInstances = useCallback(async () => {
    const res = await fetch("/api/instances");
    const data = await res.json();
    setInstances(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadInstances(); }, [loadInstances]);

  // Poll every 30s to keep health status fresh (even without provisioning)
  useEffect(() => {
    const interval = setInterval(loadInstances, 30_000);
    return () => clearInterval(interval);
  }, [loadInstances]);

  // Poll every 10s if any instance is provisioning (more frequent)
  useEffect(() => {
    const hasProvisioning = instances.some((i) => i.provisionStatus === "provisioning");
    if (!hasProvisioning) return;
    const interval = setInterval(loadInstances, 10_000);
    return () => clearInterval(interval);
  }, [instances, loadInstances]);

  async function handleCreateFromTemplate(template: AgentTemplate) {
    setError("");
    setPlanLimitHit(false);
    setCreating(true);

    const res = await fetch("/api/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: template.name,
        type: "assistant",
        description: template.shortDescription,
        templateId: template.id,
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      if (res.status === 403) setPlanLimitHit(true);
      setError(data.error || t("modal.failedError"));
    } else {
      setShowTemplateSelector(false);
      setSelectedTemplate(null);
      loadInstances();
      showToast(t("createdSuccess"));
      // Navigate to the new instance
      router.push(`/dashboard/instances/${data.id}`);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPlanLimitHit(false);
    setCreating(true);

    const res = await fetch("/api/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      if (res.status === 403) setPlanLimitHit(true);
      setError(data.error || t("modal.failedError"));
    } else {
      setShowCreate(false);
      setForm({ name: "", type: "assistant", description: "" });
      loadInstances();
      showToast(t("createdSuccess"));
    }
  }

  return (
    <div className="p-8">
      {toast && <Toast text={toast.text} type={toast.type} />}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-zinc-400 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="hidden sm:flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-300"
          >
            <Sparkles className="w-4 h-4" />
            Browse Templates
          </Link>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-zinc-300"
          >
            <Sparkles className="w-4 h-4" />
            From Template
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            {t("newInstance")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <div className="glow-border rounded-2xl p-16 bg-white/[0.02] text-center">
          <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">{t("emptyTitle")}</h3>
          <p className="text-zinc-400 text-sm mb-6">{t("emptyDesc")}</p>
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            {t("createInstance")}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((instance) => {
            const isProvisioning = instance.provisionStatus === "provisioning";
            return (
              <Link
                key={instance.id}
                href={`/dashboard/instances/${instance.id}`}
                className="glow-border rounded-2xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-violet-400" />
                    {isProvisioning && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5">
                        <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <HealthDot healthStatus={instance.healthStatus} lastCheckedAt={instance.lastCheckedAt} />
                    {isProvisioning ? (
                      <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        Provisioning…
                      </span>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[instance.status]}`}>
                        {instance.status}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1 truncate">{instance.name}</h3>
                <p className="text-xs text-zinc-500 mb-3 capitalize">{instance.type} · {instance.tier}</p>
                {instance.description && (
                  <p className="text-sm text-zinc-400 line-clamp-2">{instance.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{t("modal.title")}</h2>
              <button onClick={() => setShowCreate(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t("modal.nameLabel")}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder={t("modal.namePlaceholder")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t("modal.typeLabel")}</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                >
                  {INSTANCE_TYPES.map((tp) => (
                    <option key={tp.value} value={tp.value} className="bg-zinc-900">
                      {tp.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">{t("modal.descLabel")}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder={t("modal.descPlaceholder")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {error}
                  {planLimitHit && (
                    <Link href="/dashboard/billing" className="block mt-2 text-violet-400 hover:text-violet-300 font-medium transition-colors">
                      Upgrade your plan →
                    </Link>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 border border-white/10 hover:border-white/20 text-zinc-300 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t("modal.cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-lg text-sm font-semibold text-white"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("modal.createBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWizard && (
        <InstanceSetupWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => {
            setShowWizard(false);
            loadInstances();
            showToast(t("createdSuccess"));
          }}
        />
      )}
    </div>
  );
}
