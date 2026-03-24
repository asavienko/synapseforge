import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Marks commands stuck in "running" for >10 min as "failed"
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const result = await prisma.instanceCommand.updateMany({
    where: {
      status: "running",
      startedAt: { lt: tenMinutesAgo },
    },
    data: {
      status: "failed",
      errorMsg: "Timed out after 10 minutes — VPS may be unreachable",
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, timedOut: result.count });
}
