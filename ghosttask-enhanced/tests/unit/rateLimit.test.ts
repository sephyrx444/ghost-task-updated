import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimiter } from '@/lib/rateLimit';
import { RateLimitError } from '@/lib/errors';

describe('Rate Limiter', () => {
  it('should allow requests within the specified threshold', () => {
    const ip = '192.168.1.1';
    
    // Call 5 times with a threshold of 10
    expect(() => {
      for (let i = 0; i < 5; i++) {
        rateLimiter(ip, { max: 10 });
      }
    }).not.toThrow();
  });

  it('should throw RateLimitError if requests exceed the specified max threshold', () => {
    const ip = '192.168.1.2';

    expect(() => {
      for (let i = 0; i < 15; i++) {
        rateLimiter(ip, { max: 10 });
      }
    }).toThrow(RateLimitError);
  });
});
