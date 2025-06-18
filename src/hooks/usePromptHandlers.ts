import { useCallback } from "react";
import { Template } from "../types";
import { generatePrompt } from "../utils/promptGenerator";
import { submitToLLM } from "../services/apiSelector";

interface PromptHandlerConfig {
  setFormData: (data: any) => void;
  setShowPreview: (show: boolean) => void;
  setShowCopySuccess: (show: boolean) => void;
  setValidationErrors: (errors: any) => void;
  setShakingSections: (sections: string[]) => void;
  selectedTemplateForPrompt: Template | null;
  customSections: { [key: string]: string };
  selectedMultiSections: { [key: string]: string[] };
}

export const usePromptHandlers = (config: PromptHandlerConfig) => {
  const { setFormData, setShowPreview, setShowCopySuccess } = config;

  const handleSubmit = useCallback(
    async (
      roleFromExpertise: string | null,
      selectedTemplateForPrompt: Template | null,
      customSections: { [key: string]: string } = {},
      selectedMultiSections: { [key: string]: string[] } = {},
      programmingLanguage: string = ""
    ) => {
      try {
        if (!selectedTemplateForPrompt) {
          throw new Error("No template selected");
        }

        const prompt = generatePrompt(
          roleFromExpertise,
          selectedTemplateForPrompt,
          customSections,
          selectedMultiSections,
          programmingLanguage
        );

        const response = await submitToLLM(prompt);
        return response;
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        throw error;
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (sectionId: string, value: string) => {
      setFormData((prev: any) => ({
        ...prev,
        [sectionId]: value,
      }));
    },
    [setFormData]
  );

  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, [setShowPreview]);

  const handleCopySuccess = useCallback(() => {
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  }, [setShowCopySuccess]);

  return {
    handleSubmit,
    handleInputChange,
    handlePreview,
    handleCopySuccess,
  };
};
