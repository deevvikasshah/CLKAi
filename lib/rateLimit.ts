/**
 * In-memory fixed-window rate limiter. Fine for a single-instance deploy
 * (the "affordable and simple" target this project is scoped for). If
 * CLKAi later scales to multiple server instances, swap this for a shared
 * store (e.g. Upstash Redis — still cheap) so limits apply across
 * instances; the call sites below don't need to change, only this file.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

// Named presets matching the brief's required rate-limited surfaces.
export const RATE_LIMITS = {
  LOGIN: { limit: 5, windowMs: 60_000 },
  PASSWORD_RESET: { limit: 3, windowMs: 60_000 * 15 },
  CONTACT_FORM: { limit: 5, windowMs: 60_000 },
  REPAIR_BOOKING: { limit: 5, windowMs: 60_000 },
  CHECKOUT: { limit: 10, windowMs: 60_000 },
  PRODUCT_ENQUIRY: { limit: 5, windowMs: 60_000 },
  SEARCH: { limit: 30, windowMs: 60_000 },
  DEFAULT_API: { limit: 60, windowMs: 60_000 },
} as const;

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
