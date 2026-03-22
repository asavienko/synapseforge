import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron job: Process webhook retries
 * 
 * Retries failed webhooks with exponential backoff:
 * - Attempt 1: immediate
 * - Attempt 2: after 1 minute  
 * - Attempt 3: after 5 minutes
 * - Attempt 4: after 15 minutes
 * 
 * Vercel Cron: every 15 minutes
 */

const MAX_RETRIES = 3;
const RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min

export async function GET(req: Request) {
  // Verify cron secret
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader = req.headers.get("authorization") ?? "";
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);
  
  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  let processed = 0;
  let succeeded = 0;

  // Find recent failed deliveries that haven't been retried yet
  // For simplicity, we look at deliveries from last 30 minutes that failed
  const since = new Date(now.getTime() - 30 * 60 * 1000);

  const recentFailures = await prisma.webhookDelivery.findMany({
    where: {
      success: false,
      createdAt: { gte: since },
      // Only retry if status code indicates retryable error
      OR: [
        { statusCode: null }, // Network errors
        { statusCode: { gte: 500 } }, // Server errors
        { statusCode: 429 }, // Rate limited
      ],
    },
    include: {
      webhook: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50, // Process max 50 per run
  });

  // Group by webhook+event to avoid duplicate retries
  const seen = new Set<string>();
  const toRetry = recentFailures.filter((d) => {
    const key = `${d.webhookId}:${d.event}:${Math.floor(d.createdAt.getTime() / 60000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const delivery of toRetry) {
    // Check if this webhook already succeeded for this event recently
    const recentSuccess = await prisma.webhookDelivery.findFirst({
      where: {
        webhookId: delivery.webhookId,
        event: delivery.event,
        success: true,
        createdAt: { gt: delivery.createdAt },
      },
    });

    if (recentSuccess) continue; // Already succeeded, skip

    const webhook = delivery.webhook;
    if (!webhook.active) continue;

    processed++;

    try {
      const payload = delivery.payload;
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(payload)
        .digest("hex");

      const res = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OpenHelix-Event": delivery.event,
          "X-OpenHelix-Signature": `sha256=${signature}`,
          "X-OpenHelix-Retry": "true",
        },
        body: payload,
        signal: AbortSignal.timeout(10000),
      });

      const responseText = await res.text().catch(() => null);

      // Record retry attempt
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: delivery.event,
          payload,
          statusCode: res.status,
          response: responseText,
          success: res.ok,
          error: res.ok ? null : `HTTP ${res.status} (retry)`,
        },
      });

      if (res.ok) {
        succeeded++;
        console.log(`[webhook-retry] success ${delivery.event} → ${webhook.url}`);
      } else {
        console.log(`[webhook-retry] failed ${delivery.event} → ${webhook.url}: ${res.status}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: delivery.event,
          payload: delivery.payload,
          success: false,
          error: `Retry failed: ${errorMessage}`,
        },
      });

      console.error(`[webhook-retry] error ${delivery.event} → ${webhook.url}:`, errorMessage);
    }
  }

  return NextResponse.json({ 
    ok: true, 
    processed,
    succeeded,
    failed: processed - succeeded,
  });
}
