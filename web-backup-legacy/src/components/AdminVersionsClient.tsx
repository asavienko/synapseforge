"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, Loader2 } from "lucide-react";

interface OcVersion {
  id: string;
  tag: string;
  imageRef: string;
  changelog?: string;
  stable: boolean;
  deprecated: boolean;
  publishedAt: string;
}

interface InstanceVersionRow {
  id: string;
  name: string;
  currentVersion?: string | null;
  status: string;
  user?: { email?: string | null } | null;
}

export function AdminVersionsClient() {
  const t = useTranslations("admin");
  const [versions, setVersions] = useState<OcVersion[]>([]);
  const [instances, setInstances] = useState<InstanceVersionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishForm, setPublishForm] = useState({
    tag: "",
    imageRef: "",
    changelog: "",
    stable: false,
  });
  const [publishing, setPublishing] = useState(false);
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [bulkUpdateTag, setBulkUpdateTag] = useState("");
  const [bulkUpdating, setBulkUpdating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/versions").then((r) => r.json()),
      fetch("/api/admin/instances/versions").then((r) => r.json()),
    ])
      .then(([v, i]) => {
        setVersions((v as { versions?: OcVersion[] }).versions ?? []);
        setInstances((i as { instances?: InstanceVersionRow[] }).instances ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function publishVersion() {
    if (!publishForm.tag || !publishForm.imageRef) return;
    setPublishing(true);
    const res = await fetch("/api/admin/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(publishForm),
    });
    const data = (await res.json()) as { version?: OcVersion };
    if (data.version) setVersions((prev) => [data.version!, ...prev]);
    setPublishForm({ tag: "", imageRef: "", changelog: "", stable: false });
    setPublishing(false);
  }

  async function toggleFlag(
    id: string,
    flag: "stable" | "deprecated",
    current: boolean
  ) {
    await fetch(`/api/admin/versions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [flag]: !current }),
    });
    setVersions((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [flag]: !current } : v))
    );
  }

  async function bulkUpdate() {
    if (!bulkUpdateTag || !selectedInstanceIds.length) return;
    setBulkUpdating(true);
    await fetch("/api/admin/instances/bulk-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: bulkUpdateTag, instanceIds: selectedInstanceIds }),
    });
    setSelectedInstanceIds([]);
    setBulkUpdating(false);
  }

  // Group instances by version
  const versionGroups = instances.reduce<Record<string, number>>((acc, inst) => {
    const v = inst.currentVersion || "unknown";
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Publish new version */}
      <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t("publishVersion")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            placeholder={t("tagPlaceholder")}
            value={publishForm.tag}
            onChange={(e) =>
              setPublishForm((p) => ({ ...p, tag: e.target.value }))
            }
            className="bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
          />
          <input
            placeholder={t("imageRefPlaceholder")}
            value={publishForm.imageRef}
            onChange={(e) =>
              setPublishForm((p) => ({ ...p, imageRef: e.target.value }))
            }
            className="bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 sm:col-span-2"
          />
          <textarea
            placeholder={t("changelogPlaceholder")}
            value={publishForm.changelog}
            onChange={(e) =>
              setPublishForm((p) => ({ ...p, changelog: e.target.value }))
            }
            rows={3}
            className="bg-black/40 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 sm:col-span-2 resize-none"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="stable"
              checked={publishForm.stable}
              onChange={(e) =>
                setPublishForm((p) => ({ ...p, stable: e.target.checked }))
              }
            />
            <label htmlFor="stable" className="text-sm text-zinc-400">
              {t("markStable")}
            </label>
          </div>
          <button
            onClick={publishVersion}
            disabled={publishing || !publishForm.tag || !publishForm.imageRef}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {publishing ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              t("publishVersion")
            )}
          </button>
        </div>
      </div>

      {/* Version list */}
      <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">{t("versions")}</h2>
        {versions.length === 0 ? (
          <p className="text-zinc-600 text-sm">{t("noVersions")}</p>
        ) : (
          <div className="space-y-2">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white text-sm">{v.tag}</span>
                  {v.stable && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {t("stableLabel")}
                    </span>
                  )}
                  {v.deprecated && (
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {t("deprecatedLabel")}
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 font-mono">
                    {versionGroups[v.tag]
                      ? t("instanceCount", { count: versionGroups[v.tag] })
                      : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFlag(v.id, "stable", v.stable)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      v.stable
                        ? "border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                        : "border-white/10 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400"
                    }`}
                  >
                    {v.stable ? t("unmarkStable") : t("markStable")}
                  </button>
                  <button
                    onClick={() =>
                      toggleFlag(v.id, "deprecated", v.deprecated)
                    }
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      v.deprecated
                        ? "border-white/10 text-zinc-500"
                        : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    }`}
                  >
                    {v.deprecated ? t("undeprecate") : t("markDeprecated")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instance version coverage */}
      <div className="bg-[#12121a] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">{t("instanceCoverage")}</h2>
          {selectedInstanceIds.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkUpdateTag}
                onChange={(e) => setBulkUpdateTag(e.target.value)}
                className="bg-black/40 border border-white/8 rounded-lg px-2 py-1.5 text-sm text-white"
              >
                <option value="">{t("selectVersion")}</option>
                {versions
                  .filter((v) => v.stable)
                  .map((v) => (
                    <option key={v.id} value={v.tag}>
                      {v.tag}
                    </option>
                  ))}
              </select>
              <button
                onClick={bulkUpdate}
                disabled={bulkUpdating || !bulkUpdateTag}
                className="text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg disabled:opacity-40"
              >
                {bulkUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  `${t("bulkUpdate")} (${selectedInstanceIds.length})`
                )}
              </button>
            </div>
          )}
        </div>

        {/* Coverage bars */}
        {instances.length > 0 && (
          <div className="space-y-2 mb-4">
            {Object.entries(versionGroups).map(([version, count]) => (
              <div key={version} className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400 w-24 shrink-0">
                  {version}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{
                      width: `${(count / instances.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-600">
                  {count}/{instances.length}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Instance table */}
        <div className="space-y-1">
          {instances.map((inst) => (
            <div
              key={inst.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedInstanceIds.includes(inst.id)}
                onChange={(e) =>
                  setSelectedInstanceIds((prev) =>
                    e.target.checked
                      ? [...prev, inst.id]
                      : prev.filter((i) => i !== inst.id)
                  )
                }
                className="rounded"
              />
              <span className="text-sm text-white flex-1 truncate">
                {inst.name}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {inst.user?.email}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {inst.currentVersion || "unknown"}
              </span>
              <span
                className={`text-xs ${
                  inst.status === "running"
                    ? "text-emerald-400"
                    : "text-zinc-600"
                }`}
              >
                {inst.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
