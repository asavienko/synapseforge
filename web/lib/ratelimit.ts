let redisClient: import("ioredis").Redis | undefined;

// Initialize Redis client if available (lazy import to avoid serverless crashes)
if (process.env.REDIS_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("ioredis");
    redisClient = new Redis(process.env.REDIS_URL);
  } catch (e) {
    console.error("[rateLimit] Failed to initialize Redis:", e);
  }
}

/**
 * In-memory rate limit store per worker.
 * Note: In a multi-worker deployment (e.g., multiple Vercel instances),
 * in-memory limits will not be consistent across workers.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 min to avoid memory leak
let cleanupInterval: NodeJS.Timeout | undefined;
if (typeof setInterval !== "undefined") {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.resetAt) memoryStore.delete(key);
    }
  }, 5 * 60 * 1000);
}

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
  } catch (error) {
    console.error("[rateLimit] Redis error, falling back to in-memory:", error);
    // Fallback to in-memory if Redis operation fails
    return inMemoryRateLimit(key, max, windowMs);
  }
}

function inMemoryRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}
