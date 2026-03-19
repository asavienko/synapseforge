import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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

  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data,
  });

  await Promise.allSettled(
    relevantWebhooks.map(async (webhook) => {
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(payload)
        .digest("hex");

      try {
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-SynapseForge-Event": event,
            "X-SynapseForge-Signature": `sha256=${signature}`,
          },
          body: payload,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        console.log(`[webhook] ${event} → ${webhook.url}: ${res.status}`);
      } catch (err) {
        console.error(`[webhook] failed ${event} → ${webhook.url}:`, err);
      }
    })
  );
}
