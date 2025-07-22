import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePromptFormValidation } from "../usePromptFormValidation";
import { Template } from "../../types";

describe("usePromptFormValidation", () => {
  // Setup mock setIsValid function
  const mockSetIsValid = vi.fn();
  
  // Reset mock before each test
  beforeEach(() => {
    mockSetIsValid.mockReset();
  });

  it("should validate form as invalid when template is null", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt = null;
    const customSections = {};
    const selectedMultiSections = {};
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });

  it("should validate form as invalid when role is missing and modal mode requires it", () => {
    // Arrange
    const roleFromExpertise = null;
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: []
    };
    const customSections = {};
    const selectedMultiSections = {};
    const programmingLanguage = "";
    const modalMode = "otherMode";  // Not "createPromptWithTemplate"

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });

  it("should validate form as valid when role is missing but modal mode is createPromptWithTemplate", () => {
    // Arrange
    const roleFromExpertise = null;
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: []
    };
    const customSections = {};
    const selectedMultiSections = {};
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(true);
  });

  it("should validate form as invalid when programming language is required but missing", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: true,  // Requires programming language
      customSections: []
    };
    const customSections = {};
    const selectedMultiSections = {};
    const programmingLanguage = "";  // Missing programming language
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });

  it("should validate form as valid when programming language is required and provided", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: true,  // Requires programming language
      customSections: []
    };
    const customSections = {};
    const selectedMultiSections = {};
    const programmingLanguage = "TypeScript";  // Programming language provided
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(true);
  });

  it("should validate form as invalid when required text section is empty", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "requiredSection",
          title: "Required Section",
          placeholder: "Enter text",
          type: "text",
          required: true
        }
      ]
    };
    const customSections = {
      "requiredSection": ""  // Empty required section
    };
    const selectedMultiSections = {};
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });

  it("should validate form as invalid when required text section contains only whitespace", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "requiredSection",
          title: "Required Section",
          placeholder: "Enter text",
          type: "text",
          required: true
        }
      ]
    };
    const customSections = {
      "requiredSection": "   "  // Only whitespace in required section
    };
    const selectedMultiSections = {};
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });

  it("should validate form as valid when required text section has content", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "requiredSection",
          title: "Required Section",
          placeholder: "Enter text",
          type: "text",
          required: true
        }
      ]
    };
    const customSections = {
      "requiredSection": "Valid content"  // Valid content in required section
    };
    const selectedMultiSections = {};
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(true);
  });

  it("should validate form as invalid when required multiselect section is empty", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "multiSection",
          title: "Multiselect Section",
          placeholder: "Select items",
          type: "multiselect",
          required: true,
          options: ["Option 1", "Option 2"]
        }
      ]
    };
    const customSections = {};
    const selectedMultiSections = {
      "multiSection": []  // Empty multiselect
    };
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });

  it("should validate form as valid when required multiselect section has selections", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "multiSection",
          title: "Multiselect Section",
          placeholder: "Select items",
          type: "multiselect",
          required: true,
          options: ["Option 1", "Option 2"]
        }
      ]
    };
    const customSections = {};
    const selectedMultiSections = {
      "multiSection": ["Option 1"]  // Has selection
    };
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(true);
  });

  it("should validate form as valid when multiselect section is missing from state but not required", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "multiSection",
          title: "Multiselect Section",
          placeholder: "Select items",
          type: "multiselect",
          required: false,  // Not required
          options: ["Option 1", "Option 2"]
        }
      ]
    };
    const customSections = {};
    const selectedMultiSections = {};  // Missing from state
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(true);
  });

  it("should validate form as valid with multiple required sections that are all valid", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: true,
      customSections: [
        {
          id: "textSection",
          title: "Text Section",
          placeholder: "Enter text",
          type: "text",
          required: true
        },
        {
          id: "multiSection",
          title: "Multiselect Section",
          placeholder: "Select items",
          type: "multiselect",
          required: true,
          options: ["Option 1", "Option 2"]
        }
      ]
    };
    const customSections = {
      "textSection": "Valid text content"
    };
    const selectedMultiSections = {
      "multiSection": ["Option 1", "Option 2"]
    };
    const programmingLanguage = "JavaScript";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(true);
  });

  it("should validate form as invalid with multiple required sections when one is invalid", () => {
    // Arrange
    const roleFromExpertise = "Developer";
    const selectedTemplateForPrompt: Template = {
      id: "template1",
      name: "Test Template",
      content: "",
      role: "role1",
      expertise: "beginner",
      showProgrammingLanguage: false,
      customSections: [
        {
          id: "textSection",
          title: "Text Section",
          placeholder: "Enter text",
          type: "text",
          required: true
        },
        {
          id: "multiSection",
          title: "Multiselect Section",
          placeholder: "Select items",
          type: "multiselect",
          required: true,
          options: ["Option 1", "Option 2"]
        }
      ]
    };
    const customSections = {
      "textSection": "Valid text content"
    };
    const selectedMultiSections = {
      "multiSection": []  // Invalid - empty required multiselect
    };
    const programmingLanguage = "";
    const modalMode = "createPromptWithTemplate";

    // Act
    renderHook(() => 
      usePromptFormValidation(
        roleFromExpertise,
        selectedTemplateForPrompt,
        customSections,
        selectedMultiSections,
        programmingLanguage,
        mockSetIsValid,
        modalMode
      )
    );

    // Assert
    expect(mockSetIsValid).toHaveBeenCalledWith(false);
  });
});
