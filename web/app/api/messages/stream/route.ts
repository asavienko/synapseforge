import { NextResponse } from "next/server";

/**
 * DEPRECATED: SSE stream replaced by 8-second polling in commit 5a86296.
 * Returns 204 immediately to prevent 60-second Lambda timeouts from cached pages.
 */
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
