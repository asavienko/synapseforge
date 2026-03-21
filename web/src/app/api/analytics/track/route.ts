import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/analytics/track
 *
 * Track analytics events. Lightweight endpoint that stores events
 * for later analysis.
 * 
 * TODO: Uncomment database storage after running migration:
 * npx prisma migrate dev --name add_analytics_event
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const { event, properties, url } = body;

    if (!event) {
      return NextResponse.json({ error: "Event name required" }, { status: 400 });
    }

    // Log to console for now (database storage requires migration)
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", { event, properties, url, userId: session?.user?.id });
    }

    // TODO: Store in database after migration
    // await prisma.analyticsEvent.create({...})

    return NextResponse.json({ success: true });
  } catch {
    // Silently fail - analytics shouldn't break the app
    return NextResponse.json({ success: false }, { status: 500 });
  }
}