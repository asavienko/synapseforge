import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Health check endpoint for CI/CD and monitoring.
 * Returns 200 OK if the application is running.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "synapseforge-web",
  }, { status: 200 });
}
