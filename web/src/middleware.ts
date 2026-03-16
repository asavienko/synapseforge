import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

/**
 * Global rate limiting middleware for user-facing API routes.
 *
 * Limits are defined per route prefix:
 * - /api/chat: 30 req/min
 * - /api/billing: 30 req/min
 * - /api/instances: 60 req/min
 * - /api/knowledge: 60 req/min
 * - others: 60 req/min default
 */

const routeLimits: Record<string, { max: number; windowMs: number }> = {
  "/api/chat": { max: 30, windowMs: 60_000 },
  "/api/billing": { max: 30, windowMs: 60_000 },
  "/api/instances": { max: 60, windowMs: 60_000 },
  "/api/knowledge": { max: 60, windowMs: 60_000 },
  "/api/internal": { max: 100, windowMs: 60_000 }, // internal tooling
  "/api/admin": { max: 100, windowMs: 60_000 },
  "/api/webhooks": { max: 100, windowMs: 60_000 }, // high volume expected
  "/api/cron": { max: 120, windowMs: 60_000 }, // cron jobs
  "/api/messages": { max: 120, windowMs: 60_000 },
  "/api/notifications": { max: 120, windowMs: 60_000 },
};

function getLimitForPath(pathname: string): { max: number; windowMs: number } {
  // Find most specific prefix match
  const sortedPrefixes = Object.keys(routeLimits).sort((a, b) => b.length - a.length);
  for (const prefix of sortedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return routeLimits[prefix];
    }
  }
  // Default limit
  return { max: 60, windowMs: 60_000 };
}

export async function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const { max, windowMs } = getLimitForPath(request.nextUrl.pathname);

  // Generate key: IP + route (to limit per endpoint per IP)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
             request.headers.get("x-real-ip") ??
             "unknown";
  const route = request.nextUrl.pathname;
  const key = `${ip}:${route}`;

  try {
    const allowed = await rateLimit(key, max, windowMs);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": Math.ceil(windowMs / 1000).toString() } }
      );
    }
  } catch (error) {
    // If rate limiting fails (e.g., Redis down), allow the request but log
    console.error("[Rate limit middleware] Error:", error);
  }

  return NextResponse.next();
}

// Match on all API routes
export const config = {
  matcher: [
    "/api/chat/:path*",
    "/api/instances/:path*",
    "/api/billing/:path*",
    "/api/knowledge/:path*",
    "/api/internal/:path*",
    "/api/admin/:path*",
    "/api/feedback/:path*",
    "/api/webhooks/:path*",
    "/api/cron/:path*",
    "/api/messages/:path*",
    "/api/notifications/:path*",
    "/api/onboarding/:path*",
    "/api/referral/:path*",
    "/api/upgrade",
    "/api/user/:path*",
    "/api/v1/:path*",
    "/api/versions/:path*",
    "/api/waitlist",
    "/api/white-label",
    "/api/telegram/:path*",
    "/api/setup-:path*",
    "/api/og",
    "/api/contact",
    "/api/demo/chat",
  ],
};
