// Vitest setup
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileHandlers } from '../useFileHandlers';

// Mock FileReader
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | null = null;
  
  readAsText(file: Blob): void {
    // Simulate async nature of FileReader
    setTimeout(() => {
      this.result = 'mock file content';
      // Mock the event
      const event = {
        target: {
          result: this.result
        }
      } as unknown as ProgressEvent<FileReader>;
      
      this.onload && this.onload.call(this, event);
    }, 0);
  }
}

describe('useFileHandlers', () => {
  // Mock implementations
  const handleCustomSectionChangeMock = vi.fn();
  const setFileNamesMock = vi.fn();
  
  // Setup global mocks
  const originalFileReader = global.FileReader;
  
  beforeEach(() => {
    // Mock FileReader globally
    global.FileReader = MockFileReader as unknown as typeof FileReader;
  });
  
  afterEach(() => {
    // Restore original FileReader and clear mocks
    global.FileReader = originalFileReader;
    vi.clearAllMocks();
  });

  it('should return handleFileChange and handleMultiSelectChange functions', () => {
    // Arrange & Act
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    // Assert
    expect(result.current.handleFileChange).toBeDefined();
    expect(result.current.handleFileChange).toBeInstanceOf(Function);
    expect(result.current.handleMultiSelectChange).toBeDefined();
    expect(result.current.handleMultiSelectChange).toBeInstanceOf(Function);
  });
  
  it('should process file content when handleFileChange is called', async () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    const sectionId = 'test-section';
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Act
    act(() => {
      result.current.handleFileChange(sectionId, mockFile);
    });
    
    // Need to wait for the FileReader's async operation
    await vi.waitFor(() => {
      expect(handleCustomSectionChangeMock).toHaveBeenCalledWith(sectionId, 'mock file content');
    });
    
    // Assert
    expect(setFileNamesMock).toHaveBeenCalledWith(expect.any(Function));
    
    // Test the callback function passed to setFileNames
    const prevState = { existingSection: 'existing.txt' };
    const setFilenamesCallback = setFileNamesMock.mock.calls[0][0];
    const newState = setFilenamesCallback(prevState);
    
    expect(newState).toEqual({
      existingSection: 'existing.txt',
      [sectionId]: 'test.txt'
    });
  });
  
  it('should add option when handleMultiSelectChange is called with checked=true', () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    const sectionId = 'test-section';
    const option = 'option1';
    const currentOptions = ['existing-option'];
    
    // Act
    const updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      option,
      true,
      currentOptions
    );
    
    // Assert
    expect(updatedOptions).toContain('existing-option');
    expect(updatedOptions).toContain('option1');
    expect(updatedOptions.length).toBe(2);
  });
  
  it('should remove option when handleMultiSelectChange is called with checked=false', () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    const sectionId = 'test-section';
    const option = 'option1';
    const currentOptions = ['existing-option', 'option1'];
    
    // Act
    const updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      option,
      false,
      currentOptions
    );
    
    // Assert
    expect(updatedOptions).toContain('existing-option');
    expect(updatedOptions).not.toContain('option1');
    expect(updatedOptions.length).toBe(1);
  });
  
  it('should handle adding multiple options', () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    const sectionId = 'test-section';
    const currentOptions: string[] = [];
    
    // Act
    let updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      'option1',
      true,
      currentOptions
    );
    
    updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      'option2',
      true,
      updatedOptions
    );
    
    updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      'option3',
      true,
      updatedOptions
    );
    
    // Assert
    expect(updatedOptions).toContain('option1');
    expect(updatedOptions).toContain('option2');
    expect(updatedOptions).toContain('option3');
    expect(updatedOptions.length).toBe(3);
  });
  
  it('should handle removing specific options while keeping others', () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    const sectionId = 'test-section';
    const initialOptions = ['option1', 'option2', 'option3', 'option4'];
    
    // Act
    let updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      'option2',
      false,
      initialOptions
    );
    
    updatedOptions = result.current.handleMultiSelectChange(
      sectionId,
      'option4',
      false,
      updatedOptions
    );
    
    // Assert
    expect(updatedOptions).toContain('option1');
    expect(updatedOptions).not.toContain('option2');
    expect(updatedOptions).toContain('option3');
    expect(updatedOptions).not.toContain('option4');
    expect(updatedOptions.length).toBe(2);
  });
  
  it('should handle error in FileReader', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Custom FileReader mock that throws an error
    class ErrorFileReader extends MockFileReader {
      readAsText(): void {
        setTimeout(() => {
          this.onerror && this.onerror(new ProgressEvent('error'));
        }, 0);
      }
      
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    }
    
    // Override the global FileReader with our error version
    global.FileReader = ErrorFileReader as unknown as typeof FileReader;
    
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    // Act
    act(() => {
      result.current.handleFileChange('test-section', new File([''], 'test.txt'));
    });
    
    // Wait a bit to make sure the FileReader had time to "fail"
    await vi.waitFor(() => {
      // Assert that our callbacks were not called
      expect(handleCustomSectionChangeMock).not.toHaveBeenCalled();
      expect(setFileNamesMock).not.toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });
  
  it('should handle an empty file', async () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    // Override the FileReader mock for this specific test
    global.FileReader = class EmptyFileReader extends MockFileReader {
      readAsText(): void {
        setTimeout(() => {
          this.result = '';
          const event = {
            target: {
              result: this.result
            }
          } as unknown as ProgressEvent<FileReader>;
          
          this.onload && this.onload.call(this, event);
        }, 0);
      }
    } as unknown as typeof FileReader;
    
    const sectionId = 'empty-section';
    const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
    
    // Act
    act(() => {
      result.current.handleFileChange(sectionId, emptyFile);
    });
    
    // Assert
    await vi.waitFor(() => {
      expect(handleCustomSectionChangeMock).toHaveBeenCalledWith(sectionId, '');
    });
  });
  
  it('should handle a large file', async () => {
    // Arrange
    const { result } = renderHook(() => 
      useFileHandlers(handleCustomSectionChangeMock, setFileNamesMock)
    );
    
    // Large content mock
    const largeContent = 'a'.repeat(1000000);  // 1MB of 'a' characters
    
    // Override the FileReader mock for this specific test
    global.FileReader = class LargeFileReader extends MockFileReader {
      readAsText(): void {
        setTimeout(() => {
          this.result = largeContent;
          const event = {
            target: {
              result: this.result
            }
          } as unknown as ProgressEvent<FileReader>;
          
          this.onload && this.onload.call(this, event);
        }, 0);
      }
    } as unknown as typeof FileReader;
    
    const sectionId = 'large-section';
    const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
    
    // Act
    act(() => {
      result.current.handleFileChange(sectionId, largeFile);
    });
    
    // Assert
    await vi.waitFor(() => {
      expect(handleCustomSectionChangeMock).toHaveBeenCalledWith(sectionId, largeContent);
    });
  });
});
