"use client";

import { useState, useEffect } from "react";
import { Webhook, Plus, Trash2, TestTube } from "lucide-react";

interface WebhookConfig {
  id?: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
}

interface WebhookConfigProps {
  instanceId: string;
}

const AVAILABLE_EVENTS = [
  { id: "message.received", label: "Message Received", description: "When a new message comes in" },
  { id: "message.sent", label: "Message Sent", description: "When a response is sent" },
  { id: "instance.deployed", label: "Instance Deployed", description: "When instance is successfully deployed" },
  { id: "instance.error", label: "Instance Error", description: "When an error occurs" },
];

export function WebhookConfig({ instanceId }: WebhookConfigProps) {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWebhook, setNewWebhook] = useState<WebhookConfig>({
    url: "",
    events: [],
    active: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, [instanceId]);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/webhooks`);
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data.webhooks || []);
      }
    } catch (err) {
      console.error("Failed to fetch webhooks:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async () => {
    if (!newWebhook.url || newWebhook.events.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/instances/${instanceId}/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhook),
      });

      if (res.ok) {
        await fetchWebhooks();
        setNewWebhook({ url: "", events: [], active: true });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to save webhook:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/webhooks/${webhookId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchWebhooks();
      }
    } catch (err) {
      console.error("Failed to delete webhook:", err);
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/webhooks/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhook.url }),
      });

      if (res.ok) {
        alert("Test webhook sent successfully!");
      } else {
        alert("Failed to send test webhook. Check the URL.");
      }
    } catch (err) {
      alert("Error sending test webhook.");
    }
  };

  const toggleEvent = (eventId: string) => {
    setNewWebhook((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
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
            <Webhook className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold">Webhooks</h3>
            <p className="text-xs text-zinc-500">Get notified when events occur</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="glow-border rounded-xl bg-white/[0.02] p-4 space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Webhook URL</label>
            <input
              type="url"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://your-app.com/webhook"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Events</label>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label key={event.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={newWebhook.events.includes(event.id)}
                    onChange={() => toggleEvent(event.id)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <div className="text-sm font-medium">{event.label}</div>
                    <div className="text-xs text-zinc-500">{event.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveWebhook}
              disabled={saving || !newWebhook.url || newWebhook.events.length === 0}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Webhook"}
            </button>
          </div>
        </div>
      )}

      {/* Webhook List */}
      <div className="space-y-3">
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            No webhooks configured yet
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div key={webhook.id} className="glow-border rounded-xl bg-white/[0.02] p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{webhook.url}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map((event) => (
                      <span key={event} className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded text-xs">
                        {AVAILABLE_EVENTS.find((e) => e.id === event)?.label || event}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => testWebhook(webhook)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Test webhook"
                  >
                    <TestTube className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => webhook.id && deleteWebhook(webhook.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete webhook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
