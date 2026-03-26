"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
}

interface ApiKeysManagerProps {
  instanceId: string;
}

export function ApiKeysManager({ instanceId }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const t = useTranslations("apiKeysManager");
  const locale = useLocale();

  useEffect(() => {
    fetchKeys();
  }, [instanceId]);

  const fetchKeys = async () => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/api-keys`);
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/instances/${instanceId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setKeys((prev) => [data.key, ...prev]);
        setNewlyCreatedKey(data.key.key);
        setNewKeyName("");
        setShowCreateForm(false);
        setVisibleKeys((prev) => new Set(prev).add(data.key.id));
      } else {
        const err = await res.json();
        alert(err.error || t("failedCreate"));
      }
    } catch {
      alert(t("failedCreate"));
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm(t("confirmDelete"))) {
      return;
    }

    try {
      const res = await fetch(`/api/instances/${instanceId}/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
      } else {
        alert(t("failedDelete"));
      }
    } catch {
      alert(t("failedDelete"));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">{t("title")}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-500">{t("subtitle")}</p>
          </div>
        </div>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("createKey")}
          </button>
        )}
      </div>

      {/* New Key Warning */}
      {newlyCreatedKey && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-300 font-medium mb-2">
            {t("warningTitle")}
          </p>
          <p className="text-sm text-amber-300/80 mb-3">
            {t("warningDesc")}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-100 dark:bg-black/30 rounded px-3 py-2 text-sm font-mono break-all">
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey, "new")}
              className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
            >
              {copiedId === "new" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => setNewlyCreatedKey(null)}
            className="mt-3 text-sm text-amber-400 hover:text-amber-300"
          >
            {t("copiedIt")}
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="glow-border rounded-xl bg-white dark:bg-white/[0.02] p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-zinc-400 mb-2 block">{t("keyNameLabel")}</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t("keyNamePlaceholder")}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-white transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {creating ? t("creating") : t("create")}
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-zinc-500">
            {t("emptyState")}
          </div>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="glow-border rounded-xl bg-white dark:bg-white/[0.02] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-500">
                      {t("created")} {formatDate(key.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm font-mono text-gray-500 dark:text-zinc-400">
                      {visibleKeys.has(key.id) ? key.key : "••••••••••••••••"}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1.5 text-gray-500 dark:text-zinc-500 hover:text-white hover:bg-gray-200 dark:bg-white/10 rounded transition-colors"
                      title={visibleKeys.has(key.id) ? t("hide") : t("show")}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="p-1.5 text-gray-500 dark:text-zinc-500 hover:text-white hover:bg-gray-200 dark:bg-white/10 rounded transition-colors"
                      title={t("copy")}
                    >
                      {copiedId === key.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {key.lastUsedAt && (
                    <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">
                      {t("lastUsed")} {formatDate(key.lastUsedAt)}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => deleteKey(key.id)}
                  className="p-2 text-gray-500 dark:text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                  title={t("deleteKey")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-zinc-300">{t("usageExamples")}</h4>

        {/* OpenHelix format */}
        <div className="rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400">/api/v1/chat</span>
            <span className="text-xs text-gray-500 dark:text-zinc-500">{t("openhelixFormat")}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-gray-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">{`curl -X POST https://openhelixai.com/api/v1/chat \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello!"}'`}</pre>
        </div>

        {/* OpenAI-compatible format */}
        <div className="rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400">/api/v1/chat/completions</span>
            <span className="text-xs text-gray-500 dark:text-zinc-500">{t("openaiCompatible")}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-gray-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">{`curl -X POST https://openhelixai.com/api/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'`}</pre>
        </div>

        {/* Python example */}
        <div className="rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
            <span className="text-xs font-mono text-gray-500 dark:text-zinc-400">Python</span>
            <span className="text-xs text-gray-500 dark:text-zinc-500">{t("sdkExample")}</span>
          </div>
          <pre className="p-4 text-xs font-mono text-gray-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://openhelixai.com/api/v1"
)

response = client.chat.completions.create(
    model="default",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`}</pre>
        </div>
      </div>
    </div>
  );
}
