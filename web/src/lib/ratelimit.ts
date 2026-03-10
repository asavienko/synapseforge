/**
 * Simple in-memory rate limiter.
 * For production, replace with Redis-backed (e.g. Upstash).
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Cleanup stale entries every 5 min to avoid memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key      Unique key (e.g. IP address or IP+route)
 * @param max      Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  // Bypass rate limiting in CI/test environment
  if (process.env.DISABLE_RATE_LIMIT === "true") return true;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}
