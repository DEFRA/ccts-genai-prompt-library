import { describe, it, expect } from 'vitest';
import { validateBDDScenario, getCodeLanguage, checkCodeSyntax, 
  validateCodeSnippet, detectLanguageFromIndicators, validateAgainstLanguage, 
  checkLanguageDisqualifiers, languageValidationConfigs } from './codeValidation';

describe('codeValidation', () => {
  describe('validateBDDScenario', () => {
    it('should return valid for scenario with Given, When, Then and length >= 10', () => {
      const result = validateBDDScenario('Given a user When they login Then they see dashboard');
      expect(result.isValid).toBe(true);
      expect(result.messages[0]).toMatch(/Valid/);
    });
    it('should return invalid for missing keywords', () => {
      const result = validateBDDScenario('When they login Then they see dashboard');
      expect(result.isValid).toBe(false);
      expect(result.messages[0]).toMatch(/Given, When, and Then/);
    });
    it('should return invalid for short scenario', () => {
      const result = validateBDDScenario('Given');
      expect(result.isValid).toBe(false);
      expect(result.messages[1]).toMatch(/at least 10 characters/);
    });
  });

  describe('getCodeLanguage', () => {
    it('should detect JavaScript', () => {
      expect(getCodeLanguage('function test() { return 1; }')).toBe('javascript');
    });
    it('should detect TypeScript', () => {
      expect(getCodeLanguage('interface Foo { bar: string; }')).toBe('typescript');
    });
    it('should return null for unknown code', () => {
      expect(getCodeLanguage('some random text')).toBeNull();
    });
  });

  describe('checkCodeSyntax', () => {
    it('should return valid for balanced code', () => {
      const result = checkCodeSyntax('function test() { return 1; }');
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    it('should return invalid for unbalanced brackets', () => {
      const result = checkCodeSyntax('function test() { return 1; ');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/Unbalanced brackets/);
    });
    it('should return invalid for empty code', () => {
      const result = checkCodeSyntax('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/empty/);
    });
  });

  describe('validateCodeSnippet', () => {
    it('should return invalid for code snippet that is too short', () => {
      const result = validateCodeSnippet('short');
      expect(result.isValid).toBe(false);
      expect(result.messages[0]).toMatch(/Code snippet is too short/);
    });
  
    it('should return invalid for gibberish input', () => {
      const result = validateCodeSnippet('abcd');
      expect(result.isValid).toBe(false);
      expect(result.messages[0]).toMatch(/Code snippet is too short/);
    });
  
    it('should return invalid for code with invalid structure', () => {
      const result = validateCodeSnippet('random text without structure');
      expect(result.isValid).toBe(false);
      expect(result.messages[0]).toMatch(/No valid code structure detected/);
    });
  });

  describe('detectLanguageFromIndicators', () => {
    it('should detect Groovy language', () => {
      const result = detectLanguageFromIndicators('println "Hello, Groovy!"');
      expect(result).toBe('groovy');
    });
  
    it('should detect TypeScript language', () => {
      const result = detectLanguageFromIndicators('interface Foo { bar: string; }');
      expect(result).toBe('typescript');
    });
  
    it('should detect Java language', () => {
      const result = detectLanguageFromIndicators('public class Test {}');
      expect(result).toBe('java');
    });
  
    it('should detect JavaScript language', () => {
      const result = detectLanguageFromIndicators('const test = () => {};');
      expect(result).toBe('javascript');
    });
  
    it('should return null for unknown language', () => {
      const result = detectLanguageFromIndicators('random text');
      expect(result).toBeNull();
    });
  });

  describe('validateAgainstLanguage', () => {
    const config = languageValidationConfigs.javascript;
  
    it('should return invalid for code snippet with invalid structure', () => {
      const result = validateAgainstLanguage('random text without structure', config, true);
      expect(result.isValid).toBe(false);
      expect(result.messages[0]).toMatch(/No valid code structure detected/);
    });
  });
  
  describe('checkLanguageDisqualifiers', () => {
    it('should detect disqualifiers for Java', () => {
      const result = checkLanguageDisqualifiers('def test() {}', 'Java');
      expect(result).toBe(true);
    });
  
    it('should detect disqualifiers for JavaScript', () => {
      const result = checkLanguageDisqualifiers('public class Test {}', 'JavaScript');
      expect(result).toBe(true);
    });
  
    it('should detect disqualifiers for TypeScript', () => {
      const result = checkLanguageDisqualifiers('println "Hello, Groovy!"', 'TypeScript');
      expect(result).toBe(true);
    });
  
    it('should return false for valid JavaScript code', () => {
      const result = checkLanguageDisqualifiers('function test() { return 1; }', 'JavaScript');
      expect(result).toBe(false);
    });
  });
});
