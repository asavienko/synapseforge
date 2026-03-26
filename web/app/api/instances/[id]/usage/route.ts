import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── Cost estimation ────────────────────────────────────────────────────────────
// Prices in USD per 1M tokens (approximate, mid-2025 rates).
// These are used only for rough cost estimates shown in the dashboard.
const COST_PER_M_TOKENS: Record<string, { input: number; output: number }> = {
  // OpenAI
  "gpt-4o":             { input: 2.50,  output: 10.00 },
  "gpt-4o-mini":        { input: 0.15,  output: 0.60  },
  "gpt-4-turbo":        { input: 10.00, output: 30.00 },
  "gpt-3.5-turbo":      { input: 0.50,  output: 1.50  },
  // Anthropic
  "claude-3-5-sonnet":  { input: 3.00,  output: 15.00 },
  "claude-3-haiku":     { input: 0.25,  output: 1.25  },
  "claude-3-opus":      { input: 15.00, output: 75.00 },
  // OpenRouter fallback
  default:              { input: 2.50,  output: 10.00 },
};

function estimateCostUsd(
  modelCounts: Record<string, { messages: number; inputTokens: number; outputTokens: number }>
): number {
  let total = 0;
  for (const [model, stats] of Object.entries(modelCounts)) {
    const rates = COST_PER_M_TOKENS[model] ?? COST_PER_M_TOKENS.default;
    total += (stats.inputTokens / 1_000_000) * rates.input;
    total += (stats.outputTokens / 1_000_000) * rates.output;
  }
  return Math.round(total * 10_000) / 10_000; // 4 decimal places
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch usage events from instances (reported via usage-report endpoint)
  const usageEvents = await prisma.usageEvent.findMany({
    where: { instanceId: id },
    select: {
      createdAt: true,
      type: true,
      count: true,
      metadata: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Also fetch chat messages as fallback/augmentation
  const chatMessages = await prisma.chatMessage.findMany({
    where: { instanceId: id, role: "assistant", isError: false },
    select: {
      createdAt: true,
      model: true,
      provider: true,
      latencyMs: true,
      inputTokens: true,
      outputTokens: true,
      source: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const fourteenDaysAgo = new Date(startOfToday);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  let totalMessages = 0;
  let messagesThisMonth = 0;
  let todayMessages = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let monthInputTokens = 0;
  let monthOutputTokens = 0;

  const modelStats: Record<string, { messages: number; inputTokens: number; outputTokens: number }> = {};
  const dailyCounts: Record<string, number> = {};
  const dailyTokens: Record<string, number> = {};
  const sourceCounts: Record<string, number> = { dashboard: 0, api: 0, "api/openai-compat": 0 };

  // Pre-fill daily slots for last 14 days
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyCounts[key] = 0;
    dailyTokens[key] = 0;
  }

  // Process usage events from instances
  for (const event of usageEvents) {
    const ts = new Date(event.createdAt);
    const count = event.count ?? 1;
    
    totalMessages += count;
    
    if (ts >= startOfMonth) {
      messagesThisMonth += count;
    }
    if (ts >= startOfToday) {
      todayMessages += count;
    }

    // Extract metadata
    let meta: { model?: string; inputTokens?: number; outputTokens?: number; latencyMs?: number; source?: string } | null = null;
    if (event.metadata) {
      try {
        meta = JSON.parse(event.metadata);
      } catch {}
    }

    if (meta?.latencyMs != null) {
      totalLatency += meta.latencyMs;
      latencyCount++;
    }

    const inputTokens = meta?.inputTokens ?? 0;
    const outputTokens = meta?.outputTokens ?? 0;
    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;
    
    if (ts >= startOfMonth) {
      monthInputTokens += inputTokens;
      monthOutputTokens += outputTokens;
    }

    // Per-model aggregation
    if (meta?.model) {
      const key = meta.model;
      if (!modelStats[key]) modelStats[key] = { messages: 0, inputTokens: 0, outputTokens: 0 };
      modelStats[key].messages += count;
      modelStats[key].inputTokens += inputTokens;
      modelStats[key].outputTokens += outputTokens;
    }

    // Daily counts + tokens (last 14 days)
    if (ts >= fourteenDaysAgo) {
      const dayKey = ts.toISOString().slice(0, 10);
      dailyCounts[dayKey] = (dailyCounts[dayKey] ?? 0) + count;
      dailyTokens[dayKey] = (dailyTokens[dayKey] ?? 0) + inputTokens + outputTokens;
    }

    // Source breakdown
    const src = meta?.source ?? event.type ?? "api";
    sourceCounts[src] = (sourceCounts[src] ?? 0) + count;
  }

  // Also process chat messages (fallback for sandbox mode)
  for (const msg of chatMessages) {
    const ts = new Date(msg.createdAt);
    totalMessages++;

    if (ts >= startOfMonth) {
      messagesThisMonth++;
      monthInputTokens += msg.inputTokens ?? 0;
      monthOutputTokens += msg.outputTokens ?? 0;
    }
    if (ts >= startOfToday) todayMessages++;

    if (msg.latencyMs != null) {
      totalLatency += msg.latencyMs;
      latencyCount++;
    }

    totalInputTokens += msg.inputTokens ?? 0;
    totalOutputTokens += msg.outputTokens ?? 0;

    // Per-model aggregation
    if (msg.model) {
      const key = msg.model;
      if (!modelStats[key]) modelStats[key] = { messages: 0, inputTokens: 0, outputTokens: 0 };
      modelStats[key].messages++;
      modelStats[key].inputTokens += msg.inputTokens ?? 0;
      modelStats[key].outputTokens += msg.outputTokens ?? 0;
    }

    // Daily counts + tokens (last 14 days)
    if (ts >= fourteenDaysAgo) {
      const dayKey = ts.toISOString().slice(0, 10);
      dailyCounts[dayKey] = (dailyCounts[dayKey] ?? 0) + 1;
      dailyTokens[dayKey] = (dailyTokens[dayKey] ?? 0) + (msg.inputTokens ?? 0) + (msg.outputTokens ?? 0);
    }

    // Source breakdown
    const src = msg.source ?? "dashboard";
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
  }

  // Top model by message count
  const topModel = Object.entries(modelStats).sort((a, b) => b[1].messages - a[1].messages)[0]?.[0] ?? null;
  const avgLatencyMs = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : null;

  // Cost estimates
  const estimatedCostUsdAllTime = estimateCostUsd(modelStats);
  const estimatedCostUsdThisMonth = (() => {
    // Build a month-only modelStats from chatMessages
    const monthStats: Record<string, { messages: number; inputTokens: number; outputTokens: number }> = {};
    for (const msg of chatMessages) {
      if (new Date(msg.createdAt) >= startOfMonth && msg.model) {
        if (!monthStats[msg.model]) monthStats[msg.model] = { messages: 0, inputTokens: 0, outputTokens: 0 };
        monthStats[msg.model].messages++;
        monthStats[msg.model].inputTokens += msg.inputTokens ?? 0;
        monthStats[msg.model].outputTokens += msg.outputTokens ?? 0;
      }
    }
    return estimateCostUsd(monthStats);
  })();

  // Build 14-day array sorted by date
  const daily = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count, tokens: dailyTokens[date] ?? 0 }));

  // Model breakdown array for UI (sorted by message count desc)
  const modelBreakdown = Object.entries(modelStats)
    .sort((a, b) => b[1].messages - a[1].messages)
    .map(([model, stats]) => ({
      model,
      messages: stats.messages,
      inputTokens: stats.inputTokens,
      outputTokens: stats.outputTokens,
      totalTokens: stats.inputTokens + stats.outputTokens,
    }));

  return NextResponse.json({
    // Message counts
    totalMessages,
    messagesThisMonth,
    todayMessages,

    // Token counts
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    monthInputTokens,
    monthOutputTokens,
    monthTokens: monthInputTokens + monthOutputTokens,

    // Cost estimates (USD)
    estimatedCostUsd: estimatedCostUsdAllTime,
    estimatedCostUsdThisMonth,

    // Performance
    avgLatencyMs,
    topModel,

    // Breakdowns
    modelCounts: Object.fromEntries(Object.entries(modelStats).map(([k, v]) => [k, v.messages])),
    modelBreakdown,
    sourceCounts,

    // Chart data
    daily,
  });
}
