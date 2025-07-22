import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCustomSections } from '../useCustomSections';
import { CustomSection } from '../../types';
import * as validationModule from '../../utils/customSectionValidation';

describe('useCustomSections', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty sections and errors', () => {
    const { result } = renderHook(() => useCustomSections());
    
    expect(result.current.customSections).toEqual({});
    expect(result.current.sectionErrors).toEqual({});
  });
  it('should update sections when handleSectionChange is called', () => {
    const { result } = renderHook(() => useCustomSections());
    const mockSection: CustomSection = {
      id: 'test-section',
      name: 'Test Section',
      type: 'textarea'
    };
    
    // Make sure to match the exact return type and value the hook expects
    const mockValidationResult = { isValid: true };
    vi.spyOn(validationModule, 'validateCustomSection').mockReturnValue(mockValidationResult);
    
    act(() => {
      result.current.handleSectionChange('test-section', 'New content', mockSection);
    });
    
    expect(result.current.customSections).toEqual({
      'test-section': 'New content'
    });
    expect(result.current.sectionErrors).toEqual({
      'test-section': 'Invalid input'
    });
  });
  it('should set error when validation fails with boolean false result', () => {
    const { result } = renderHook(() => useCustomSections());
    const mockSection: CustomSection = {
      id: 'test-section',
      name: 'Test Section',
      type: 'textarea'
    };
    
    // Fix: return a SectionValidationResult object with isValid: false instead of a boolean
    vi.spyOn(validationModule, 'validateCustomSection').mockReturnValue({ isValid: false });
    
    act(() => {
      result.current.handleSectionChange('test-section', 'Invalid content', mockSection);
    });
    
    expect(result.current.customSections).toEqual({
      'test-section': 'Invalid content'
    });
    expect(result.current.sectionErrors).toEqual({
      'test-section': 'Invalid input'
    });
  });

  it('should set error when validation fails with error message', () => {
    const { result } = renderHook(() => useCustomSections());
    const mockSection: CustomSection = {
      id: 'test-section',
      name: 'Test Section',
      type: 'textarea',
      inputValidation: {
        type: 'regex',
        pattern: '^[A-Z]+$',
        errorMessage: 'Must be all uppercase letters'
      }
    };
    
    vi.spyOn(validationModule, 'validateCustomSection').mockReturnValue({ 
      isValid: false, 
      message: 'Must be all uppercase letters' 
    });
    
    act(() => {
      result.current.handleSectionChange('test-section', 'lowercase', mockSection);
    });
    
    expect(result.current.customSections).toEqual({
      'test-section': 'lowercase'
    });
    expect(result.current.sectionErrors).toEqual({
      'test-section': 'Must be all uppercase letters'
    });
  });

  it('should use default error message when validation fails without custom message', () => {
    const { result } = renderHook(() => useCustomSections());
    const mockSection: CustomSection = {
      id: 'test-section',
      name: 'Test Section',
      type: 'textarea'
    };
    
    vi.spyOn(validationModule, 'validateCustomSection').mockReturnValue({ 
      isValid: false
    });
    
    act(() => {
      result.current.handleSectionChange('test-section', 'Invalid content', mockSection);
    });
    
    expect(result.current.sectionErrors).toEqual({
      'test-section': 'Invalid input'
    });
  });
  it('should preserve existing sections and errors when updating one section', () => {
    const { result } = renderHook(() => useCustomSections());
    const mockSection1: CustomSection = {
      id: 'section-1',
      name: 'Section 1',
      type: 'textarea'
    };
    
    const mockSection2: CustomSection = {
      id: 'section-2',
      name: 'Section 2',
      type: 'textarea'
    };
    
    // Set up initial state with one section
    vi.spyOn(validationModule, 'validateCustomSection').mockReturnValue({ isValid: true });
    
    act(() => {
      result.current.handleSectionChange('section-1', 'Content 1', mockSection1);
    });
    
    // Add a second section
    act(() => {
      result.current.handleSectionChange('section-2', 'Content 2', mockSection2);
    });
    
    expect(result.current.customSections).toEqual({
      'section-1': 'Content 1',
      'section-2': 'Content 2'
    });
    
    expect(result.current.sectionErrors).toEqual({
      'section-1': 'Invalid input',
      'section-2': 'Invalid input'
    });
  });
});
