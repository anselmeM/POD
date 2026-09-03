import { NextRequest, NextResponse } from "next/server";

export interface RateLimitOptions {
  limit: number;
  windowMs: number; // e.g. 60000 for 1 minute
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  retryAfterSeconds: number;
}

interface WindowBucket {
  timestamps: number[];
}

// In-memory sliding window bucket store
const memoryStore = new Map<string, WindowBucket>();

// Periodic cleanup of stale keys every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < 120000);
      if (bucket.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 300000).unref?.();
}

/**
 * Extracts client IP from request headers (proxies, Cloudflare, direct).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Checks and increments rate limit for a given key using a sliding window.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let bucket = memoryStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    memoryStore.set(key, bucket);
  }

  // Filter timestamps to current window
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);

  if (bucket.timestamps.length >= options.limit) {
    const oldestTimestamp = bucket.timestamps[0] || now;
    const resetMs = Math.max(0, oldestTimestamp + options.windowMs - now);
    const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));

    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetMs,
      retryAfterSeconds,
    };
  }

  bucket.timestamps.push(now);
  const remaining = Math.max(0, options.limit - bucket.timestamps.length);
  const resetMs = options.windowMs;
  const retryAfterSeconds = Math.ceil(resetMs / 1000);

  return {
    success: true,
    limit: options.limit,
    remaining,
    resetMs,
    retryAfterSeconds,
  };
}

/**
 * Creates standard HTTP 429 Too Many Requests response with RFC rate limit headers.
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const resetTimestamp = Math.ceil((Date.now() + result.resetMs) / 1000);

  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please retry in ${result.retryAfterSeconds} seconds.`,
      retryAfter: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(resetTimestamp),
        "Retry-After": String(result.retryAfterSeconds),
      },
    }
  );
}

/**
 * Clear the in-memory store (used for test isolation).
 */
export function _resetRateLimitStore(): void {
  memoryStore.clear();
}
