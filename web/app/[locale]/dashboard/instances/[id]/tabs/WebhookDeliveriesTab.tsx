"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { 
  Webhook, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Delivery {
  id: string;
  event: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  createdAt: string;
}

interface WebhookWithDeliveries {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  deliveries: Delivery[];
}

interface WebhookDeliveriesTabProps {
  instanceId: string;
}

export function WebhookDeliveriesTab({ instanceId }: WebhookDeliveriesTabProps) {
  const t = useTranslations("webhooks");
  const [webhooks, setWebhooks] = useState<WebhookWithDeliveries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, [instanceId]);

  async function loadDeliveries() {
    try {
      setLoading(true);
      const res = await fetch(`/api/instances/${instanceId}/webhooks/deliveries`);
      if (!res.ok) throw new Error("Failed to load deliveries");
      const data = await res.json();
      setWebhooks(data.webhooks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400 py-8">
        <AlertCircle className="w-5 h-5" />
        <span>{t("failedLoad")}</span>
      </div>
    );
  }

  if (webhooks.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{t("noWebhooks")}</p>
        <p className="text-sm mt-2">{t("noWebhooksHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {webhooks.map((webhook) => (
        <div
          key={webhook.id}
          className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden"
        >
          {/* Webhook header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/10">
            <div className="flex items-center gap-3">
              <Webhook className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-zinc-300 truncate max-w-md">
                {webhook.url}
              </span>
              <a
                href={webhook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  webhook.active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-zinc-500/10 text-zinc-400"
                )}
              >
                {webhook.active ? t("active") : t("inactive")}
              </span>
            </div>
          </div>

          {/* Events */}
          <div className="px-4 py-2 border-b border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              {webhook.events.map((event) => (
                <span
                  key={event}
                  className="text-xs bg-violet-500/10 text-violet-300 px-2 py-1 rounded"
                >
                  {event}
                </span>
              ))}
            </div>
          </div>

          {/* Deliveries */}
          <div className="divide-y divide-white/5">
            {webhook.deliveries.length === 0 ? (
              <div className="px-4 py-6 text-center text-zinc-500 text-sm">
                {t("noDeliveries")}
              </div>
            ) : (
              webhook.deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    {delivery.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm text-zinc-300">{delivery.event}</p>
                      {delivery.error && (
                        <p className="text-xs text-red-400 mt-0.5">{delivery.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500">
                    {delivery.statusCode && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          delivery.statusCode >= 200 && delivery.statusCode < 300
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {delivery.statusCode}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3" />
                      {new Date(delivery.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
