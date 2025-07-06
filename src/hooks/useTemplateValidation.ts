import { useState } from 'react';
import { Template, CustomSection } from '../types';
import { toast } from 'react-hot-toast';
import { validateCodeSnippet } from '../utils/codeValidation';

export const useTemplateValidation = () => {
  const [sectionErrors, setSectionErrors] = useState<{ [key: string]: string }>({});
  const [shakingSections, setShakingSections] = useState(new Set<string>());


  const validateSection = (section: CustomSection, content: string | undefined): { isValid: boolean; message?: string } => {
    if (section.required && (!content || content.trim() === '')) {
      return { isValid: false, message: `${section.name} is required` };
    }

    if (!content || content.trim() === '') {
      return { isValid: true };
    }

    if (section.inputValidation) {
      return validateInput(section, content);
    }

    return { isValid: true };
  };


  const validateInput = (section: CustomSection, content: string): { isValid: boolean; message?: string } => {
    switch (section.inputValidation.type) {
      case 'code-snippet':
        return validateCodeSection(section, content);
      case 'bdd':
        return validateBDDSection(section, content);
      case 'regex':
        return validateRegexSection(section, content);
      default:
        return { isValid: true };
    }
  };


  const validateCodeSection = (section: CustomSection, content: string): { isValid: boolean; message?: string } => {
    if (content.trim().length < 10) {
      return { isValid: false, message: 'Code snippet is too short. Please provide a complete code example.' };
    }

    const normalizedContent = content.trim().replace(/\r\n/g, '\n');
    if (isInvalidCode(normalizedContent)) {
      return { isValid: false, message: 'Invalid code. Please provide actual code with proper syntax, not random text.' };
    }

    const language = determineLanguage(section);
    if (language && !validateCodeSnippet(normalizedContent, language).isValid) {
      return { isValid: false, message: `Invalid ${language} code syntax` };
    }

    return { isValid: true };
  };

  const validateBDDSection = (section: CustomSection, content: string): { isValid: boolean; message?: string } => {
    const bddPattern = /^[ \t]*(?:Feature|Scenario|Given|When|Then)[ \t:].*$/m;
    if (!bddPattern.test(content)) {
      return { isValid: false, message: section.inputValidation.errorMessage || `Invalid BDD format for ${section.name}` };
    }
    return { isValid: true };
  };


  const validateRegexSection = (section: CustomSection, content: string): { isValid: boolean; message?: string } => {
    try {
      const regex = new RegExp(section.inputValidation.pattern || '');
      if (!regex.test(content)) {
        return { isValid: false, message: section.inputValidation.errorMessage || `Invalid format for ${section.name}` };
      }
    } catch (error) {
      console.error('Invalid regex pattern:', error);
    }
    return { isValid: true };
  };

  const determineLanguage = (section: CustomSection): string | null => {
    if (section.inputValidation.language) {
      return section.inputValidation.language.toLowerCase();
    }
    const id = section.id.toLowerCase();
    if (id.includes('groovy')) {
      return 'groovy';
    } else if (id.includes('javascript')) {
      return 'javascript';
    } else if (id.includes('typescript')) {
      return 'typescript';
    } else if (id.includes('python')) {
      return 'python';
    }
    return null;
  };


  const isInvalidCode = (content: string): boolean => {
    const hasRandomCharacters = /[^a-zA-Z0-9_\s{}<>=+*%&|^~@$`()[\],-]/.test(content);
    const hasOnlyRandomWords = !/\b(function|class|def|import|package|public|private|protected|const|let|var|if|for|while|return|void|int|string|boolean)\b/i.test(content);
    return hasRandomCharacters || hasOnlyRandomWords;
  };


  const validateSections = (template: Template | null, sections: { [key: string]: string }) => {
    if (!template?.customSections) {
      return { isValid: true, errors: {} };
    }

    const errors: { [key: string]: string } = {};
    const shakingIds = new Set<string>();
    let hasErrors = false;

    template.customSections.forEach((section) => {
      if (!section.isVisible) return;

      const content = sections[section.id];
      const result = validateSection(section, content);

      if (!result.isValid) {
        errors[section.id] = result.message || `Invalid ${section.name}`;
        shakingIds.add(section.id);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setSectionErrors(errors);
      setShakingSections(shakingIds);
      toast.error(Object.values(errors)[0]);

      setTimeout(() => setShakingSections(new Set()), 820);
    } else {
      setSectionErrors({});
      setShakingSections(new Set());
    }

    return { isValid: !hasErrors, errors };
  };

  return {
    sectionErrors,
    shakingSections,
    validateSections,
    validateSection,
  };
};

export default useTemplateValidation;