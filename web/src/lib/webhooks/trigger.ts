import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface WebhookPayload {
  event: string;
  instanceId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export async function triggerWebhooks(
  instanceId: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    // Find all active webhooks for this instance that subscribe to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        instanceId,
        active: true,
        events: { has: event },
      },
    });

    if (webhooks.length === 0) return;

    const payload: WebhookPayload = {
      event,
      instanceId,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadString = JSON.stringify(payload);

    // Send to all webhooks in parallel
    await Promise.all(
      webhooks.map(async (webhook) => {
        try {
          // Generate signature
          const signature = crypto
            .createHmac("sha256", webhook.secret || "")
            .update(payloadString)
            .digest("hex");

          const startTime = Date.now();
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-SynapseForge-Event": event,
              "X-SynapseForge-Signature": `sha256=${signature}`,
              "X-SynapseForge-Timestamp": payload.timestamp,
            },
            body: payloadString,
          });

          const duration = Date.now() - startTime;
          const responseBody = await response.text();

          // Log delivery
          await prisma.webhookDelivery.create({
            data: {
              webhookId: webhook.id,
              event,
              payload: payloadString,
              statusCode: response.status,
              response: responseBody.slice(0, 10000), // Limit response size
              success: response.ok,
            },
          });

          console.log(
            `[webhook] ${event} to ${webhook.url} - ${response.status} (${duration}ms)`
          );
        } catch (error) {
          // Log failed delivery
          await prisma.webhookDelivery.create({
            data: {
              webhookId: webhook.id,
              event,
              payload: payloadString,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          });

          console.error(`[webhook] Failed to send ${event} to ${webhook.url}:`, error);
        }
      })
    );
  } catch (error) {
    console.error("[triggerWebhooks] Error:", error);
  }
}
