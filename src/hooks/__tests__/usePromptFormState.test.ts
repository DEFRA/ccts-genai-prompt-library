import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptFormState } from '../usePromptFormState';
import { Template } from '../../types';

describe('usePromptFormState', () => {
  const mockUpdateFilteredTemplates = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formExpanded).toBe(false);
  });

  it('should handle step change to step 3 when in template mode with selected template', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));
    const mockTemplate = { id: '1', name: 'Test Template' } as Template;

    act(() => {
      result.current.handleStepChange('test-role', mockTemplate, 'createPromptWithTemplate');
    });

    expect(result.current.currentStep).toBe(3); // currentStep IS changed by handleStepChange
    expect(result.current.formExpanded).toBe(true);
  });

  it('should handle step change to step 3 when in template mode with roleFromExpertise', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));
    const mockTemplate = { id: '1', name: 'Test Template' } as Template;

    act(() => {
      result.current.handleStepChange('test-role', mockTemplate, 'createPrompt');
    });

    expect(result.current.currentStep).toBe(3); // currentStep IS changed by handleStepChange
    expect(result.current.formExpanded).toBe(true);
  });

  it('should not expand form when template is not selected, even in template mode', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));

    act(() => {
      result.current.handleStepChange('test-role', null, 'createPromptWithTemplate');
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formExpanded).toBe(false);
  });

  it('should set formExpanded based on currentStep when not in template mode', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));

    // Set currentStep to 3 first
    act(() => {
      result.current.setCurrentStep(3);
    });

    // Then handle step change in non-template mode
    act(() => {
      result.current.handleStepChange(null, null, 'createPrompt');
    });

    expect(result.current.currentStep).toBe(3);
    expect(result.current.formExpanded).toBe(true);
  });

  it('should set formExpanded to false when currentStep is not 3 and not in template mode', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));

    // Set currentStep to 2 first
    act(() => {
      result.current.setCurrentStep(2);
    });

    // Then handle step change in non-template mode
    act(() => {
      result.current.handleStepChange(null, null, 'createPrompt');
    });

    expect(result.current.currentStep).toBe(2);
    expect(result.current.formExpanded).toBe(false);
  });

  it('should reset form state', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));

    // Set some state first
    act(() => {
      result.current.setCurrentStep(3);
    });

    // Reset the form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.currentStep).toBe(1);
    expect(result.current.formExpanded).toBe(false);
    expect(mockUpdateFilteredTemplates).toHaveBeenCalledWith('', '');
  });

  it('should directly set currentStep', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));

    act(() => {
      result.current.setCurrentStep(2);
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('should handle different combinations of role and modal mode', () => {
    const { result } = renderHook(() => usePromptFormState(mockUpdateFilteredTemplates));
    const mockTemplate = { id: '1', name: 'Test Template' } as Template;

    // Test with roleFromExpertise but no template
    act(() => {
      result.current.handleStepChange('test-role', null, 'createPrompt');
    });
    expect(result.current.formExpanded).toBe(false);

    // Test with template but no roleFromExpertise
    act(() => {
      result.current.handleStepChange(null, mockTemplate, 'createPromptWithTemplate');
    });
    expect(result.current.formExpanded).toBe(true);

    // Test with both roleFromExpertise and template
    act(() => {
      result.current.handleStepChange('test-role', mockTemplate, 'createPrompt');
    });
    expect(result.current.formExpanded).toBe(true);
  });
});
