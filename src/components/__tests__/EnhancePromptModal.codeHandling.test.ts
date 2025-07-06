import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleCopyCode, handleDownloadCode } from '../EnhancePromptModal.codeHandling';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  },
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('EnhancePromptModal code handling functions', () => {
  describe('handleCopyCode', () => {
    beforeEach(() => {
      // Reset mocks between tests
      vi.clearAllMocks();
      
      // Mock the clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockResolvedValue(undefined)
        },
        writable: true
      });

      // Mock console.error to capture errors
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    it('copies text to clipboard and returns true on success', async () => {
      // Arrange
      const content = 'Test content to copy';
      
      // Act
      const result = await handleCopyCode(content);
      
      // Assert
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
      expect(result).toBe(true);
    });
    
    it('returns false and logs error on failure', async () => {
      // Arrange
      const content = 'Test content to copy';
      const error = new Error('Clipboard access denied');
      
      // Mock clipboard API to fail
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(error)
        },
        writable: true
      });
      
      // Act
      const result = await handleCopyCode(content);
      
      // Assert
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Failed to copy code:', error);
    });
  });
  
  describe('handleDownloadCode', () => {
    beforeEach(() => {
      // Reset mocks between tests
      vi.clearAllMocks();
      
      // Mock DOM manipulation methods
      document.createElement = vi.fn().mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn(),
            appendChild: vi.fn()
          };
        }
        return {};
      });
      
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      
      // Mock URL.createObjectURL and URL.revokeObjectURL
      URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      URL.revokeObjectURL = vi.fn();
      
      // Mock Blob constructor
      global.Blob = vi.fn().mockImplementation((content, options) => ({
        content,
        options,
        size: content.join('').length,
        type: options.type
      }));
    });
    
    it('creates a blob with the correct content and type', () => {
      // Arrange
      const content = 'Test content to download';
      const fileName = 'test-file.txt';
      
      // Act
      handleDownloadCode(content, fileName);
      
      // Assert
      expect(global.Blob).toHaveBeenCalledWith([content], { type: 'text/plain' });
    });
    
    it('creates a download link with correct attributes', () => {
      // Arrange
      const content = 'Test content to download';
      const fileName = 'test-file.txt';
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        appendChild: vi.fn()
      };
      document.createElement = vi.fn().mockReturnValue(mockAnchor);
      
      // Act
      handleDownloadCode(content, fileName);
      
      // Assert
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('blob:test-url');
      expect(mockAnchor.download).toBe(fileName);
    });
    
    it('triggers the download by clicking the link', () => {
      // Arrange
      const content = 'Test content to download';
      const fileName = 'test-file.txt';
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        appendChild: vi.fn()
      };
      document.createElement = vi.fn().mockReturnValue(mockAnchor);
      
      // Act
      handleDownloadCode(content, fileName);
      
      // Assert
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
    });
    
    it('cleans up by removing the link and revoking the object URL', () => {
      // Arrange
      const content = 'Test content to download';
      const fileName = 'test-file.txt';
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        appendChild: vi.fn()
      };
      document.createElement = vi.fn().mockReturnValue(mockAnchor);
      
      // Act
      handleDownloadCode(content, fileName);
      
      // Assert
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });
});
