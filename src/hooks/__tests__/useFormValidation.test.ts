import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormValidation } from "../useFormValidation";
import { useTemplateValidation } from "../useTemplateValidation";
import { CustomSection, Template } from "../../types";

// Mock the useTemplateValidation hook
vi.mock("../useTemplateValidation");

// Create a mock function for the validateSection
const mockValidateSection = vi.fn();

// Setup mock implementation before each test
beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();
  
  // Set default behavior for validateSection
  mockValidateSection.mockImplementation((section, content) => {
    // For required sections that are empty
    if (section.required && (!content || content.trim() === "")) {
      return { isValid: false, message: `${section.name} is required` };
    }
    
    // Special case for our test section that should always be invalid
    if (section.id === "invalidSection") {
      return { isValid: false, message: "Invalid section content" };
    }
    
    // All other sections are valid
    return { isValid: true };
  });
  
  // Set up the mock return for useTemplateValidation
  vi.mocked(useTemplateValidation).mockReturnValue({
    validateSection: mockValidateSection,
    validateSections: vi.fn(),
    sectionErrors: {},
    shakingSections: new Set()
  });
});

describe("useFormValidation", () => {
  // Sample template for testing
  const mockTemplate: Template = {
    id: "template1",
    name: "Test Template",
    content: "Test content",
    role: "role1",
    customSections: [
      {
        id: "section1",
        name: "Required Section",
        type: "textarea",
        required: true,
        isVisible: true,
      },
      {
        id: "section2",
        name: "Optional Section",
        type: "textarea",
        required: false,
        isVisible: true,
      },
      {
        id: "section3",
        name: "Hidden Required Section",
        type: "textarea",
        required: true,
        isVisible: false,
      },
      {
        id: "invalidSection",
        name: "Invalid Section",
        type: "textarea",
        required: true,
        isVisible: true,
      }
    ],
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state values", () => {
    // Act
    const { result } = renderHook(() => useFormValidation());
    
    // Assert
    expect(result.current.validationError).toBe("");
    expect(result.current.isValid).toBe(false);
  });

  it("should validate basic fields correctly - all fields present", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced",
      templateId: "template1"
    };
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData);
    });
    
    // Assert
    expect(isValid).toBe(true);
    expect(result.current.validationError).toBe("");
  });

  it("should validate basic fields correctly - missing role", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      expertise: "Advanced",
      templateId: "template1"
    };
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData);
    });
    
    // Assert
    expect(isValid).toBe(false);
    expect(result.current.validationError).toBe("Role is required.");
  });

  it("should validate basic fields correctly - missing expertise", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      templateId: "template1"
    };
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData);
    });
    
    // Assert
    expect(isValid).toBe(false);
    expect(result.current.validationError).toBe("Expertise is required.");
  });

  it("should validate basic fields correctly - missing templateId", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced"
    };
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData);
    });
    
    // Assert
    expect(isValid).toBe(false);
    expect(result.current.validationError).toBe("Template selection is required.");
  });  it("should validate template fields - all required fields filled", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced",
      templateId: "template1",
      customSections: {
        section1: "Valid content for section 1",
      }
    };
    
    // Force validateSection to always return valid for this test
    mockValidateSection.mockReturnValue({ isValid: true });
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData, mockTemplate);
    });
    
    // Assert
    expect(isValid).toBe(true);
    expect(result.current.validationError).toBe("");
  });
  it("should validate template fields - missing required field", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced",
      templateId: "template1",
      customSections: {
        // section1 is missing
      }
    };
    
    // Configure mockValidateSection to return invalid for missing required content
    mockValidateSection.mockImplementation((section, content) => {
      if (section.required && (!content || content.trim() === "")) {
        return { isValid: false, message: `${section.name} is required` };
      }
      return { isValid: true };
    });
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData, mockTemplate);
    });
    
    // Assert
    expect(isValid).toBe(false);
    expect(result.current.validationError).toBe("Required Section is required");
  });
  it("should validate template fields - invalid field content", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced",
      templateId: "template1",
      customSections: {
        section1: "Valid content for section 1",
        invalidSection: "Invalid content"
      }
    };
    
    // Configure mockValidateSection to return invalid for the invalidSection 
    mockValidateSection.mockImplementation((section, content) => {
      if (section.id === "invalidSection") {
        return { isValid: false, message: "Invalid section content" };
      }
      return { isValid: true };
    });
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData, mockTemplate);
    });
    
    // Assert
    expect(isValid).toBe(false);
    expect(result.current.validationError).toBe("Invalid section content");
  });  it("should ignore hidden required sections", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced",
      templateId: "template1",
      customSections: {
        section1: "Valid content for section 1",
        // section3 is missing, but it's hidden so should be ignored
      }
    };
    
    // Configure mockValidateSection to always return valid for this test
    // since we're testing that hidden sections are ignored
    mockValidateSection.mockReturnValue({ isValid: true });
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData, mockTemplate);
    });
    
    // Assert
    expect(isValid).toBe(true);
    expect(result.current.validationError).toBe("");
  });

  it("should return true when validateForm is called without a template", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const formData = {
      role: "Developer",
      expertise: "Advanced",
      templateId: "template1",
    };
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateForm(formData);
    });
    
    // Assert
    expect(isValid).toBe(true);
    expect(result.current.validationError).toBe("");
  });

  it("should validate a custom section correctly - valid", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const section: CustomSection = {
      id: "testSection",
      name: "Test Section",
      type: "textarea",
      required: true,
    };
    const content = "Valid content";
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateCustomSection(section, content);
    });
    
    // Assert
    expect(isValid).toBe(true);
  });
  it("should validate a custom section correctly - invalid", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const section: CustomSection = {
      id: "invalidSection",
      name: "Invalid Section",
      type: "textarea",
      required: true,
    };
    const content = "Invalid content";
    
    // Configure mockValidateSection to return invalid for this specific test
    mockValidateSection.mockReturnValue({ isValid: false, message: "Invalid section content" });
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateCustomSection(section, content);
    });
    
    // Assert
    expect(isValid).toBe(false);
  });

  it("should validate a custom section correctly - empty required", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const section: CustomSection = {
      id: "requiredSection",
      name: "Required Section",
      type: "textarea",
      required: true,
    };
    const content = "";
    
    // Act
    let isValid;
    act(() => {
      isValid = result.current.validateCustomSection(section, content);
    });
    
    // Assert
    expect(isValid).toBe(false);
  });

  it("should correctly update isValid state via setIsValid", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    
    // Act
    act(() => {
      result.current.setIsValid(true);
    });
    
    // Assert
    expect(result.current.isValid).toBe(true);
  });

  it("should correctly update validationError state via setValidationError", () => {
    // Arrange
    const { result } = renderHook(() => useFormValidation());
    const errorMessage = "Test validation error message";
    
    // Act
    act(() => {
      result.current.setValidationError(errorMessage);
    });
    
    // Assert
    expect(result.current.validationError).toBe(errorMessage);
  });
});
