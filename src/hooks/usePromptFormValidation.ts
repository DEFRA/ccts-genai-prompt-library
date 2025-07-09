import { useEffect } from "react";
import { Template } from "../types";

export const usePromptFormValidation = (
  roleFromExpertise: string | null,
  selectedTemplateForPrompt: Template | null,
  customSections: Record<string, string>,
  selectedMultiSections: Record<string, any>,
  programmingLanguage: string,
  setIsValid: (valid: boolean) => void,
  modalMode: string
) => {
  useEffect(() => {
    const isFormValid = (): boolean => {
      if (!isTemplateValid()) return false;
      if (!areRequiredSectionsValid()) return false;
      return true;
    };

    const isTemplateValid = (): boolean => {
      if (!selectedTemplateForPrompt) return false;

      if (modalMode !== "createPromptWithTemplate" && !roleFromExpertise) {
        return false;
      }

      if (
        selectedTemplateForPrompt.showProgrammingLanguage &&
        !programmingLanguage
      ) {
        return false;
      }

      return true;
    };

    const areRequiredSectionsValid = (): boolean => {
      const requiredSections =
        selectedTemplateForPrompt?.customSections?.filter((s) => s.required) ||
        [];

      return requiredSections.every((section) => {
        if (section.type === "multiselect") {
          const selections = selectedMultiSections[section.id] ?? [];
          return selections.length > 0;
        }
        const content = customSections[section.id];
        return content && content.trim() !== "";
      });
    };

    setIsValid(isFormValid());
  }, [
    roleFromExpertise,
    selectedTemplateForPrompt,
    customSections,
    selectedMultiSections,
    programmingLanguage,
    modalMode,
    setIsValid,
  ]);
};
