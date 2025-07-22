// Vitest setup
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorBoundary } from '../useErrorBoundary';

describe('useErrorBoundary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with a handleError function', () => {
    // Arrange & Act
    const { result } = renderHook(() => useErrorBoundary());
    
    // Assert
    expect(result.current.handleError).toBeDefined();
    expect(result.current.handleError).toBeInstanceOf(Function);
  });
  
  it('should log error to console and rethrow when handleError is called', () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('Test error');
    
    // Act & Assert
    const { result } = renderHook(() => useErrorBoundary());
    
    expect(() => {
      act(() => {
        result.current.handleError(testError);
      });
    }).toThrow(testError);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error caught by useErrorBoundary:',
      testError
    );
    
    // Clean up
    consoleSpy.mockRestore();
  });
  
  it('should rethrow the exact same error object that was passed in', () => {
    // Arrange
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const customError = {
      name: 'CustomError',
      message: 'This is a custom error object',
      code: 'ERR_CUSTOM'
    };
    
    // Act & Assert
    const { result } = renderHook(() => useErrorBoundary());
    
    try {
      act(() => {
        result.current.handleError(customError);
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // Should be the exact same object
      expect(error).toBe(customError);
      expect(error).toHaveProperty('code', 'ERR_CUSTOM');
    }
  });
  
  it('should handle different types of errors', () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorCases = [
      new Error('Standard error'),
      'String error message',
      { custom: 'Error object' },
      null,
      undefined,
      42
    ];
    
    const { result } = renderHook(() => useErrorBoundary());
    
    // Act & Assert
    errorCases.forEach(errorCase => {
      try {
        act(() => {
          result.current.handleError(errorCase);
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBe(errorCase);
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error caught by useErrorBoundary:',
          errorCase
        );
      }
    });
    
    // Verify console.error was called the correct number of times
    expect(consoleSpy).toHaveBeenCalledTimes(errorCases.length);
    
    // Clean up
    consoleSpy.mockRestore();
  });
  
  it('should be memoized and not change on re-renders', () => {
    // Arrange
    const { result, rerender } = renderHook(() => useErrorBoundary());
    const initialHandler = result.current.handleError;
    
    // Act
    rerender();
    
    // Assert
    expect(result.current.handleError).toBe(initialHandler);
  });
});
