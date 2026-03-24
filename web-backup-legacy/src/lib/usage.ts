import { prisma } from "@/lib/prisma";

interface TrackUsageParams {
  userId: string;
  instanceId: string;
  type: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track usage event for billing and analytics
 */
export async function trackUsage({
  userId,
  instanceId,
  type,
  metadata,
}: TrackUsageParams): Promise<void> {
  try {
    await prisma.usageEvent.create({
      data: {
        userId,
        instanceId,
        type,
        count: 1,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Also update the instance's sandboxUsed counter
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { sandboxUsed: { increment: 1 } },
    });
  } catch (error) {
    console.error("[trackUsage] Error:", error);
    // Non-blocking - don't fail the request if tracking fails
  }
}
