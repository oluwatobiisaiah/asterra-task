import { TRPCError } from '@trpc/server';
import { cacheService } from '../services/cache.service';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
}

export const createRateLimiter = (options: RateLimitOptions = {}) => {
  const {
    windowMs = 60 * 1000,
    max = 60,
    keyPrefix = 'ratelimit',
  } = options;

  return (identifier: string) => {
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    let record = cacheService.get<RateLimitRecord>(key);

    if (!record || record.resetTime < now) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };

	  cacheService.set(key, record, Math.ceil(windowMs / 1000));
      return {
        limit: max,
        remaining: max - 1,
        reset: record.resetTime,
      };
    }

    record.count++;
    cacheService.set(key, record, Math.ceil((record.resetTime - now) / 1000));

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        cause: {
          retryAfter,
          limit: max,
          remaining: 0,
          reset: record.resetTime,
        },
      });
    }

    return {
      limit: max,
      remaining: max - record.count,
      reset: record.resetTime,
    };
  };
};

export const rateLimiters = {
  // Strict limit for write operations (mutations)
  strict: createRateLimiter({
    windowMs: 60 * 1000,
    max: Number(process.env.STRICT_RATE_LIMIT) || 20,
    keyPrefix: 'strict',
  }),

  // Normal limit for general API calls
  normal: createRateLimiter({
    windowMs: 60 * 1000,
    max: Number(process.env.NORMAL_RATE_LIMIT) || 60,
    keyPrefix: 'normal',
  }),

  // Lenient limit for read operations (queries)
  lenient: createRateLimiter({
    windowMs: 60 * 1000,
    max: Number(process.env.LENIENT_RATE_LIMIT) || 100,
    keyPrefix: 'lenient',
  }),
};

export const getRateLimitStats = (): {
  totalTrackedIPs: number;
  cacheStats: ReturnType<typeof cacheService.getStats>;
} => {
  const keys = cacheService.keys();
  const rateLimitKeys = keys.filter(key => 
    key.startsWith('strict:') || 
    key.startsWith('normal:') || 
    key.startsWith('lenient:')
  );

  return {
    totalTrackedIPs: rateLimitKeys.length,
    cacheStats: cacheService.getStats(),
  };
};