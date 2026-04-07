import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  prefix?: string;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  backend: "upstash" | "memory";
};

type MemoryRateLimitEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, MemoryRateLimitEntry>();
const limiterCache = new Map<string, Ratelimit>();

function now() {
  return Date.now();
}

function buildLimiterId(options: RateLimitOptions) {
  return `${options.prefix ?? "default"}:${options.limit}:${options.windowMs}`;
}

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    return new Redis({ url, token });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("rate_limit_backend_unconfigured");
  }

  return null;
}

function getLimiter(options: RateLimitOptions) {
  const cacheKey = buildLimiterId(options);
  const existing = limiterCache.get(cacheKey);
  if (existing) return existing;

  const redis = getRedisClient();
  if (!redis) return null;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(options.limit, `${Math.ceil(options.windowMs / 1000)} s`),
    prefix: options.prefix ?? "fintax:rate-limit",
    analytics: true,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function cleanupMemoryEntries(currentTime: number) {
  for (const [key, entry] of memoryStore.entries()) {
    if (entry.resetAt <= currentTime) {
      memoryStore.delete(key);
    }
  }
}

function consumeMemoryRateLimit(options: RateLimitOptions): RateLimitResult {
  const currentTime = now();
  cleanupMemoryEntries(currentTime);

  const existing = memoryStore.get(options.key);
  if (!existing || existing.resetAt <= currentTime) {
    memoryStore.set(options.key, {
      count: 1,
      resetAt: currentTime + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, options.limit - 1),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
      backend: "memory",
    };
  }

  existing.count += 1;
  memoryStore.set(options.key, existing);

  return {
    allowed: existing.count <= options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000)),
    backend: "memory",
  };
}

export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const limiter = getLimiter(options);
  if (!limiter) {
    return consumeMemoryRateLimit(options);
  }

  const result = await limiter.limit(options.key);

  return {
    allowed: result.success,
    remaining: result.remaining,
    retryAfterSeconds: Math.max(1, Math.ceil((result.reset - now()) / 1000)),
    backend: "upstash",
  };
}
