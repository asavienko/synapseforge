"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Plus, Loader2, X } from "lucide-react";
import { STATUS_COLORS, INSTANCE_TYPES } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Instance {
  id: string;
  name: string;
  type: string;
  status: string;
  tier: string;
  description?: string;
  createdAt: string;
  healthStatus?: string | null;
}

function HealthDot({ healthStatus }: { healthStatus?: string | null }) {
  if (healthStatus === "healthy") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
      </span>
    );
  }
  if (healthStatus === "degraded") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
      </span>
    );
  }
  if (healthStatus === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
      </span>
    );
  }
  return (
    <span title="No health data yet" className="inline-flex items-center gap-1 text-xs text-zinc-500">
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
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", type: "assistant", description: "" });
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const res = await fetch("/api/instances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
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
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
        >
          <Plus className="w-4 h-4" />
          {t("newInstance")}
        </button>
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
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg text-sm font-semibold text-white"
          >
            <Plus className="w-4 h-4" />
            {t("createInstance")}
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
                <div className="flex items-center gap-2">
                  <HealthDot healthStatus={instance.healthStatus} />
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[instance.status]}`}>
                    {instance.status}
                  </span>
                </div>
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
    </div>
  );
}
