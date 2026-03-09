"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bot, ArrowLeft, Play, Square, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { STATUS_COLORS, INSTANCE_TYPES, formatDate } from "@/lib/utils";

interface Instance {
  id: string;
  name: string;
  type: string;
  status: string;
  tier: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadInstance() {
    const res = await fetch(`/api/instances/${id}`);
    if (!res.ok) { router.push("/dashboard/instances"); return; }
    const data = await res.json();
    setInstance(data);
    setLoading(false);
  }

  useEffect(() => { loadInstance(); }, [id]);

  async function toggleStatus() {
    if (!instance) return;
    setSaving(true);
    const newStatus = instance.status === "running" ? "stopped" : "running";
    const res = await fetch(`/api/instances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInstance(updated);
    }
    setSaving(false);
  }

  async function deleteInstance() {
    if (!confirm("Delete this instance? This cannot be undone.")) return;
    await fetch(`/api/instances/${id}`, { method: "DELETE" });
    router.push("/dashboard/instances");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!instance) return null;

  const typeLabel = INSTANCE_TYPES.find((t) => t.value === instance.type)?.label ?? instance.type;

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/dashboard/instances"
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to instances
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
          <Bot className="w-7 h-7 text-violet-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{instance.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[instance.status]}`}>
              {instance.status}
            </span>
          </div>
          <p className="text-zinc-400 text-sm">{typeLabel} · {instance.tier} tier</p>
        </div>
      </div>

      {/* Details */}
      <div className="glow-border rounded-2xl bg-white/[0.02] divide-y divide-white/5 mb-6">
        {instance.description && (
          <div className="p-5">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Description</div>
            <p className="text-zinc-300 text-sm">{instance.description}</p>
          </div>
        )}
        <div className="p-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Created</div>
            <div className="text-sm text-zinc-300">{formatDate(instance.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Last updated</div>
            <div className="text-sm text-zinc-300">{formatDate(instance.updatedAt)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Type</div>
            <div className="text-sm text-zinc-300">{typeLabel}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tier</div>
            <div className="text-sm text-zinc-300 capitalize">{instance.tier}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={toggleStatus}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
            instance.status === "running"
              ? "bg-zinc-700 hover:bg-zinc-600 text-white"
              : "bg-emerald-600 hover:bg-emerald-500 text-white"
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : instance.status === "running" ? (
            <Square className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {instance.status === "running" ? "Stop" : "Start"}
        </button>

        <button
          onClick={deleteInstance}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
        💬 Need a tier upgrade or custom config? Contact your manager — they handle it for you.
      </div>
    </div>
  );
}
