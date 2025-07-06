import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { validateCustomSection, validateAllCustomSections } from './customSectionValidation';

describe('customSectionValidation', () => {
  describe('validateCustomSection', () => {
    it('should validate code-snippet type', () => {
      const section = { id: '1', name: 'Code', type: 'textarea', isVisible: true, required: true, inputValidation: { type: 'code-snippet' } };
      expect(validateCustomSection(section, '')).toEqual({ isValid: false, message: 'Code snippet is required' });
      expect(validateCustomSection(section, 'console.log(1);')).toEqual({ isValid: true });
    });
    it('should validate bdd type', () => {
      const section = { id: '2', name: 'BDD', type: 'textarea', isVisible: true, required: true, inputValidation: { type: 'bdd' } };
      expect(validateCustomSection(section, 'Given something')).toEqual({ isValid: false, message: expect.stringContaining('Given, When, and Then') });
      expect(validateCustomSection(section, 'Given x\nWhen y\nThen z')).toEqual({ isValid: true });
    });
    it('should validate regex type', () => {
      const section = { id: '3', name: 'Regex', type: 'textarea', isVisible: true, required: true, inputValidation: { type: 'regex', pattern: '^abc$', errorMessage: 'Must be abc' } };
      expect(validateCustomSection(section, 'def')).toEqual({ isValid: false, message: 'Must be abc' });
      expect(validateCustomSection(section, 'abc')).toEqual({ isValid: true });
    });
    it('should return valid for section with no inputValidation', () => {
      const section = { id: '4', name: 'NoValidation', type: 'textarea', isVisible: true, required: false };
      expect(validateCustomSection(section, 'anything')).toEqual({ isValid: true });
    });
  });

  describe('validateAllCustomSections', () => {
    const template = {
      id: 't1',
      name: 'Test',
      role: 'role1',
      description: '',
      expertise: [],
      content: '',
      isDefault: false,
      customSections: [
        { id: 's1', name: 'Code', type: 'textarea', isVisible: true, required: true, inputValidation: { type: 'code-snippet' } },
        { id: 's2', name: 'BDD', type: 'textarea', isVisible: true, required: true, inputValidation: { type: 'bdd' } },
        { id: 's3', name: 'Regex', type: 'textarea', isVisible: true, required: true, inputValidation: { type: 'regex', pattern: '^abc$', errorMessage: 'Must be abc' } },
        { id: 's4', name: 'Multi', type: 'multiselect', isVisible: true, required: true }
      ]
    };
    it('should return errors for invalid sections', async () => {
      const result = await validateAllCustomSections(template, { s1: '', s2: 'Given' }, { s4: [] });
      expect(result.isValid).toBe(false);
      expect(result.errors.s1).toBeDefined();
      expect(result.errors.s2).toBeDefined();
      expect(result.errors.s3).toBeDefined();
      expect(result.errors.s4).toBeDefined();
    });
    it('should return valid for all valid sections', async () => {
      const result = await validateAllCustomSections(
        template,
        { s1: 'code', s2: 'Given x\nWhen y\nThen z', s3: 'abc' },
        { s4: ['one'] }
      );
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });
    it('should return error if no template', async () => {
      const result = await validateAllCustomSections(null as any, {}, {});
      expect(result.isValid).toBe(false);
      expect(result.errors.general).toBeDefined();
    });
  });
});
