import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Rate limiter — only active if UPSTASH_REDIS_REST_URL is configured
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

// Preset limiters for different endpoints
const limiters = {
  // Stripe checkout: max 5 per minute per user
  checkout: () => {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(5, "1 m"), prefix: "rl:checkout" });
  },
  // Subscription: max 3 per 10 minutes per user
  subscription: () => {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(3, "10 m"), prefix: "rl:subscription" });
  },
  // Widget leads: max 5 per hour per IP
  widgetLead: () => {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:widget" });
  },
  // Onboarding: max 3 per hour per user
  onboarding: () => {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({ redis: r, limiter: Ratelimit.slidingWindow(3, "1 h"), prefix: "rl:onboarding" });
  },
};

export type RateLimitPreset = keyof typeof limiters;

/**
 * Check rate limit for a request. Returns null if allowed, or a Response if rate limited.
 * Gracefully returns null (allows) if Redis is not configured.
 */
export async function checkRateLimit(
  preset: RateLimitPreset,
  identifier: string
): Promise<NextResponse | null> {
  const limiter = limiters[preset]();
  if (!limiter) return null; // Redis not configured — allow all

  try {
    const { success, remaining, reset } = await limiter.limit(identifier);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }
  } catch {
    // Redis error — fail open (allow the request)
  }

  return null;
}

/**
 * Helper to get identifier from request (IP or user ID)
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
