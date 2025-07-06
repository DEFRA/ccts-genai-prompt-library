import { useState } from "react";
import { CustomSection, SectionErrors } from "../types";
import { validateCustomSection } from "../utils/customSectionValidation";

export const useCustomSections = () => {
  const [sections, setSections] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<SectionErrors>({});

  const handleSectionChange = (
    sectionId: string,
    value: string,
    sectionConfig: CustomSection
  ) => {
    const errorMessage = getValidationMessage(sectionConfig, value);

    setSections((prev) => ({
      ...prev,
      [sectionId]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [sectionId]: errorMessage,
    }));
  };

  const getValidationMessage = (
    sectionConfig: CustomSection,
    value: string
  ): string => {
    const validationResult = validateCustomSection(sectionConfig, value);

    if (typeof validationResult === "boolean") {
      return validationResult ? "" : "Invalid input";
    }

    return validationResult.message || "Invalid input";
  };

  return {
    customSections: sections,
    sectionErrors: errors,
    handleSectionChange,
  };
};
