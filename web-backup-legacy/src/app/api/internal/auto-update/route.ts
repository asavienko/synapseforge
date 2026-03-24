import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queueVersionUpdate } from "@/lib/command-queue";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const key =
    req.headers.get("x-cron-key") || req.nextUrl.searchParams.get("key");
  if (key !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find latest stable version
  const latestStable = await prisma.openClawVersion.findFirst({
    where: { stable: true, deprecated: false },
    orderBy: { publishedAt: "desc" },
  });

  if (!latestStable) {
    return NextResponse.json({
      ok: true,
      queued: 0,
      reason: "No stable version found",
    });
  }

  // Find instances with autoUpdate=true that are not already on the latest version
  const instances = await prisma.aIInstance.findMany({
    where: {
      autoUpdate: true,
      status: "running",
      NOT: { currentVersion: latestStable.tag },
    },
    select: { id: true, name: true, currentVersion: true },
  });

  let queued = 0;
  for (const instance of instances) {
    try {
      await queueVersionUpdate(instance.id, latestStable.tag, "auto-update");
      queued++;
    } catch (e) {
      console.error(`Failed to queue auto-update for ${instance.id}:`, e);
    }
  }

  return NextResponse.json({
    ok: true,
    queued,
    total: instances.length,
    targetVersion: latestStable.tag,
  });
}
