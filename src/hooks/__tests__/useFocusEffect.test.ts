// Vitest setup
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusEffect } from '../useFocusEffect';

describe('useFocusEffect', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls focus on the element when shouldFocus is true', () => {
    // Create a mock ref with a focus function
    const mockFocus = vi.fn();
    const ref = { current: { focus: mockFocus } };
    
    // Render the hook with shouldFocus=true
    renderHook(() => useFocusEffect(ref, true));
    
    // Assert focus was called
    expect(mockFocus).toHaveBeenCalledTimes(1);
  });

  it('does not call focus when shouldFocus is false', () => {
    // Create a mock ref with a focus function
    const mockFocus = vi.fn();
    const ref = { current: { focus: mockFocus } };
    
    // Render the hook with shouldFocus=false
    renderHook(() => useFocusEffect(ref, false));
    
    // Assert focus was not called
    expect(mockFocus).not.toHaveBeenCalled();
  });  it('does not call focus when ref.current is null', () => {
    // Create a null ref
    const ref = { current: null };
    
    // Render the hook with shouldFocus=true
    const { result } = renderHook(() => useFocusEffect(ref, true));
    
    // Assert that the hook executed successfully without errors
    expect(result.current).toBeUndefined();
    // The test passes if it reaches here without throwing an error
    // The hook should safely handle the null ref case
  });

  it('calls focus when shouldFocus changes from false to true', () => {
    // Create a mock ref with a focus function
    const mockFocus = vi.fn();
    const ref = { current: { focus: mockFocus } };
    
    // Initial render with shouldFocus=false
    const { rerender } = renderHook(
      ({ shouldFocus }) => useFocusEffect(ref, shouldFocus),
      { initialProps: { shouldFocus: false } }
    );
    
    // Assert focus was not called initially
    expect(mockFocus).not.toHaveBeenCalled();
    
    // Rerender with shouldFocus=true
    rerender({ shouldFocus: true });
    
    // Assert focus was called after the change
    expect(mockFocus).toHaveBeenCalledTimes(1);
  });
});
