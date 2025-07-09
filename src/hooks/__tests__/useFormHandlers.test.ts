import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormHandlers } from "../useFormHandlers";
import { Template, CustomSection } from "../../types";

describe("useFormHandlers", () => {
  // Mock function for setSelectedTemplateForPrompt
  const mockSetSelectedTemplateForPrompt = vi.fn();

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Sample template for testing
  const mockTemplate: Template = {
    id: "template1",
    name: "Test Template",
    content: "Test content",
    role: "role1",
    customSections: [
      {
        id: "section1",
        name: "Section 1",
        type: "textarea",
      },
      {
        id: "section2",
        name: "Section 2",
        type: "multiselect",
        options: ["Option 1", "Option 2", "Option 3"],
      },
    ],
  };

  it("should initialize with empty objects", () => {
    // Act
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    
    // Assert
    expect(result.current.customSections).toEqual({});
    expect(result.current.selectedMultiSections).toEqual({});
  });

  it("should handle editing a section with existing options", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const section: CustomSection = {
      id: "section1",
      name: "Test Section",
      type: "multiselect",
      options: ["Option 1", "Option 2"],
    };
    
    // Act
    const editedSection = result.current.handleEditSection(section);
    
    // Assert
    expect(editedSection).toEqual({
      ...section,
      options: ["Option 1", "Option 2"], // Original options preserved
      inputValidation: {
        type: "regex",
        pattern: "",
        errorMessage: "",
      },
    });
  });

  it("should handle editing a section without options", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const section: CustomSection = {
      id: "section1",
      name: "Test Section",
      type: "textarea",
    };
    
    // Act
    const editedSection = result.current.handleEditSection(section);
    
    // Assert
    expect(editedSection).toEqual({
      ...section,
      options: [], // Empty array provided
      inputValidation: {
        type: "regex",
        pattern: "",
        errorMessage: "",
      },
    });
  });

  it("should handle editing a section with existing inputValidation", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const section: CustomSection = {
      id: "section1",
      name: "Test Section",
      type: "textarea",
      inputValidation: {
        type: "code-snippet",
        language: "javascript",
        errorMessage: "Invalid code",
      },
    };
    
    // Act
    const editedSection = result.current.handleEditSection(section);
    
    // Assert
    expect(editedSection).toEqual({
      ...section,
      options: [],
      inputValidation: {
        type: "code-snippet",
        language: "javascript",
        errorMessage: "Invalid code",
      }, // Original inputValidation preserved
    });
  });

  it("should handle deleting a section with valid template", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const sectionId = "section1";
    
    // Add some initial data to the states
    act(() => {
      result.current.setCustomSections({
        section1: "Content for section 1",
        section2: "Content for section 2",
      });
      
      result.current.setSelectedMultiSections({
        section1: ["Option 1"],
        section2: ["Option 2", "Option 3"],
      });
    });
    
    // Act
    act(() => {
      result.current.handleDeleteSection(sectionId, mockTemplate);
    });
    
    // Assert
    expect(mockSetSelectedTemplateForPrompt).toHaveBeenCalledWith({
      ...mockTemplate,
      customSections: [mockTemplate.customSections![1]], // Only section2 remains
    });
    
    expect(result.current.customSections).toEqual({
      section2: "Content for section 2", // section1 removed
    });
    
    expect(result.current.selectedMultiSections).toEqual({
      section2: ["Option 2", "Option 3"], // section1 removed
    });
  });

  it("should not modify anything when deleting a section with null template", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const sectionId = "section1";
    
    // Add some initial data to the states
    act(() => {
      result.current.setCustomSections({
        section1: "Content for section 1",
        section2: "Content for section 2",
      });
      
      result.current.setSelectedMultiSections({
        section1: ["Option 1"],
        section2: ["Option 2", "Option 3"],
      });
    });
    
    // Act
    act(() => {
      result.current.handleDeleteSection(sectionId, null);
    });
    
    // Assert
    expect(mockSetSelectedTemplateForPrompt).not.toHaveBeenCalled();
    
    // States should remain unchanged
    expect(result.current.customSections).toEqual({
      section1: "Content for section 1", 
      section2: "Content for section 2",
    });
    
    expect(result.current.selectedMultiSections).toEqual({
      section1: ["Option 1"],
      section2: ["Option 2", "Option 3"],
    });
  });

  it("should handle deleting a section that doesn't exist in the states", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const sectionId = "section3"; // Not in our initial data
    
    // Add some initial data to the states
    act(() => {
      result.current.setCustomSections({
        section1: "Content for section 1",
        section2: "Content for section 2",
      });
      
      result.current.setSelectedMultiSections({
        section1: ["Option 1"],
        section2: ["Option 2", "Option 3"],
      });
    });
    
    // Act
    act(() => {
      result.current.handleDeleteSection(sectionId, mockTemplate);
    });
    
    // Assert
    expect(mockSetSelectedTemplateForPrompt).toHaveBeenCalledWith({
      ...mockTemplate,
      customSections: mockTemplate.customSections, // All sections remain since section3 wasn't found
    });
    
    // States should remain unchanged
    expect(result.current.customSections).toEqual({
      section1: "Content for section 1", 
      section2: "Content for section 2",
    });
    
    expect(result.current.selectedMultiSections).toEqual({
      section1: ["Option 1"],
      section2: ["Option 2", "Option 3"],
    });
  });

  it("should handle template with undefined customSections", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const sectionId = "section1";
    const templateWithoutSections: Template = {
      id: "template2",
      name: "Test Template 2",
      content: "Test content 2",
      role: "role2",
    };
    
    // Add some initial data to the states
    act(() => {
      result.current.setCustomSections({
        section1: "Content for section 1",
      });
      
      result.current.setSelectedMultiSections({
        section1: ["Option 1"],
      });
    });
    
    // Act
    act(() => {
      result.current.handleDeleteSection(sectionId, templateWithoutSections);
    });
    
    // Assert
    expect(mockSetSelectedTemplateForPrompt).toHaveBeenCalledWith({
      ...templateWithoutSections,
      customSections: [], // Empty array since customSections was undefined
    });
    
    expect(result.current.customSections).toEqual({});
    expect(result.current.selectedMultiSections).toEqual({});
  });

  it("should correctly update states using setCustomSections", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const newCustomSections = {
      section1: "New content for section 1",
      section2: "New content for section 2",
    };
    
    // Act
    act(() => {
      result.current.setCustomSections(newCustomSections);
    });
    
    // Assert
    expect(result.current.customSections).toEqual(newCustomSections);
  });

  it("should correctly update states using setSelectedMultiSections", () => {
    // Arrange
    const { result } = renderHook(() => useFormHandlers(mockSetSelectedTemplateForPrompt));
    const newSelectedMultiSections = {
      section1: ["New option 1", "New option 2"],
      section2: ["New option 3"],
    };
    
    // Act
    act(() => {
      result.current.setSelectedMultiSections(newSelectedMultiSections);
    });
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual(newSelectedMultiSections);
  });
});
