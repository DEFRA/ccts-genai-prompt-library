import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMultiSelectState } from "../useMultiSelectState";
import { Template } from "../../types";

describe("useMultiSelectState", () => {
  // Mock template with multiselect sections
  const mockTemplate: Template = {
    id: "template1",
    name: "Test Template",
    content: "Test content",
    role: "role1",
    customSections: [
      {
        id: "section1",
        name: "Section 1",
        type: "multiselect",
        options: ["Option 1", "Option 2", "Option 3"]
      },
      {
        id: "section2",
        name: "Section 2",
        type: "multiselect",
        options: ["Option A", "Option B", "Option C"]
      },
      {
        id: "section3",
        name: "Section 3",
        type: "textarea" // Not a multiselect section
      }
    ]
  };

  // Template without multiselect sections
  const templateWithoutMultiselect: Template = {
    id: "template2",
    name: "Test Template 2",
    content: "Test content 2",
    role: "role2",
    customSections: [
      {
        id: "section3",
        name: "Section 3",
        type: "textarea"
      }
    ]
  };

  // Template without custom sections
  const templateWithoutSections: Template = {
    id: "template3",
    name: "Test Template 3",
    content: "Test content 3",
    role: "role3",
  };

  it("should initialize with an empty object when template is null", () => {
    // Arrange & Act
    const { result } = renderHook(() => useMultiSelectState(null));
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual({});
  });

  it("should initialize multiselect sections from the template", () => {
    // Arrange & Act
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual({
      section1: [],
      section2: []
    });
    // Should not include section3 as it's not a multiselect
    expect(result.current.selectedMultiSections.section3).toBeUndefined();
  });

  it("should initialize with an empty object when template has no multiselect sections", () => {
    // Arrange & Act
    const { result } = renderHook(() => useMultiSelectState(templateWithoutMultiselect));
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual({});
  });

  it("should initialize with an empty object when template has no custom sections", () => {
    // Arrange & Act
    const { result } = renderHook(() => useMultiSelectState(templateWithoutSections));
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual({});
  });

  it("should update state when template changes", () => {
    // Arrange
    const { result, rerender } = renderHook(
      (props) => useMultiSelectState(props.template),
      {
        initialProps: { template: null }
      }
    );
    
    // Act - update the template prop
    rerender({ template: mockTemplate });
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual({
      section1: [],
      section2: []
    });
  });

  it("should add an option when checked is true", () => {
    // Arrange
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    const sectionId = "section1";
    const option = "Option 1";
    const initialValues: string[] = [];
    
    // Act
    act(() => {
      result.current.handleMultiSelectChange(sectionId, option, true, initialValues);
    });
    
    // Assert
    expect(result.current.selectedMultiSections[sectionId]).toEqual(["Option 1"]);
  });

  it("should remove an option when checked is false", () => {
    // Arrange
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    const sectionId = "section1";
    const option = "Option 1";
    const initialValues = ["Option 1", "Option 2"];
    
    // Act - first add the options to the state
    act(() => {
      result.current.setSelectedMultiSections({
        ...result.current.selectedMultiSections,
        [sectionId]: initialValues
      });
    });
    
    // Act - then remove one option
    act(() => {
      result.current.handleMultiSelectChange(sectionId, option, false, initialValues);
    });
    
    // Assert
    expect(result.current.selectedMultiSections[sectionId]).toEqual(["Option 2"]);
  });

  it("should handle multiple options being added to the same section", () => {
    // Arrange
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    const sectionId = "section1";
    
    // Act - add first option
    act(() => {
      result.current.handleMultiSelectChange(sectionId, "Option 1", true, []);
    });
    
    // Act - add second option
    act(() => {
      result.current.handleMultiSelectChange(sectionId, "Option 2", true, ["Option 1"]);
    });
    
    // Assert
    expect(result.current.selectedMultiSections[sectionId]).toEqual(["Option 1", "Option 2"]);
  });

  it("should handle multiple sections independently", () => {
    // Arrange
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    
    // Act - add option to first section
    act(() => {
      result.current.handleMultiSelectChange("section1", "Option 1", true, []);
    });
    
    // Act - add option to second section
    act(() => {
      result.current.handleMultiSelectChange("section2", "Option A", true, []);
    });
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual({
      section1: ["Option 1"],
      section2: ["Option A"]
    });
  });

  it("should return the updated values from handleMultiSelectChange", () => {
    // Arrange
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    const sectionId = "section1";
    const option = "Option 1";
    const initialValues: string[] = [];
    
    // Act
    let returnedValue: string[] = [];
    act(() => {
      returnedValue = result.current.handleMultiSelectChange(sectionId, option, true, initialValues);
    });
    
    // Assert
    expect(returnedValue).toEqual(["Option 1"]);
  });

  it("should correctly update state using setSelectedMultiSections", () => {
    // Arrange
    const { result } = renderHook(() => useMultiSelectState(mockTemplate));
    const newState = {
      section1: ["Option 1", "Option 3"],
      section2: ["Option B"]
    };
    
    // Act
    act(() => {
      result.current.setSelectedMultiSections(newState);
    });
    
    // Assert
    expect(result.current.selectedMultiSections).toEqual(newState);
  });
});
