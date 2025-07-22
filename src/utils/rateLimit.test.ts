import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { rateLimit } from './rateLimit';

describe('rateLimit utility', () => {
  it('should allow requests within the limit', async () => {
    const limiter = rateLimit(3, 1000); // 3 requests per 1 second
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
  });

  it('should reject requests over the limit', async () => {
    const limiter = rateLimit(2, 1000); // 2 requests per 1 second
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
    await expect(limiter.checkLimit()).rejects.toThrow('Rate limit exceeded');
  });

  it('should allow requests again after time window', async () => {
    const limiter = rateLimit(1, 100); // 1 request per 100ms
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
    await expect(limiter.checkLimit()).rejects.toThrow('Rate limit exceeded');
    await new Promise(res => setTimeout(res, 120));
    await expect(limiter.checkLimit()).resolves.toBeUndefined();
  });
});
