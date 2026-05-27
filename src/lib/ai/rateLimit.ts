import type { NextRequest } from "next/server";

/**
 * Naive in-memory rate limiter.
 *
 * Trade-off (intentional for this assignment): on Vercel each serverless
 * instance has its own Map, so an attacker spreading requests across cold
 * starts gets a multiplied effective limit. The point here is to demonstrate
 * awareness and stop the obvious "single tab, hammer Generate" abuse — not
 * to ship production-grade DDoS protection. For prod, swap this for
 * `@upstash/ratelimit` + Vercel KV (Redis), which adds 5 lines and proper
 * cross-instance counters.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  /** UNIX ms at which the bucket resets. Used for the `Retry-After` header. */
  resetAt: number;
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(ip, { count: 1, resetAt });
    return { allowed: true, resetAt };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { allowed: false, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, resetAt: bucket.resetAt };
}

/**
 * Extract the client IP from common proxy headers. Vercel sets
 * `x-forwarded-for` reliably; the first entry in the chain is the client.
 * Falls back to a constant string so all anonymous callers share one bucket
 * (i.e. the limit still applies, just collectively).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "anonymous";
}
