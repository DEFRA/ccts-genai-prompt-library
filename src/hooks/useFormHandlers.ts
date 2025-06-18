import { useState } from "react";
import { Template, CustomSection } from "../types";

export const useFormHandlers = (
  setSelectedTemplateForPrompt: (template: Template | null) => void
) => {
  const [customSections, setCustomSections] = useState<Record<string, string>>(
    {}
  );
  const [selectedMultiSections, setSelectedMultiSections] = useState<
    Record<string, any>
  >({});

  const handleEditSection = (section: CustomSection): CustomSection => ({
    ...section,
    options: section.options || [],
    inputValidation: section.inputValidation || {
      type: "regex",
      pattern: "",
      errorMessage: "",
    },
  });

  const handleDeleteSection = (
    sectionId: string,
    template: Template | null
  ) => {
    if (!template) return;

    const updatedSections =
      template.customSections?.filter((section) => section.id !== sectionId) ||
      [];
    setSelectedTemplateForPrompt({
      ...template,
      customSections: updatedSections,
    });

    setCustomSections((prev) => {
      const updated = { ...prev };
      delete updated[sectionId];
      return updated;
    });

    setSelectedMultiSections((prev) => {
      const updated = { ...prev };
      delete updated[sectionId];
      return updated;
    });
  };

  return {
    customSections,
    selectedMultiSections,
    setCustomSections,
    setSelectedMultiSections,
    handleEditSection,
    handleDeleteSection,
  };
};
