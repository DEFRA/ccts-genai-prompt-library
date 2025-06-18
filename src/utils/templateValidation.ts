import { Template, CustomSection, ValidationResult } from "../types";
import { validateCustomSection } from "./customSectionValidation";

export interface ValidationContext {
  selectedRole: string;
  selectedExpertise: string;
  selectedTemplate: Template | null;
  customSections: { [key: string]: string };
  selectedMultiSections: { [key: string]: string[] };
  expertiseOptions: string[];
  programmingLanguage?: string;
  uploadedFiles?: File[];
  roles?: any[];
  allRoles?: any[];
  filteredTemplates?: any[];
  defaultRoles?: any[];
  defaultTemplates?: any[];
  userTemplates?: any[];
  templates?: any[];
  languages?: any[];
}

function validateBasicRequirements(
  selectedRole: string,
  selectedExpertise: string,
  selectedTemplate: Template | null,
  expertiseOptions: string[]
): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!selectedRole) {
    errors.role = "Please select a role.";
    return { isValid: false, errors };
  }

  if (expertiseOptions.length > 0 && !selectedExpertise) {
    errors.expertise = "Please select an expertise.";
    return { isValid: false, errors };
  }

  if (!selectedTemplate) {
    errors.template = "Please select a goal template.";
    return { isValid: false, errors };
  }

  return { isValid: true, errors: {} };
}

function validateSectionContent(
  section: CustomSection,
  customSections: { [key: string]: string },
  selectedMultiSections: { [key: string]: string[] }
): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (!section.isVisible) return { isValid: true, errors: {} };

  if (section.type === "textarea") {
    const validation = validateCustomSection(
      section,
      customSections[section.id] || ""
    );
    if (!validation.isValid) {
      errors[section.id] = validation.message || "Invalid input";
      return { isValid: false, errors };
    }
  }

  if (section.type === "multiselect" && section.required) {
    const selectedOptions = selectedMultiSections[section.id] || [];
    if (selectedOptions.length === 0) {
      errors[section.id] = `Please select at least one option for ${
        section.name || "this section"
      }.`;
      return { isValid: false, errors };
    }
  }

  return { isValid: true, errors: {} };
}

export function validateTemplateForm(
  context: ValidationContext
): ValidationResult {
  const basicValidation = validateBasicRequirements(
    context.selectedRole,
    context.selectedExpertise,
    context.selectedTemplate,
    context.expertiseOptions
  );
  if (!basicValidation.isValid) return basicValidation;

  const errors: { [key: string]: string } = {};
  if (context.selectedTemplate?.customSections) {
    for (const section of context.selectedTemplate.customSections) {
      const sectionValidation = validateSectionContent(
        section,
        context.customSections,
        context.selectedMultiSections
      );
      if (!sectionValidation.isValid) {
        return sectionValidation;
      }
    }
  }

  return { isValid: true, errors: {} };
}

export function validateSpecificTemplateType(
  templateType: string,
  context: ValidationContext
): ValidationResult {
  const errors: { [key: string]: string } = {};

  if (templateType === "coding-prompt" && !context.programmingLanguage) {
    errors.language = "Please select a programming language.";
    return { isValid: false, errors };
  }

  return validateTemplateForm(context);
}

export const validateTemplateData = (
  templateData: Partial<Template>
): ValidationResult => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  if (!templateData.name?.trim()) {
    errors.name = "Template name is required";
    isValid = false;
  }

  if (!templateData.role) {
    errors.role = "Role selection is required";
    isValid = false;
  }

  if (!templateData.expertise) {
    errors.expertise = "Expertise selection is required";
    isValid = false;
  }

  if (!templateData.raceRole?.trim()) {
    errors.raceRole = "RACE Role description is required";
    isValid = false;
  }

  if (!templateData.raceAction?.trim()) {
    errors.raceAction = "RACE Action description is required";
    isValid = false;
  }

  return { isValid, errors };
};

export const prepareTemplateData = (formData: any): Partial<Template> => {
  return {
    ...formData,
    updatedAt: new Date().toISOString(),
  };
};
