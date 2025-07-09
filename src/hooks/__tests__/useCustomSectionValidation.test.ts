import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCustomSectionValidation } from '../useCustomSectionValidation';
import { CustomSection } from '../../types';

describe('useCustomSectionValidation', () => {
  // Spy on console.log to prevent cluttering test output
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should validate sections correctly with all passing', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data
    const sections: CustomSection[] = [
      {
        id: 'text-section',
        name: 'Text Section',
        type: 'textarea',
        required: true
      }
    ];
    
    const customSections = {
      'text-section': 'Some valid content'
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual({});
  });

  it('should validate required fields correctly', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data for required field validation
    const sections: CustomSection[] = [
      {
        id: 'required-section',
        name: 'Required Section',
        type: 'textarea',
        required: true,
        isVisible: true
      }
    ];
    
    // Empty content for required field
    const customSections = {
      'required-section': ''
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toEqual({
      'required-section': 'Required Section is required'
    });
  });

  it('should skip validation for invisible sections', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data with invisible section
    const sections: CustomSection[] = [
      {
        id: 'invisible-section',
        name: 'Invisible Section',
        type: 'textarea',
        required: true,
        isVisible: false
      }
    ];
    
    // No content for the invisible required field
    const customSections = {
      'invisible-section': ''
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    // Should pass because section is invisible
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual({});
  });

  it('should validate multiselect sections correctly', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data for multiselect validation
    const sections: CustomSection[] = [
      {
        id: 'multi-section',
        name: 'Multi Section',
        type: 'multiselect',
        required: true,
        isVisible: true,
        options: ['Option 1', 'Option 2', 'Option 3']
      }
    ];
    
    const customSections = {};
    
    // Empty multiselect for required field
    const selectedMultiSections = {
      'multi-section': []
    };
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toEqual({
      'multi-section': 'Multi Section is required'
    });
  });

  it('should validate code snippets correctly', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data for code validation
    const sections: CustomSection[] = [
      {
        id: 'code-section',
        name: 'Code Section',
        type: 'textarea',
        isVisible: true,
        inputValidation: {
          type: 'code-snippet',
          language: 'groovy',
          errorMessage: 'Please enter valid Groovy code'
        }
      }
    ];
    
    // Valid Groovy code
    const customSections = {
      'code-section': 'def myFunction() { return "Hello World" }'
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual({});
  });

  it('should validate BDD sections correctly', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data for BDD validation
    const sections: CustomSection[] = [
      {
        id: 'bdd-section',
        name: 'BDD Section',
        type: 'textarea',
        isVisible: true,
        inputValidation: {
          type: 'bdd',
          errorMessage: 'Invalid BDD scenario'
        }
      }
    ];
    
    // Invalid BDD content missing "Scenario"
    const customSections = {
      'bdd-section': 'Given some condition\nWhen I do something\nThen I expect a result'
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toEqual({
      'bdd-section': 'Invalid BDD scenario'
    });
  });

  it('should validate regex patterns correctly', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data for regex validation
    const sections: CustomSection[] = [
      {
        id: 'regex-section',
        name: 'Regex Section',
        type: 'textarea',
        isVisible: true,
        inputValidation: {
          type: 'regex',
          pattern: '^[0-9]{3}-[0-9]{2}-[0-9]{4}$',
          errorMessage: 'Invalid SSN format'
        }
      }
    ];
    
    // Invalid SSN format
    const customSections = {
      'regex-section': '123-456-789' // Missing a digit
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toEqual({
      'regex-section': 'Invalid SSN format'
    });
  });

  it('should validate code snippets with generic patterns when language is not specified', async () => {
    const { result } = renderHook(() => useCustomSectionValidation());
    
    // Test data for generic code validation
    const sections: CustomSection[] = [
      {
        id: 'generic-code',
        name: 'Generic Code',
        type: 'textarea',
        isVisible: true,
        inputValidation: {
          type: 'code-snippet',
          errorMessage: 'Invalid code'
        }
      }
    ];
    
    // Valid generic code
    const customSections = {
      'generic-code': 'function test() { return true; }'
    };
    
    const selectedMultiSections = {};
    
    // Test validation
    const validationResult = await result.current.validateSections(
      sections,
      customSections,
      selectedMultiSections
    );
    
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual({});
  });
});
