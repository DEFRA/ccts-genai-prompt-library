import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import {
  validateApiKey,
  validateEnvironment,
  validateRequestParams,
  validateUrl,
  validateRole,
  validateTemplate,
  sanitizeInput,
  validateTemplateInput,
  validateRoleInput
} from './validation';

describe('validation utilities', () => {
  describe('validateApiKey', () => {
    it('should return false for undefined or empty apiKey', () => {
      expect(validateApiKey()).toBe(false);
      expect(validateApiKey('')).toBe(false);
    });
    it('should return true for valid apiKey', () => {
      expect(validateApiKey('Abcdefghijklmnopqrstuvwxyz123456')).toBe(true);
      expect(validateApiKey('Abcdefghijklmnopqrstuvwxyz1234567890_--__')).toBe(true);
    });
    it('should return false for invalid apiKey', () => {
      expect(validateApiKey('short')).toBe(false);
      expect(validateApiKey('!@#$%^&*()')).toBe(false);
    });
  });

  describe('validateRequestParams', () => {
    it('should throw error if required field is missing', () => {
      expect(() => validateRequestParams({ a: 1 }, ['a', 'b'])).toThrow('Missing required field: b');
    });
    it('should return sanitized params with only defined values', () => {
      const params = { a: 1, b: undefined, c: 2 };
      const result = validateRequestParams(params, ['a', 'c']);
      expect(result).toEqual({ a: 1, c: 2 });
    });
  });

  describe('validateUrl', () => {
    it('should return normalized url for valid http/https', () => {
      expect(validateUrl('https://example.com')).toBe('https://example.com/');
      expect(validateUrl('http://example.com')).toBe('http://example.com/');
    });
    it('should throw error for invalid protocol', () => {
      expect(() => validateUrl('ftp://example.com')).toThrow('Invalid URL protocol');
    });
    it('should throw error for invalid url', () => {
      expect(() => validateUrl('not-a-url')).toThrow('Invalid URL format');
    });
  });

  describe('validateRole', () => {
    const baseRole = { id: '1', name: 'Admin', description: 'desc', expertise: [], isDefault: false };
    it('should return false if required fields are missing', () => {
      expect(validateRole({ ...baseRole, id: '' }, [])).toBe(false);
      expect(validateRole({ ...baseRole, name: '' }, [])).toBe(false);
      expect(validateRole({ ...baseRole, description: '' }, [])).toBe(false);
    });
    it('should return false if duplicate name exists', () => {
      const existing = [{ ...baseRole, id: '2', name: 'Admin' }];
      expect(validateRole(baseRole, existing)).toBe(false);
    });
    it('should return true for valid unique role', () => {
      expect(validateRole(baseRole, [])).toBe(true);
    });
  });

  describe('validateTemplate', () => {
    const role = { id: 'r1', name: 'Role', description: 'desc', expertise: [], isDefault: false };
    const template = { id: 't1', name: 'Template', role: 'r1', description: '', expertise: [], content: '', isDefault: false };
    it('should return false if required fields are missing', () => {
      expect(validateTemplate({ ...template, id: '' }, [role])).toBe(false);
      expect(validateTemplate({ ...template, name: '' }, [role])).toBe(false);
      expect(validateTemplate({ ...template, role: '' }, [role])).toBe(false);
    });
    it('should return false if role does not exist', () => {
      expect(validateTemplate(template, [])).toBe(false);
    });
    it('should return true for valid template and role', () => {
      expect(validateTemplate(template, [role])).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim and remove angle brackets', () => {
      expect(sanitizeInput('  <script>test</script>  ')).toBe('scripttest/script');
    });
  });

  describe('validateTemplateInput', () => {
    it('should return false if name is missing or too short', () => {
      expect(validateTemplateInput({})).toBe(false);
      expect(validateTemplateInput({ name: 'ab' })).toBe(false);
    });
    it('should return false if description is too long', () => {
      expect(validateTemplateInput({ name: 'abc', description: 'a'.repeat(501) })).toBe(false);
    });
    it('should return true for valid input', () => {
      expect(validateTemplateInput({ name: 'abc', description: 'desc' })).toBe(true);
    });
  });

  describe('validateRoleInput', () => {
    it('should return false if name is missing or too short', () => {
      expect(validateRoleInput({})).toBe(false);
      expect(validateRoleInput({ name: 'a' })).toBe(false);
    });
    it('should return false if expertise is not an array', () => {
      expect(validateRoleInput({ name: 'abc', expertise: 'not-an-array' as any })).toBe(false);
    });
    it('should return true for valid input', () => {
      expect(validateRoleInput({ name: 'abc', expertise: [] })).toBe(true);
    });
  });
});
