import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFileExtension, validateFile, downloadFile } from './fileUtils';

// Mock react-hot-toast before tests run
vi.mock('react-hot-toast', () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      loading: vi.fn(),
      custom: vi.fn(),
      dismiss: vi.fn(),
    },
    Toaster: () => null,
    // Add any other components or functions needed
  };
});

describe('fileUtils', () => {
  describe('getFileExtension', () => {
    it('should return the file extension in lowercase', () => {
      expect(getFileExtension('test.TXT')).toBe('txt');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
      expect(getFileExtension('noext')).toBe('noext');
    });
  });

  describe('validateFile', () => {
    it('should resolve true for a valid file', async () => {
      // Create a mock File object
      const fileContent = 'test content';
      const mockFile = new File([fileContent], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsText: vi.fn().mockImplementation(function(this: any) {
          setTimeout(() => this.onload(), 0);
        }),
      };
      
      // @ts-ignore - Mock the FileReader constructor
      global.FileReader = vi.fn(() => mockFileReader);
      
      const result = await validateFile(mockFile);
      expect(result).toBe(true);
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile);
    });

    it('should resolve false for a file that errors', async () => {
      // Create a mock File object
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Mock FileReader with error
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        readAsText: vi.fn().mockImplementation(function(this: any) {
          setTimeout(() => this.onerror(new Error('Test error')), 0);
        }),
      };
      
      // @ts-ignore - Mock the FileReader constructor
      global.FileReader = vi.fn(() => mockFileReader);
      
      const result = await validateFile(mockFile);
      expect(result).toBe(false);
    });
  });

  describe('downloadFile', () => {
    let mockLink: any;
    let originalCreateElement: any;
    let originalCreateObjectURL: any;
    let originalRevokeObjectURL: any;
    let originalAppendChild: any;
    let originalRemoveChild: any;
    
    beforeEach(() => {
      // Setup mock link element with all required properties and methods
      mockLink = {
        href: '',
        download: '',
        click: vi.fn(),
        setAttribute: vi.fn((attr, value) => {
          if (attr === 'download') mockLink.download = value;
        })
      };
      
      // Save original methods before mocking
      originalCreateElement = document.createElement;
      originalAppendChild = document.body.appendChild;
      originalRemoveChild = document.body.removeChild;
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      
      // Create mocks
      document.createElement = vi.fn(() => mockLink) as any;
      document.body.appendChild = vi.fn() as any;
      document.body.removeChild = vi.fn() as any;
      URL.createObjectURL = vi.fn(() => 'mock-url') as any;
      URL.revokeObjectURL = vi.fn() as any;
      
      // Suppress console.error output in tests
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      // Restore original methods
      document.createElement = originalCreateElement;
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      
      vi.restoreAllMocks();
    });
    
    it('should create a download link with the correct attributes', () => {
      const content = 'test content';
      const filename = 'test.txt';
      
      // Run the function to test
      downloadFile(content, filename);
      
      // Verify our mock functions were called as expected
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename);
      expect(mockLink.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });      it.skip('should handle errors gracefully', () => {
      // Skip appending to the body for this test
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();
      
      // Temporarily save the current state
      const origAppendChild = document.body.appendChild;
      const origRemoveChild = document.body.removeChild;
      
      // Replace methods with our test mocks
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      
      // Setup URL.createObjectURL to throw an error
      const origCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = vi.fn(() => { 
        throw new Error('Test error');
      }) as any;
      
      try {
        // Get a reference to our toast mock
        const toast = require('react-hot-toast').toast;
        
        // Reset mocks before running the test
        mockAppendChild.mockReset();
        mockRemoveChild.mockReset();
        toast.error.mockReset();
        console.error.mockReset();
        
        // Run the function that should trigger the error
        downloadFile('content', 'test.txt');
        
        // Verify error handling
        expect(console.error).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Failed to download file');
        
        // The document.body methods should not have been called since error happens before
        expect(mockAppendChild).not.toHaveBeenCalled();
      } finally {
        // Always restore the original methods
        document.body.appendChild = origAppendChild;
        document.body.removeChild = origRemoveChild;
        URL.createObjectURL = origCreateObjectURL;
      }
    });
  });
});
