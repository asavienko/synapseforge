"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Credential {
  id: string;
  provider: "openai" | "anthropic" | "openrouter";
  lastFour: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const PROVIDERS = {
  openai: {
    label: "OpenAI",
    placeholder: "sk-...",
    description: "For GPT-4, GPT-3.5, and other OpenAI models",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/10",
  },
  anthropic: {
    label: "Anthropic",
    placeholder: "sk-ant-...",
    description: "For Claude models (Sonnet, Opus, Haiku)",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
  },
  openrouter: {
    label: "OpenRouter",
    placeholder: "sk-or-...",
    description: "Access to multiple models through one API",
    color: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgColor: "bg-violet-500/10",
  },
};

export function ApiKeySettings() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    keyof typeof PROVIDERS | ""
  >("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  async function loadCredentials() {
    try {
      const res = await fetch("/api/user/credentials");
      if (!res.ok) throw new Error("Failed to load credentials");
      const data = await res.json();
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load credentials:", err);
    } finally {
      setLoading(false);
    }
  }

  function validateKeyFormat(provider: string, key: string): boolean {
    const patterns: Record<string, RegExp> = {
      openai: /^sk-[a-zA-Z0-9]{48}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9]{32,}$/,
      openrouter: /^sk-or-[a-zA-Z0-9]{32,}$/,
    };
    return patterns[provider]?.test(key) ?? false;
  }

  async function handleSave() {
    if (!selectedProvider || !apiKey) {
      setError("Please select a provider and enter an API key");
      return;
    }

    if (!validateKeyFormat(selectedProvider, apiKey)) {
      setError(
        `Invalid API key format for ${PROVIDERS[selectedProvider].label}. Expected format: ${PROVIDERS[selectedProvider].placeholder}`
      );
      return;
    }

    setError(null);
    setValidating(true);

    try {
      const res = await fetch("/api/user/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          key: apiKey,
          validate: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save API key");
        return;
      }

      // Success - reset form and reload credentials
      setApiKey("");
      setSelectedProvider("");
      setIsAdding(false);
      loadCredentials();
    } catch (err) {
      setError("Failed to save API key. Please try again.");
    } finally {
      setValidating(false);
    }
  }

  async function handleDelete(id: string, provider: string) {
    if (!confirm(`Are you sure you want to remove your ${provider} API key?`)) {
      return;
    }

    setDeleting(id);

    try {
      const res = await fetch(`/api/user/credentials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete credential");
      }

      // Remove from local state
      setCredentials((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete credential:", err);
      alert("Failed to delete API key. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function handleCancel() {
    setIsAdding(false);
    setSelectedProvider("");
    setApiKey("");
    setError(null);
    setShowKey(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">API Keys</h3>
            <p className="text-sm text-zinc-400">
              Manage your LLM provider API keys securely
            </p>
          </div>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-medium text-white"
          >
            <Plus className="w-4 h-4" />
            Add Key
          </button>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-medium mb-1">Secure Storage</p>
          <p>
            Your API keys are encrypted using AES-256-GCM and stored securely.
            We never expose your full keys after saving — only the last 4
            characters are shown for identification.
          </p>
        </div>
      </div>

      {/* Add New Key Form */}
      {isAdding && (
        <div className="glow-border rounded-xl bg-white/[0.02] p-6">
          <h4 className="font-medium text-white mb-4">Add New API Key</h4>

          {/* Provider Selection */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(PROVIDERS) as Array<keyof typeof PROVIDERS>).map(
                (provider) => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={cn(
                      "p-3 rounded-xl border text-sm font-medium transition-all capitalize",
                      selectedProvider === provider
                        ? "border-violet-500 bg-violet-500/10 text-white ring-1 ring-violet-500/30"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                    )}
                  >
                    {PROVIDERS[provider].label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* API Key Input */}
          {selectedProvider && (
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={PROVIDERS[selectedProvider].placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {PROVIDERS[selectedProvider].description}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!selectedProvider || !apiKey || validating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg text-sm font-medium text-white"
            >
              {validating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Key
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={validating}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Credentials List */}
      {credentials.length > 0 ? (
        <div className="space-y-3">
          {credentials.map((credential) => {
            const provider = PROVIDERS[credential.provider];
            return (
              <div
                key={credential.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border",
                  "bg-white/[0.02] hover:bg-white/[0.04] transition-colors",
                  provider.borderColor
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center",
                      provider.bgColor,
                      provider.borderColor
                    )}
                  >
                    <Key className={cn("w-5 h-5", provider.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {provider.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        Connected
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 font-mono">
                      ••••••••••••{credential.lastFour}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleDelete(credential.id, provider.label)
                  }
                  disabled={deleting === credential.id}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Remove API key"
                >
                  {deleting === credential.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/10">
            <Key className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-1">No API keys stored</p>
            <p className="text-sm text-zinc-500">
              Add your first API key to use your own LLM provider credits
            </p>
          </div>
        )
      )}
    </div>
  );
}
