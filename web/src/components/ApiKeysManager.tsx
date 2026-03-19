"use client";

import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from "lucide-react";

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
        // Show the new key
        setVisibleKeys((prev) => new Set(prev).add(data.key.id));
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create API key");
      }
    } catch {
      alert("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/instances/${instanceId}/api-keys/${keyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
      } else {
        alert("Failed to delete API key");
      }
    } catch {
      alert("Failed to delete API key");
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
    return new Date(dateStr).toLocaleDateString("en-US", {
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
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold">API Keys</h3>
            <p className="text-xs text-zinc-500">Manage access to your instance API</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* New Key Warning */}
      {newlyCreatedKey && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-300 font-medium mb-2">
            ⚠️ Copy your API key now!
          </p>
          <p className="text-sm text-amber-300/80 mb-3">
            You won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/30 rounded px-3 py-2 text-sm font-mono break-all">
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
            I&apos;ve copied it
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="glow-border rounded-xl bg-white/[0.02] p-4 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Key Name</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g., Production API, Mobile App"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {creating ? "Creating..." : "Create Key"}
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        {keys.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="glow-border rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{key.name}</span>
                    <span className="text-xs text-zinc-500">
                      Created {formatDate(key.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <code className="text-sm font-mono text-zinc-400">
                      {visibleKeys.has(key.id) ? key.key : "••••••••••••••••"}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title={visibleKeys.has(key.id) ? "Hide" : "Show"}
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Copy"
                    >
                      {copiedId === key.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {key.lastUsedAt && (
                    <p className="text-xs text-zinc-600 mt-1">
                      Last used {formatDate(key.lastUsedAt)}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => deleteKey(key.id)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-4"
                  title="Delete key"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Usage Info */}
      <div className="p-4 bg-white/5 rounded-xl text-sm text-zinc-500">
        <p className="mb-2">
          <strong className="text-zinc-300">Using your API key:</strong>
        </p>
        <code className="block bg-black/30 rounded p-3 text-xs font-mono mt-2">
          curl -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \\n<br />
          &nbsp;&nbsp;https://openhelixai.com/api/instances/{instanceId}/chat
        </code>
      </div>
    </div>
  );
}
