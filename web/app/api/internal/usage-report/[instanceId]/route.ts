import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/internal/usage-report/[instanceId]
 * 
 * Called by OpenClaw instances to report usage metrics.
 * Authenticated via gateway token in Authorization header.
 * 
 * Body: {
 *   type: "chat" | "api_call" | "token";
 *   count?: number;             // Number of events (default: 1)
 *   metadata?: {                // Additional data as JSON
 *     model?: string;
 *     provider?: string;
 *     inputTokens?: number;
 *     outputTokens?: number;
 *     latencyMs?: number;
 *     source?: string;
 *   };
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;
  
  // Authenticate via gateway token
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const token = authHeader.slice(7);
  
  // Verify instance exists and token matches
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, gatewayToken: true, userId: true },
  });
  
  if (!instance || instance.gatewayToken !== token) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const {
      type = "chat",
      count = 1,
      metadata,
    } = body;
    
    // Create usage event
    await prisma.usageEvent.create({
      data: {
        userId: instance.userId,
        instanceId,
        type,
        count,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
    
    // Update instance's last active timestamp
    await prisma.aIInstance.update({
      where: { id: instanceId },
      data: { lastCheckedAt: new Date() },
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[usage-report] Failed to record usage:", error);
    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/internal/usage-report/[instanceId]
 * 
 * Returns aggregated usage data for the instance.
 * Called by dashboard to display usage metrics.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;
  
  // Authenticate via gateway token
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const token = authHeader.slice(7);
  
  // Verify instance exists and token matches
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, gatewayToken: true },
  });
  
  if (!instance || instance.gatewayToken !== token) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Aggregate usage data
    const [todayEvents, monthEvents, allEvents] = await Promise.all([
      prisma.usageEvent.findMany({
        where: { instanceId, createdAt: { gte: startOfToday } },
      }),
      prisma.usageEvent.findMany({
        where: { instanceId, createdAt: { gte: startOfMonth } },
      }),
      prisma.usageEvent.findMany({
        where: { instanceId },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
    ]);
    
    // Calculate totals
    const todayCount = todayEvents.reduce((sum, e) => sum + e.count, 0);
    const monthCount = monthEvents.reduce((sum, e) => sum + e.count, 0);
    const totalCount = allEvents.reduce((sum, e) => sum + e.count, 0);
    
    // Extract token usage from metadata
    let todayTokens = 0;
    let monthTokens = 0;
    
    for (const event of todayEvents) {
      if (event.metadata) {
        try {
          const meta = JSON.parse(event.metadata);
          todayTokens += (meta.inputTokens ?? 0) + (meta.outputTokens ?? 0);
        } catch {}
      }
    }
    
    for (const event of monthEvents) {
      if (event.metadata) {
        try {
          const meta = JSON.parse(event.metadata);
          monthTokens += (meta.inputTokens ?? 0) + (meta.outputTokens ?? 0);
        } catch {}
      }
    }
    
    return NextResponse.json({
      today: { count: todayCount, tokens: todayTokens },
      thisMonth: { count: monthCount, tokens: monthTokens },
      total: { count: totalCount },
      recent: allEvents.slice(0, 100).map(e => ({
        type: e.type,
        count: e.count,
        createdAt: e.createdAt,
        metadata: e.metadata ? JSON.parse(e.metadata) : null,
      })),
    });
  } catch (error) {
    console.error("[usage-report] Failed to fetch usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}