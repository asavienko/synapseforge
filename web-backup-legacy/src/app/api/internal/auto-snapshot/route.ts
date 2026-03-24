// Called by Vercel cron every 24h (03:00 UTC)
// Takes a snapshot of all running instances that have a vpsServerId (Hetzner server)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const key =
    req.headers.get("x-cron-key") || req.nextUrl.searchParams.get("key");
  if (key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instances = await prisma.aIInstance.findMany({
    where: { status: "running", vpsServerId: { not: null } },
    select: { id: true, name: true, vpsServerId: true },
  });

  const hetznerApiKey = process.env.HETZNER_API_KEY;
  if (!hetznerApiKey) {
    return NextResponse.json({
      error: "HETZNER_API_KEY not configured",
      snapshotted: 0,
    });
  }

  let snapshotted = 0;
  for (const instance of instances) {
    try {
      const res = await fetch(
        `https://api.hetzner.cloud/v1/servers/${instance.vpsServerId}/actions/create_image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hetznerApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: `Auto-snapshot — ${instance.name} — ${new Date().toISOString()}`,
            type: "snapshot",
            labels: { instanceId: instance.id, auto: "true" },
          }),
        }
      );
      if (res.ok) {
        snapshotted++;
        await prisma.activityLog.create({
          data: {
            instanceId: instance.id,
            event: "auto_snapshot_taken",
            details: JSON.stringify({ auto: true }),
          },
        });
      }
    } catch (e) {
      console.error(`Auto-snapshot failed for ${instance.id}:`, e);
    }
  }

  return NextResponse.json({ ok: true, snapshotted, total: instances.length });
}
