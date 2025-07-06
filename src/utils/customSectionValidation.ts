import { Template, CustomSection, SectionValidationResult } from "../types";

export const validateCustomSection = (
  section: CustomSection,
  content: string
): SectionValidationResult => {
  if (section.inputValidation) {
    const { type, pattern, errorMessage } = section.inputValidation;
    const bddKeywords = ["Given", "When", "Then"];
    let hasAllKeywords = false;

    switch (type) {
      case "code-snippet":
        if (!content.trim()) {
          return {
            isValid: false,
            message: errorMessage || "Code snippet is required",
          };
        }
        break;

      case "bdd":
        hasAllKeywords = bddKeywords.every((keyword) =>
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!hasAllKeywords) {
          return {
            isValid: false,
            message:
              errorMessage ||
              "BDD scenario must include Given, When, and Then statements",
          };
        }
        break;

      case "regex":
        if (pattern && !new RegExp(pattern).test(content)) {
          return { isValid: false, message: errorMessage || "Invalid format" };
        }
        break;
    }
  }

  return { isValid: true };
};


function validateBddSection(section: CustomSection, content: string): string | null {
  if (section.inputValidation?.type === 'bdd') {
    const bddKeywords = ['Given', 'When', 'Then'];
    const hasAllKeywords = bddKeywords.every(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (!hasAllKeywords) {
      return 'BDD scenario must include Given, When, and Then statements';
    }
  }
  return null;
}

function validateMultiSelectSection(section: CustomSection, selectedValues: string[]): string | null {
  if (section.required && selectedValues.length === 0) {
    return `${section.name} is required`;
  }
  return null;
}

function validateRequiredSection(section: CustomSection, content: string): string | null {
  if (section.required && !content?.trim()) {
    return `${section.name} is required`;
  }
  return null;
}


function getSectionValidationError(
  section: CustomSection,
  content: string,
  selectedValues: string[]
): string | null {
  if (!section.isVisible) return null;

  if (section.inputValidation?.type === 'bdd') {
    return validateBddSection(section, content);
  }

  if (section.type === 'multiselect') {
    return validateMultiSelectSection(section, selectedValues);
  }

  return validateRequiredSection(section, content);
}

export const validateAllCustomSections = async (
  template: Template,
  customSections: { [key: string]: string },
  selectedMultiSections: { [key: string]: string[] }
) => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  if (!template) {
    return { isValid: false, errors: { general: "No template selected" } };
  }

  console.log("Starting validation with:", {
    customSections,
    selectedMultiSections,
  });

  for (const section of template.customSections || []) {
    const content = customSections[section.id] || '';
    const selectedValues = Array.isArray(selectedMultiSections[section.id])
      ? selectedMultiSections[section.id]
      : [];

    console.log("Validating section:", {
      section,
      content,
      selectedValues,
      type: section.type
    });

    const error = getSectionValidationError(section, content, selectedValues);
    if (error) {
      errors[section.id] = error;
      isValid = false;
    }
  }

  console.log('Validation result:', {
    isValid,
    errors,
    selectedMultiSections,
    customSections
  });
  return { isValid, errors };
};
