/**
 * Rate limiting utilities
 * 
 * For production, use @upstash/ratelimit with Redis for distributed rate limiting.
 * This is a simple in-memory implementation for development/testing.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier: string; // Unique identifier (IP, user ID, etc.)
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Simple in-memory rate limiter
 * For production, replace with @upstash/ratelimit
 */
export function rateLimit({
  windowMs,
  maxRequests,
  identifier,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries
  Object.keys(store).forEach((k) => {
    if (store[k].resetTime < now) {
      delete store[k];
    }
  });

  // Get or create entry
  let entry = store[key];

  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    store[key] = entry;
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;

  if (entry.count > maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (set by proxy/load balancer)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return ip;
}

/**
 * Rate limit presets for common use cases
 */
export const rateLimitPresets = {
  // Authentication endpoints - strict
  auth: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  // API endpoints - moderate
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  // General endpoints - lenient
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
};

