import { Redis } from "ioredis";

let redisClient: Redis;

// Initialize Redis client if available
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Returns true if the request is allowed, false if rate limited.
 * @param key      Unique key (e.g. IP address or IP+route)
 * @param max      Max requests allowed in the window
 * @param windowMs Window size in milliseconds
 */
export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  // Bypass rate limiting in CI/test environment
  if (process.env.DISABLE_RATE_LIMIT === "true") return true;

  if (!redisClient) {
    // Fallback to in-memory if Redis not configured
    return inMemoryRateLimit(key, max, windowMs);
  }

  try {
    const current = await redisClient.incr(key);
    if (current === 1) {
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
    }
    return current <= max;
  } catch {
    // Fallback to in-memory if Redis operation fails
    return inMemoryRateLimit(key, max, windowMs);
  }
}

function inMemoryRateLimit(key: string, max: number, windowMs: number): boolean {
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
