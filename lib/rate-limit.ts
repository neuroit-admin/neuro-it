// =============================================================================
// Neuro IT — DB-backed Rate Limiter
// Works across all serverless instances (no in-memory state).
// Uses the RateLimit table in PostgreSQL via Prisma.
// Falls back gracefully if DB is unavailable (allow request, log warning).
// =============================================================================

import { prisma } from '@/lib/prisma'

export interface RateLimitConfig {
  /** Unique key prefix, e.g. "ai-chat" */
  prefix: string
  /** Max requests allowed in the window */
  limit: number
  /** Window size in seconds */
  windowSecs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check and increment rate limit counter for a given identifier.
 * @param identifier  IP address, userId, or sessionToken
 * @param config      Limit configuration
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const key      = `${config.prefix}:${identifier}`
  const now      = new Date()
  const windowMs = config.windowSecs * 1000

  try {
    // Use a transaction to safely read-modify-write
    const result = await prisma.$transaction(async tx => {
      const existing = await tx.rateLimit.findUnique({ where: { key } })

      // Window expired or no record — reset
      if (!existing || existing.windowEnd < now) {
        const windowEnd = new Date(now.getTime() + windowMs)
        await tx.rateLimit.upsert({
          where:  { key },
          update: { count: 1, windowEnd },
          create: { key, count: 1, windowEnd },
        })
        return { count: 1, windowEnd }
      }

      // Within window — increment
      const updated = await tx.rateLimit.update({
        where: { key },
        data:  { count: { increment: 1 } },
      })
      return { count: updated.count, windowEnd: updated.windowEnd }
    })

    const remaining = Math.max(0, config.limit - result.count)
    return {
      success:   result.count <= config.limit,
      remaining,
      resetAt:   result.windowEnd,
    }
  } catch (err) {
    // If DB is unavailable, allow request but log warning
    console.warn('[RateLimit] DB unavailable — allowing request:', err)
    return { success: true, remaining: config.limit, resetAt: new Date(now.getTime() + windowMs) }
  }
}

// ---------------------------------------------------------------------------
// Pre-configured limiters — import these directly in route handlers
// ---------------------------------------------------------------------------

/** AI chat: 20 requests per minute per IP */
export const AI_CHAT_LIMIT: RateLimitConfig = {
  prefix:     'ai-chat',
  limit:      20,
  windowSecs: 60,
}

/** Booking creation: 5 per hour per IP */
export const BOOKING_LIMIT: RateLimitConfig = {
  prefix:     'booking',
  limit:      5,
  windowSecs: 3600,
}

/** Auth attempts: 10 per 15 minutes per IP */
export const AUTH_LIMIT: RateLimitConfig = {
  prefix:     'auth',
  limit:      10,
  windowSecs: 900,
}

/** Contact submissions: 3 requests per hour per IP */
export const CONTACT_LIMIT: RateLimitConfig = {
  prefix:     'contact',
  limit:      3,
  windowSecs: 3600,
}

/** Tracking attempts: 15 per 15 minutes per IP */
export const TRACKING_LIMIT: RateLimitConfig = {
  prefix:     'tracking',
  limit:      15,
  windowSecs: 900,
}

/**
 * Extract real IP from Next.js request headers.
 * Works behind Vercel edge, Cloudflare, and standard proxies.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get('cf-connecting-ip')        ??  // Cloudflare
    headers.get('x-real-ip')               ??  // Nginx
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '0.0.0.0'
  )
}
