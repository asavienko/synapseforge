import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/analytics?days=7|30
 *
 * Returns aggregated usage analytics for the current user across all instances.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "7", 10);
  const daysToFetch = days === 30 ? 30 : 7;

  const since = new Date();
  since.setDate(since.getDate() - daysToFetch);

  // Get usage events aggregated by day
  const events = await prisma.usageEvent.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: since },
    },
    select: {
      createdAt: true,
      count: true,
      metadata: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Also get chat messages for additional data
  const messages = await prisma.chatMessage.findMany({
    where: {
      instance: { userId: session.user.id },
      role: "assistant",
      createdAt: { gte: since },
    },
    select: {
      createdAt: true,
      latencyMs: true,
      isError: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Aggregate by day
  const statsByDay = new Map<
    string,
    { requests: number; errors: number; totalLatency: number; latencyCount: number }
  >();

  // Initialize all days with zero
  for (let i = 0; i < daysToFetch; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    statsByDay.set(key, { requests: 0, errors: 0, totalLatency: 0, latencyCount: 0 });
  }

  // Aggregate usage events
  for (const event of events) {
    const date = event.createdAt.toISOString().split("T")[0];
    const existing = statsByDay.get(date) ?? { requests: 0, errors: 0, totalLatency: 0, latencyCount: 0 };
    existing.requests += event.count;
    
    // Check metadata for errors
    if (event.metadata) {
      try {
        const meta = JSON.parse(event.metadata);
        if (meta.error || meta.status >= 400) {
          existing.errors += event.count;
        }
        if (meta.latencyMs) {
          existing.totalLatency += meta.latencyMs * event.count;
          existing.latencyCount += event.count;
        }
      } catch {}
    }
    
    statsByDay.set(date, existing);
  }

  // Aggregate chat messages
  for (const msg of messages) {
    const date = msg.createdAt.toISOString().split("T")[0];
    const existing = statsByDay.get(date) ?? { requests: 0, errors: 0, totalLatency: 0, latencyCount: 0 };
    existing.requests += 1;
    if (msg.isError) existing.errors += 1;
    if (msg.latencyMs) {
      existing.totalLatency += msg.latencyMs;
      existing.latencyCount += 1;
    }
    statsByDay.set(date, existing);
  }

  // Convert to array format for chart
  const data = Array.from(statsByDay.entries())
    .map(([date, stats]) => ({
      date,
      requests: stats.requests,
      errors: stats.errors,
      avgLatency: stats.latencyCount > 0 ? Math.round(stats.totalLatency / stats.latencyCount) : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ data });
}