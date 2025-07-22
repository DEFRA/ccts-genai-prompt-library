import { describe, it, expect, vi } from 'vitest';
import { generateUniqueId } from './helpers';

describe('generateUniqueId', () => {
  it('should return a string starting with id-', () => {
    const id = generateUniqueId();
    expect(id.startsWith('id-')).toBe(true);
    expect(id.length).toBeGreaterThan('id-'.length);
  });

  it('should return a unique value on each call', () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).not.toBe(id2);
  });

  it('should use Node.js fallback when globalThis.crypto is unavailable', () => {
    // Mock globalThis.crypto to be undefined
    const originalCrypto = globalThis.crypto;
    delete globalThis.crypto;

    // Spy on require('crypto').randomBytes
    const crypto = require('crypto');
    const randomBytesSpy = vi.spyOn(crypto, 'randomBytes');

    const id = generateUniqueId();
    expect(id.startsWith('id-')).toBe(true);
    expect(id.length).toBeGreaterThan('id-'.length);
    expect(randomBytesSpy).toHaveBeenCalled();

    // Restore original globalThis.crypto
    globalThis.crypto = originalCrypto;
    randomBytesSpy.mockRestore();
  });

  it('should use Node.js fallback when globalCrypto.getRandomValues is not a function', () => {
    // Mock globalThis.crypto with no getRandomValues function
    const originalCrypto = globalThis.crypto;
    globalThis.crypto = { getRandomValues: undefined } as any;

    // Spy on require('crypto').randomBytes
    const crypto = require('crypto');
    const randomBytesSpy = vi.spyOn(crypto, 'randomBytes');

    const id = generateUniqueId();
    expect(id.startsWith('id-')).toBe(true);
    expect(id.length).toBeGreaterThan('id-'.length);
    expect(randomBytesSpy).toHaveBeenCalled();

    // Restore original globalThis.crypto
    globalThis.crypto = originalCrypto;
    randomBytesSpy.mockRestore();
  });
});
