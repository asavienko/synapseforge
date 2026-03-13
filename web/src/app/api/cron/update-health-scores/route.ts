import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeUserHealthScore } from "@/lib/health-score";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { instances: { some: {} } },
    select: { id: true },
  });

  let updated = 0;
  for (const user of users) {
    const score = await computeUserHealthScore(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { healthScore: score },
    });
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
