import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
// Mock DOMPurify for Node.js environment
vi.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: (input: string) => input // identity function for test
  }
}));
import { sanitizeInput, sanitizeFilename } from './security';

describe('security utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove null bytes and dangerous SQL keywords', () => {
      const input = 'select * from users;\0drop table users;';
      const result = sanitizeInput(input);
      expect(result).not.toMatch(/select|drop|;/i);
    });
    it('should remove special shell characters', () => {
      const input = 'test; rm -rf / | echo';
      const result = sanitizeInput(input);
      expect(result).not.toMatch(/[;&|`]/);
    });
    it('should trim and collapse whitespace', () => {
      const input = '   hello    world   ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello world');
    });
    it('should throw if input is not a string', () => {
      expect(() => sanitizeInput(null as any)).toThrow('Input must be a string');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters and trim', () => {
      const input = ' ../my<file>?name.txt ';
      const result = sanitizeFilename(input);
      expect(result).toBe('myfilename.txt');
    });
    it('should return unnamed_file if sanitized is empty', () => {
      expect(sanitizeFilename('////')).toBe('unnamed_file');
    });
    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result.endsWith('.txt')).toBe(true);
    });
    it('should throw if filename is not a string', () => {
      expect(() => sanitizeFilename(undefined as any)).toThrow('Filename must be a string');
    });
  });
});
