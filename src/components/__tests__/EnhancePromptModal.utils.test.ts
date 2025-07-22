import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createErrorDetails,
  generateUniqueId, 
  getFileExtension,
  getSmartFileName,
  extractRACEComponents,
  RACEComponents
} from '../EnhancePromptModal.utils';

describe('EnhancePromptModal utility functions', () => {
  describe('createErrorDetails', () => {
    it('should create error details with message from Error object', () => {
      // Arrange
      const error = new Error('Test error message');
      
      // Act
      const result = createErrorDetails(error);
      
      // Assert
      expect(result.message).toBe('Test error message');
      expect(result.timestamp).toBeDefined();
      expect(result.context).toBeUndefined();
    });

    it('should create error details with default message for non-Error objects', () => {
      // Arrange
      const error = 'string error';
      
      // Act
      const result = createErrorDetails(error);
      
      // Assert
      expect(result.message).toBe('An unexpected error occurred');
      expect(result.timestamp).toBeDefined();
      expect(result.context).toBeUndefined();
    });

    it('should include context when provided', () => {
      // Arrange
      const error = new Error('Test error message');
      const context = 'Test context';
      
      // Act
      const result = createErrorDetails(error, context);
      
      // Assert
      expect(result.message).toBe('Test error message');
      expect(result.timestamp).toBeDefined();
      expect(result.context).toBe('Test context');
    });
  });

  describe('generateUniqueId', () => {
    beforeEach(() => {
      vi.stubGlobal('crypto', {
        getRandomValues: () => new Uint32Array([123456789])
      });
      vi.spyOn(Date, 'now').mockReturnValue(1625097600000);
    });

    it('should generate a unique ID with the correct format', () => {
      // Act
      const result = generateUniqueId();
      
      // Assert
      expect(result).toMatch(/^enhance-\d+-\d+$/);
      expect(result).toBe('enhance-1625097600000-23456789');
    });
  });

  describe('getFileExtension', () => {
    it('should return the correct extension for known languages', () => {
      // Arrange
      const testCases = [
        { language: 'gherkin', expected: '.feature' },
        { language: 'python', expected: '.py' },
        { language: 'javascript', expected: '.js' },
        { language: 'typescript', expected: '.ts' },
        { language: 'ruby', expected: '.rb' },
        { language: 'csharp', expected: '.cs' },
        { language: 'java', expected: '.java' },
        { language: 'csv', expected: '.csv' },
      ];
      
      // Act & Assert
      testCases.forEach(({ language, expected }) => {
        expect(getFileExtension(language)).toBe(expected);
      });
    });

    it('should return .txt for unknown languages', () => {
      // Act & Assert
      expect(getFileExtension('unknown')).toBe('.txt');
      expect(getFileExtension('golang')).toBe('.txt');
    });

    it('should handle case insensitivity', () => {
      // Act & Assert
      expect(getFileExtension('JavaScript')).toBe('.js');
      expect(getFileExtension('PYTHON')).toBe('.py');
    });
  });

  describe('getSmartFileName', () => {
    it('should generate a feature file name for Gherkin content', () => {
      // Arrange
      const content = 'Feature: User Authentication\nScenario: Valid login';
      
      // Act
      const result = getSmartFileName('gherkin', content);
      
      // Assert
      expect(result).toBe('UserAuthentication.feature');
    });

    it('should fall back to FeatureTests.feature for Gherkin without feature name', () => {
      // Arrange
      const content = 'Scenario: Valid login';
      
      // Act
      const result = getSmartFileName('gherkin', content);
      
      // Assert
      expect(result).toBe('FeatureTests.feature');
    });

    it('should generate a JavaScript file name based on the first line', () => {
      // Arrange
      const content = '// User Authentication Module\nfunction authenticate() {}';
      
      // Act
      const result = getSmartFileName('javascript', content);
      
      // Assert
      expect(result).toBe('UserAuthenticationModule.js');
    });

    it('should limit the file name length', () => {
      // Arrange
      const content = '// This is an extremely long title that should be truncated in the resulting file name';
      
      // Act
      const result = getSmartFileName('javascript', content);
      
      // Assert
      expect(result.length).toBeLessThan(40); // File name + .js extension
    });
  });

  describe('extractRACEComponents', () => {
    it('should extract all RACE components from content', () => {
      // Arrange
      const content = `
# Role:
Test Role Content

# Action:
Test Action Content

# Context:
Test Context Content

# Execute:
Test Execute Content
`;
      
      // Act
      const result = extractRACEComponents(content);
      
      // Assert
      expect(result).toEqual({
        role: 'Test Role Content',
        action: 'Test Action Content',
        context: 'Test Context Content',
        execute: 'Test Execute Content'
      });
    });

    it('should handle missing components', () => {
      // Arrange
      const content = `
# Role:
Test Role Content

# Context:
Test Context Content
`;
      
      // Act
      const result = extractRACEComponents(content);
      
      // Assert
      expect(result).toEqual({
        role: 'Test Role Content',
        action: '',
        context: 'Test Context Content',
        execute: ''
      });
    });

    it('should handle whitespace and case variations', () => {
      // Arrange
      const content = `
#   Role:    
Test Role Content

#ACTION:
Test Action Content
`;
      
      // Act
      const result = extractRACEComponents(content);
      
      // Assert
      expect(result).toEqual({
        role: 'Test Role Content',
        action: 'Test Action Content',
        context: '',
        execute: ''
      });
    });
  });
});
