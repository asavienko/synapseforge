import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics/track
 *
 * Track analytics events. Lightweight endpoint that stores events
 * for later analysis.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { event, properties, timestamp, url, userAgent } = body;

    if (!event) {
      return NextResponse.json({ error: "Event name required" }, { status: 400 });
    }

    // Store event in database
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