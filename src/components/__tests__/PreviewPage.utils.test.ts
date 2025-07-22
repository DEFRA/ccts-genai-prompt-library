import { describe, it, expect, vi } from 'vitest';
import { extractRACEComponents, extractFormatRequirements, detectFileDetails } from '../PreviewPage';

describe('PreviewPage utility functions', () => {
  describe('extractRACEComponents', () => {
    it('should extract all RACE components when all are present', () => {
      // Arrange
      const content = `
### Role:
Data Scientist

### Action:
Create a machine learning model

### Context:
Using the customer data

### Execute:
Use Python and scikit-learn
`;

      // Act
      const result = extractRACEComponents(content);

      // Assert
      expect(result).toEqual({
        role: 'Data Scientist',
        action: 'Create a machine learning model',
        context: 'Using the customer data',
        execute: 'Use Python and scikit-learn'
      });
    });

    it('should extract components when some are missing', () => {
      // Arrange
      const content = `
### Role:
Data Scientist

### Action:
Create a machine learning model
`;

      // Act
      const result = extractRACEComponents(content);

      // Assert
      expect(result).toEqual({
        role: 'Data Scientist',
        action: 'Create a machine learning model',
        context: '',
        execute: ''
      });
    });    it('should throw error when content is invalid', () => {
      // Arrange
      const invalidContent = '';

      // Act & Assert
      expect(() => extractRACEComponents(invalidContent)).toThrow('Invalid content provided');
    });

    it('should throw error when required components are missing', () => {
      // Arrange
      const missingRoleContent = `
### Action:
Create a machine learning model
`;

      // Act & Assert
      expect(() => extractRACEComponents(missingRoleContent)).toThrow('Required RACE components not found');
    });

    it('should handle whitespace and formatting variations', () => {
      // Arrange
      const content = `
### Role:
Data Scientist

### Action:
Create a machine learning model

### Context:
Using the customer data
With multiple lines
And some formatting

### Execute:
Use Python and scikit-learn
`;

      // Act
      const result = extractRACEComponents(content);

      // Assert
      expect(result.role).toBe('Data Scientist');
      expect(result.action).toBe('Create a machine learning model');
      expect(result.context).toContain('Using the customer data');
      expect(result.context).toContain('With multiple lines');
      expect(result.execute).toBe('Use Python and scikit-learn');
    });
  });

  describe('extractFormatRequirements', () => {
    it('should extract language and context when present', () => {
      // Arrange
      const content = `
# Programming Language Python
# Context: Create a function to process data
Some other content
`;

      // Act
      const result = extractFormatRequirements(content);

      // Assert
      expect(result).toEqual({
        language: 'Python',
        format: 'general',
        context: 'Create a function to process data'
      });
    });

    it('should return default values when format requirements are not present', () => {
      // Arrange
      const content = 'Some content without format requirements';

      // Act
      const result = extractFormatRequirements(content);

      // Assert
      expect(result).toEqual({
        language: '',
        format: 'general',
        context: ''
      });
    });

    it('should handle only language specified', () => {
      // Arrange
      const content = `
# Programming Language JavaScript
Some other content
`;

      // Act
      const result = extractFormatRequirements(content);

      // Assert
      expect(result).toEqual({
        language: 'JavaScript',
        format: 'general',
        context: ''
      });
    });

    it('should handle only context specified', () => {
      // Arrange
      const content = `
# Context: Create a web application
Some other content
`;

      // Act
      const result = extractFormatRequirements(content);

      // Assert
      expect(result).toEqual({
        language: '',
        format: 'general',
        context: 'Create a web application'
      });
    });
  });

  describe('detectFileDetails', () => {
    it('should detect file details for known languages', () => {
      // Arrange
      const content = `
class Calculator {
  add(a, b) {
    return a + b;
  }
}
`;
      const language = 'javascript';

      // Act
      const result = detectFileDetails(content, language);

      // Assert
      expect(result.extension).toBe('js');
      expect(result.fileName).toContain('calculator');
    });

    it('should handle gherkin/feature files', () => {
      // Arrange
      const content = `
Feature: Shopping Cart
  Scenario: Add item to cart
    Given I have an empty cart
    When I add an item
    Then the cart should have 1 item
`;
      const language = 'gherkin';

      // Act
      const result = detectFileDetails(content, language);

      // Assert
      expect(result.extension).toBe('feature');
      expect(result.fileName).toContain('feature_shopping_cart');
    });

    it('should handle filename comments', () => {
      // Arrange
      const content = `
// filename: custom_calculator.js
class Calculator {
  add(a, b) {
    return a + b;
  }
}
`;
      const language = 'javascript';

      // Act
      const result = detectFileDetails(content, language);      // Assert
      expect(result.fileName).toBe('custom_calculator_js');
      expect(result.extension).toBe('js');
    });

    it('should fallback to default naming when no patterns match', () => {
      // Arrange
      const content = `
This is just some plain text
without any programming constructs.
`;
      const language = 'text';

      // Act
      const result = detectFileDetails(content, language);      // Assert
      expect(result.extension).toBe('txt');
      // The current implementation uses the first word of the content
      expect(result.fileName).toBe('tex_this');
    });
  });
});
