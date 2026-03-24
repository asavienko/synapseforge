import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics/track
 *
 * Track analytics events. Stores events in database for analysis.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { event, properties, url, userAgent, timestamp } = body;

    if (!event) {
      return NextResponse.json({ error: "Event name required" }, { status: 400 });
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", { event, properties, url, userId: session?.user?.id });
    }

    // Store in database
    await prisma.analyticsEvent.create({
      data: {
        event,
        properties: properties || {},
        userId: session?.user?.id || null,
        url: url || null,
        userAgent: userAgent || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    // Silently fail - analytics shouldn't break the app
    return NextResponse.json({ success: false }, { status: 500 });
  }
}