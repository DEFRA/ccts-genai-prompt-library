import { useState } from "react";
import { CustomSection, Template } from "../types";
import { useTemplateValidation } from "./useTemplateValidation";

export const useFormValidation = () => {
  const [validationError, setValidationError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const { validateSection } = useTemplateValidation();

  const validateForm = (
    formData: any,
    template: Template | null = null
  ): boolean => {
    if (!validateBasicFields(formData)) return false;
    if (template && !validateTemplateFields(formData, template)) return false;

    setValidationError("");
    return true;
  };

  const validateBasicFields = (formData: any): boolean => {
    if (!formData.role) {
      setValidationError("Role is required.");
      return false;
    }
    if (!formData.expertise) {
      setValidationError("Expertise is required.");
      return false;
    }
    if (!formData.templateId) {
      setValidationError("Template selection is required.");
      return false;
    }
    return true;
  };

  const validateTemplateFields = (
    formData: any,
    template: Template
  ): boolean => {
    const requiredSections =
      template.customSections?.filter(
        (section) => section.required && section.isVisible
      ) || [];

    for (const section of requiredSections) {
      const content = formData.customSections?.[section.id];
      const result = validateSection(section, content);
      if (!result.isValid) {
        setValidationError(result.message || `${section.name} is required.`);
        return false;
      }
    }
    return true;
  };

  const validateCustomSection = (
    section: CustomSection,
    content: string | undefined
  ): boolean => {
    const result = validateSection(section, content);
    return result.isValid;
  };

  return {
    validationError,
    isValid,
    validateForm,
    validateCustomSection,
    setIsValid,
    setValidationError,
  };
};

export default useFormValidation;
