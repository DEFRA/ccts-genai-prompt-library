import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import {
  validateTemplateForm,
  validateSpecificTemplateType,
  validateTemplateData,
  prepareTemplateData
} from './templateValidation';

const baseContext = {
  selectedRole: 'role1',
  selectedExpertise: 'expert1',
  selectedTemplate: {
    id: 't1',
    name: 'Template',
    role: 'role1',
    description: '',
    expertise: [],
    content: '',
    isDefault: false,
    customSections: [
      { id: 's1', name: 'Section', type: 'textarea', isVisible: true, required: true }
    ]
  },
  customSections: { s1: 'Some content' },
  selectedMultiSections: {},
  expertiseOptions: ['expert1'],
  programmingLanguage: 'js',
  uploadedFiles: [],
  roles: [],
  allRoles: [],
  filteredTemplates: [],
  defaultRoles: [],
  defaultTemplates: [],
  userTemplates: [],
  templates: [],
  languages: []
};

describe('templateValidation utilities', () => {
  describe('validateTemplateForm', () => {
    it('should return valid for correct context', () => {
      const result = validateTemplateForm(baseContext);
      expect(result.isValid).toBe(true);
    });
    it('should return invalid if role is missing', () => {
      const ctx = { ...baseContext, selectedRole: '' };
      const result = validateTemplateForm(ctx);
      expect(result.isValid).toBe(false);
      expect(result.errors.role).toBeDefined();
    });
    it('should return invalid if expertise is required but missing', () => {
      const ctx = { ...baseContext, selectedExpertise: '', expertiseOptions: ['expert1'] };
      const result = validateTemplateForm(ctx);
      expect(result.isValid).toBe(false);
      expect(result.errors.expertise).toBeDefined();
    });
    it('should return invalid if template is missing', () => {
      const ctx = { ...baseContext, selectedTemplate: null };
      const result = validateTemplateForm(ctx);
      expect(result.isValid).toBe(false);
      expect(result.errors.template).toBeDefined();
    });
  });

  describe('validateSpecificTemplateType', () => {
    it('should return invalid if coding-prompt and no language', () => {
      const ctx = { ...baseContext, programmingLanguage: undefined };
      const result = validateSpecificTemplateType('coding-prompt', ctx);
      expect(result.isValid).toBe(false);
      expect(result.errors.language).toBeDefined();
    });
    it('should return valid if coding-prompt and language is set', () => {
      const result = validateSpecificTemplateType('coding-prompt', baseContext);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTemplateData', () => {
    it('should return invalid if required fields are missing', () => {
      const result = validateTemplateData({});
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
      expect(result.errors.role).toBeDefined();
      expect(result.errors.expertise).toBeDefined();
      expect(result.errors.raceRole).toBeDefined();
      expect(result.errors.raceAction).toBeDefined();
    });
    it('should return valid if all required fields are present', () => {
      const result = validateTemplateData({
        name: 'Test',
        role: 'role1',
        expertise: 'expert1',
        raceRole: 'desc',
        raceAction: 'desc'
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('prepareTemplateData', () => {
    it('should add updatedAt field as ISO string', () => {
      const data = { name: 'Test' };
      const result = prepareTemplateData(data);
      expect(result.name).toBe('Test');
      expect(typeof result.updatedAt).toBe('string');
      expect(new Date(result.updatedAt).toString()).not.toBe('Invalid Date');
    });
  });
});
