import { RateLimitError } from './errors';

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitTracker>();

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default 1 minute)
  max?: number;      // Maximum requests per window (default 60)
}

/**
 * Basic IP rate-limiting logic for API route handlers
 */
export function rateLimiter(ip: string, options: RateLimitOptions = {}): void {
  const windowMs = options.windowMs || 60000; // 1 min
  const max = options.max || 100;

  const now = Date.now();
  const clientKey = `${ip}`;

  const record = memoryStore.get(clientKey);

  if (!record) {
    memoryStore.set(clientKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return;
  }

  if (now > record.resetTime) {
    // Reset window
    record.count = 1;
    record.resetTime = now + windowMs;
    return;
  }

  record.count += 1;
  if (record.count > max) {
    throw new RateLimitError();
  }
}
