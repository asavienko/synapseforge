import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_INTENTS = ["booking", "pricing", "complaint", "faq", "out_of_scope", "other"] as const;
type Intent = (typeof VALID_INTENTS)[number];

interface IntentBreakdown {
  booking: number;
  pricing: number;
  complaint: number;
  faq: number;
  out_of_scope: number;
  other: number;
}

interface UnansweredQuestion {
  id: string;
  content: string;
  createdAt: string;
}

interface IntentTrend {
  intent: string;
  currentWeek: number;
  previousWeek: number;
  change: number; // percentage change
}

interface InsightsResponse {
  intentBreakdown: IntentBreakdown;
  totalMessages: number;
  answeredCount: number;
  unansweredCount: number;
  recentUnanswered: UnansweredQuestion[];
  intentTrends: IntentTrend[];
  conversationQuality: number; // percentage of answered messages
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify user owns the instance
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Calculate date ranges for trend comparison
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch all messages for this instance with intent data
  const messages = await prisma.chatMessage.findMany({
    where: { instanceId: id },
    select: {
      id: true,
      role: true,
      intent: true,
      wasAnswered: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate intent breakdown
  const intentBreakdown: IntentBreakdown = {
    booking: 0,
    pricing: 0,
    complaint: 0,
    faq: 0,
    out_of_scope: 0,
    other: 0,
  };

  let answeredCount = 0;
  let unansweredCount = 0;
  const recentUnanswered: UnansweredQuestion[] = [];

  // Track intents for trend analysis
  const currentWeekIntents: Record<string, number> = {};
  const previousWeekIntents: Record<string, number> = {};

  for (const message of messages) {
    // Count intents
    const intent = message.intent as Intent | null;
    if (intent && VALID_INTENTS.includes(intent)) {
      intentBreakdown[intent]++;
    } else {
      intentBreakdown.other++;
    }

    // Count answered/unanswered
    if (message.wasAnswered) {
      answeredCount++;
    } else {
      unansweredCount++;
      // Collect recent unanswered questions (max 10)
      if (recentUnanswered.length < 10 && message.role === "user") {
        recentUnanswered.push({
          id: message.id,
          content: message.content.slice(0, 200), // Truncate long messages
          createdAt: message.createdAt.toISOString(),
        });
      }
    }

    // Track intent trends
    const messageDate = message.createdAt;
    const intentKey = intent || "other";
    
    if (messageDate >= sevenDaysAgo) {
      currentWeekIntents[intentKey] = (currentWeekIntents[intentKey] || 0) + 1;
    } else if (messageDate >= fourteenDaysAgo && messageDate < sevenDaysAgo) {
      previousWeekIntents[intentKey] = (previousWeekIntents[intentKey] || 0) + 1;
    }
  }

  // Calculate intent trends
  const allIntents = new Set([
    ...Object.keys(currentWeekIntents),
    ...Object.keys(previousWeekIntents),
  ]);

  const intentTrends: IntentTrend[] = Array.from(allIntents)
    .map((intent) => {
      const current = currentWeekIntents[intent] || 0;
      const previous = previousWeekIntents[intent] || 0;
      let change = 0;
      
      if (previous === 0) {
        change = current > 0 ? 100 : 0;
      } else {
        change = Math.round(((current - previous) / previous) * 100);
      }

      return {
        intent,
        currentWeek: current,
        previousWeek: previous,
        change,
      };
    })
    .sort((a, b) => b.currentWeek - a.currentWeek)
    .slice(0, 5); // Top 5 intents

  const totalMessages = messages.length;
  const conversationQuality = totalMessages > 0 
    ? Math.round((answeredCount / totalMessages) * 100) 
    : 0;

  const response: InsightsResponse = {
    intentBreakdown,
    totalMessages,
    answeredCount,
    unansweredCount,
    recentUnanswered,
    intentTrends,
    conversationQuality,
  };

  return NextResponse.json(response);
}
