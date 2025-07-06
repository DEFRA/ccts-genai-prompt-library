import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePromptHandlers } from "../usePromptHandlers";
import { generatePrompt } from "../../utils/promptGenerator";
import { Template } from "../../types";

// Mock dependencies
vi.mock("../../utils/promptGenerator", () => ({
  generatePrompt: vi.fn().mockReturnValue("Generated Prompt")
}));

vi.mock("../../services/apiSelector", () => ({
  submitToLLM: vi.fn().mockResolvedValue("LLM Response")
}));

describe("usePromptHandlers", () => {
  // Mock config values
  const mockSetFormData = vi.fn();
  const mockSetShowPreview = vi.fn();
  const mockSetShowCopySuccess = vi.fn();
  const mockSetValidationErrors = vi.fn();
  const mockSetShakingSections = vi.fn();
  
  // Mock template
  const mockTemplate: Template = {
    id: "template1",
    name: "Test Template",
    content: "Test Content",
    role: "role1",
    expertise: "beginner",
    // Add other required template fields here
  };
  
  // Mock sections
  const mockCustomSections = { 
    "section1": "Custom Section 1 Content",
    "section2": "Custom Section 2 Content"
  };
  
  const mockMultiSections = {
    "multiSection1": ["Option 1", "Option 2"],
    "multiSection2": ["Option 3"]
  };
  
  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up timing mocks
    vi.useFakeTimers();
  });
  
  // Cleanup after each test
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  
  // Test config object
  const config = {
    setFormData: mockSetFormData,
    setShowPreview: mockSetShowPreview,
    setShowCopySuccess: mockSetShowCopySuccess,
    setValidationErrors: mockSetValidationErrors,
    setShakingSections: mockSetShakingSections,
    selectedTemplateForPrompt: mockTemplate,
    customSections: mockCustomSections,
    selectedMultiSections: mockMultiSections
  };

  it("should handle submit successfully", async () => {
    // Arrange
    const { result } = renderHook(() => usePromptHandlers(config));
    const roleFromExpertise = "Developer";
    const programmingLanguage = "TypeScript";
    
    // Act
    let response;
    await act(async () => {
      response = await result.current.handleSubmit(
        roleFromExpertise, 
        mockTemplate, 
        mockCustomSections, 
        mockMultiSections, 
        programmingLanguage
      );
    });
    
    // Assert
    expect(generatePrompt).toHaveBeenCalledWith(
      roleFromExpertise,
      mockTemplate,
      mockCustomSections,
      mockMultiSections,
      programmingLanguage
    );
    const { submitToLLM } = await import("../../services/apiSelector");
    expect(submitToLLM).toHaveBeenCalledWith("Generated Prompt");
    expect(response).toBe("LLM Response");
  });
  
  it("should throw error if no template is selected during submit", async () => {
    // Arrange
    const { result } = renderHook(() => usePromptHandlers(config));
    const roleFromExpertise = "Developer";
    
    // Act & Assert
    await expect(async () => {
      await act(async () => {
        await result.current.handleSubmit(
          roleFromExpertise, 
          null, 
          mockCustomSections, 
          mockMultiSections
        );
      });
    }).rejects.toThrow("No template selected");
    
    // Verify generatePrompt was not called
    expect(generatePrompt).not.toHaveBeenCalled();
  });
  
  it("should handle submit error from LLM service", async () => {
    // Arrange
    const { submitToLLM } = await import("../../services/apiSelector");
    vi.mocked(submitToLLM).mockRejectedValueOnce(new Error("LLM Service Error"));
    const { result } = renderHook(() => usePromptHandlers(config));
    const roleFromExpertise = "Developer";
    
    // Act & Assert
    await expect(async () => {
      await act(async () => {
        await result.current.handleSubmit(
          roleFromExpertise, 
          mockTemplate, 
          mockCustomSections, 
          mockMultiSections
        );
      });
    }).rejects.toThrow("LLM Service Error");
    
    // Verify calls were made in the correct order
    expect(generatePrompt).toHaveBeenCalled();
    expect(submitToLLM).toHaveBeenCalled();
  });
  
  it("should update form data when handleInputChange is called", () => {
    // Arrange
    const { result } = renderHook(() => usePromptHandlers(config));
    const sectionId = "testSection";
    const newValue = "New Test Value";
    
    // Act
    act(() => {
      result.current.handleInputChange(sectionId, newValue);
    });
    
    // Assert
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    
    // Verify the function passed to setFormData works correctly
    const updateFunction = mockSetFormData.mock.calls[0][0];
    const previousState = { existingSection: "Existing Value" };
    const newState = updateFunction(previousState);
    
    expect(newState).toEqual({
      existingSection: "Existing Value",
      [sectionId]: newValue
    });
  });
  
  it("should set showPreview to true when handlePreview is called", () => {
    // Arrange
    const { result } = renderHook(() => usePromptHandlers(config));
    
    // Act
    act(() => {
      result.current.handlePreview();
    });
    
    // Assert
    expect(mockSetShowPreview).toHaveBeenCalledWith(true);
  });
  
  it("should handle copy success and reset after timeout", () => {
    // Arrange
    const { result } = renderHook(() => usePromptHandlers(config));
    
    // Act
    act(() => {
      result.current.handleCopySuccess();
    });
    
    // Assert - Initial state
    expect(mockSetShowCopySuccess).toHaveBeenCalledWith(true);
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Assert - After timeout
    expect(mockSetShowCopySuccess).toHaveBeenCalledWith(false);
  });
  
  it("should not call timeout if handleCopySuccess is not called", () => {
    // Arrange
    renderHook(() => usePromptHandlers(config));
    
    // Act - don't call handleCopySuccess
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // Assert - setShowCopySuccess should not be called
    expect(mockSetShowCopySuccess).not.toHaveBeenCalled();
  });

  it("should handle default parameters in handleSubmit", async () => {
    // Arrange
    const { result } = renderHook(() => usePromptHandlers(config));
    const roleFromExpertise = "Developer";
    
    // Act
    await act(async () => {
      await result.current.handleSubmit(
        roleFromExpertise, 
        mockTemplate
      );
    });
    
    // Assert - Check that default empty objects were used
    expect(generatePrompt).toHaveBeenCalledWith(
      roleFromExpertise,
      mockTemplate,
      {}, // default empty customSections
      {}, // default empty selectedMultiSections
      "" // default empty programmingLanguage
    );
  });
});
