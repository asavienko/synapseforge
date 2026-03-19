/**
 * Sliding-window rate limiter (in-memory).
 *
 * Works per serverless function instance. For distributed rate limiting
 * across multiple Vercel instances, swap the store for Redis/Upstash.
 *
 * Usage:
 *   const rl = getRateLimiter("api-key-chat", { limit: 60, windowMs: 60_000 });
 *   const result = rl.check("user-identifier");
 *   if (!result.allowed) return rateLimitResponse(result);
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix timestamp (ms) when the window resets
}

export interface RateLimitOptions {
  /** Max requests allowed per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface BucketEntry {
  timestamps: number[]; // sliding log of request timestamps
}

class SlidingWindowRateLimiter {
  private store = new Map<string, BucketEntry>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(opts: RateLimitOptions) {
    this.limit = opts.limit;
    this.windowMs = opts.windowMs;

    // Periodically clean up stale entries to avoid memory growth
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), Math.min(this.windowMs * 2, 5 * 60_000));
    }
  }

  check(key: string): RateLimitResult {
    // Bypass in CI / test environments
    if (process.env.DISABLE_RATE_LIMIT === "true") {
      return { allowed: true, limit: this.limit, remaining: this.limit, resetAt: Date.now() + this.windowMs };
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      this.store.set(key, entry);
    }

    // Evict timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

    const count = entry.timestamps.length;
    const allowed = count < this.limit;

    if (allowed) {
      entry.timestamps.push(now);
    }

    // Reset time = when the oldest timestamp in the window expires
    const oldest = entry.timestamps[0] ?? now;
    const resetAt = oldest + this.windowMs;
    const remaining = Math.max(0, this.limit - entry.timestamps.length);

    return { allowed, limit: this.limit, remaining, resetAt };
  }

  private cleanup() {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, entry] of this.store.entries()) {
      if (entry.timestamps.length === 0 || entry.timestamps[entry.timestamps.length - 1] < cutoff) {
        this.store.delete(key);
      }
    }
  }
}

// ── Singleton registry ────────────────────────────────────────────────────────
// Each named limiter is a separate rate-limit namespace

const limiters = new Map<string, SlidingWindowRateLimiter>();

export function getRateLimiter(name: string, opts: RateLimitOptions): SlidingWindowRateLimiter {
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new SlidingWindowRateLimiter(opts);
    limiters.set(name, limiter);
  }
  return limiter;
}

// ── Predefined limiters ───────────────────────────────────────────────────────

/** Public API chat — 60 req/min per API key */
export const publicChatLimiter = getRateLimiter("public-chat", {
  limit: 60,
  windowMs: 60_000,
});

/** Dashboard chat — 30 req/min per user session */
export const dashboardChatLimiter = getRateLimiter("dashboard-chat", {
  limit: 30,
  windowMs: 60_000,
});

/** Auth endpoints (login, register, forgot-password) — 10 req/min per IP */
export const authLimiter = getRateLimiter("auth", {
  limit: 10,
  windowMs: 60_000,
});

// ── Response helpers ──────────────────────────────────────────────────────────

/**
 * Build rate limit response headers.
 * Follows RFC 6585 + de-facto X-RateLimit-* convention.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(retryAfterSec) }),
  };
}

/**
 * Get the best identifier for rate limiting a request.
 * Prefers a passed key (e.g. API key), falls back to IP.
 */
export function getRateLimitKey(req: Request, prefix: string, id?: string): string {
  if (id) return `${prefix}:${id}`;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  return `${prefix}:ip:${ip}`;
}
