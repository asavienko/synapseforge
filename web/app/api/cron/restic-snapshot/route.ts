import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueCommand } from "@/lib/command-queue";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/restic-snapshot
 * 
 * Triggers automated Restic snapshots for all running instances with VPS.
 * Runs hourly via Vercel Cron.
 * Snapshots are tagged with health status.
 */
export async function GET(req: NextRequest) {
  // Validate cron key
  const key = req.headers.get("x-cron-key") || req.nextUrl.searchParams.get("key");
  if (key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all running instances with VPS configured
  const instances = await prisma.aIInstance.findMany({
    where: {
      status: "running",
      vpsUrl: { not: null },
      gatewayToken: { not: null },
    },
    select: {
      id: true,
      name: true,
      healthStatus: true,
    },
  });

  const results = {
    triggered: 0,
    failed: 0,
    instances: [] as string[],
  };

  for (const instance of instances) {
    try {
      // Queue Restic snapshot command
      // The instance will tag the snapshot as healthy if healthStatus is healthy
      await queueCommand(
        instance.id,
        "take_restic_snapshot",
        { tag: instance.healthStatus === "healthy" ? "healthy" : "auto" },
        "system",
        `hourly auto-snapshot (${instance.healthStatus ?? "unknown"})`
      );
      
      results.triggered++;
      results.instances.push(instance.id);
    } catch (error) {
      console.error(`[restic-snapshot] Failed to queue for ${instance.id}:`, error);
      results.failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    triggered: results.triggered,
    failed: results.failed,
    total: instances.length,
  });
}