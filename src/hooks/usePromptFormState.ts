import { useState } from "react";
import { Template } from "../types";

export const usePromptFormState = (
  updateFilteredTemplates: (roleId: string, expertise: string) => void
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formExpanded, setFormExpanded] = useState(false);

  const handleStepChange = (
    roleFromExpertise: string | null,
    selectedTemplateForPrompt: Template | null,
    modalMode: string
  ) => {
    const isTemplateMode =
      modalMode === "createPromptWithTemplate" || roleFromExpertise;
    if (isTemplateMode && selectedTemplateForPrompt) {
      setCurrentStep(3);
      setFormExpanded(true);
    } else {
      setFormExpanded(currentStep === 3);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormExpanded(false);
    updateFilteredTemplates("", "");
  };

  return {
    currentStep,
    setCurrentStep,
    formExpanded,
    handleStepChange,
    resetForm,
  };
};
