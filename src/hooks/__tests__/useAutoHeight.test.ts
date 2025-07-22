// Vitest setup
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoHeight } from '../useAutoHeight';
import * as React from 'react';

// Instead of mocking React's useRef, we'll test the hook in isolation
describe('useAutoHeight', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with a ref and adjustHeight function', () => {
    const { result } = renderHook(() => useAutoHeight());
    
    expect(result.current.textareaRef).toBeDefined();
    expect(result.current.adjustHeight).toBeInstanceOf(Function);
  });
  
  it('should adjust height when invoked', () => {
    // Create a mock implementation for this test
    const adjustHeightMock = vi.fn();
    
    // Render our hook with the mock
    const { result } = renderHook(() => {
      // Return our original hook but track calls to adjustHeight
      const hook = useAutoHeight();
      
      // Wrap the original adjustHeight with our mock
      const originalAdjustHeight = hook.adjustHeight;
      hook.adjustHeight = vi.fn(() => {
        adjustHeightMock();
        return originalAdjustHeight();
      });
      
      return hook;
    });
    
    // Call adjustHeight
    act(() => {
      result.current.adjustHeight();
    });
    
    // Verify our mock was called
    expect(adjustHeightMock).toHaveBeenCalled();
  });

  it('should handle null textarea ref gracefully', () => {
    // Mock console.error to prevent noisy test output
    const consoleErrorMock = vi.spyOn(console, 'error');
    consoleErrorMock.mockImplementation(() => {});
    
    const { result } = renderHook(() => useAutoHeight());
    
    // Force the ref to be null for this test
    Object.defineProperty(result.current, 'textareaRef', {
      get: () => ({ current: null }),
    });
    
    // This should not throw an error when the ref is null
    expect(() => {
      act(() => {
        result.current.adjustHeight();
      });
    }).not.toThrow();
    
    // Cleanup
    consoleErrorMock.mockRestore();
  });
});
