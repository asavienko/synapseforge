import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export async function deliverWebhook({
  userId,
  event,
  data,
}: {
  userId: string;
  event: string;
  data: Record<string, unknown>;
}) {
  const webhooks = await prisma.webhook.findMany({
    where: { userId, active: true },
  });

  const relevantWebhooks = webhooks.filter((w) =>
    w.events
      .split(",")
      .map((e) => e.trim())
      .includes(event)
  );

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadStr = JSON.stringify(payload);

  await Promise.allSettled(
    relevantWebhooks.map(async (webhook) => {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(payloadStr)
        .digest("hex");

      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-OpenHelix-Event": event,
            "X-OpenHelix-Signature": `sha256=${signature}`,
          },
          body: payloadStr,
          signal: AbortSignal.timeout(10000),
        });

        const responseText = await res.text().catch(() => null);

        // Record delivery attempt
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payloadStr,
            statusCode: res.status,
            response: responseText,
            success: res.ok,
            error: res.ok ? null : `HTTP ${res.status}`,
          },
        });

        console.log(`[webhook] ${event} → ${webhook.url}: ${res.status}`);

        // If failed with retryable error, schedule retry
        if (!res.ok && isRetryableStatus(res.status)) {
          await scheduleRetry(webhook.id, event, payloadStr, signature, 1);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        
        // Record failed delivery
        await prisma.webhookDelivery.create({
          data: {
            webhookId: webhook.id,
            event,
            payload: payloadStr,
            success: false,
            error: errorMessage,
          },
        });

        console.error(`[webhook] failed ${event} → ${webhook.url}:`, errorMessage);

        // Schedule retry for network errors
        await scheduleRetry(webhook.id, event, payloadStr, signature, 1);
      }
    })
  );
}

function isRetryableStatus(status: number): boolean {
  // Retry on server errors or rate limiting
  return status >= 500 || status === 429;
}

async function scheduleRetry(
  webhookId: string,
  event: string,
  payload: string,
  signature: string,
  attempt: number
): Promise<void> {
  if (attempt > MAX_RETRIES) {
    console.log(`[webhook] max retries reached for ${event} → ${webhookId}`);
    return;
  }

  const delay = RETRY_DELAYS[attempt - 1] ?? RETRY_DELAYS[RETRY_DELAYS.length - 1];
  
  // Store retry in a simple way - we'll use the cron to pick these up
  // For now, just log it. A proper retry queue would need a new table.
  console.log(`[webhook] scheduled retry ${attempt} for ${event} in ${delay}ms`);
}

/**
 * Process webhook retries - called by cron job
 */
export async function processWebhookRetries(): Promise<void> {
  // This would query a retry queue table and process pending retries
  // For now, this is a placeholder for the cron job structure
  console.log("[webhook] processing retries...");
}
