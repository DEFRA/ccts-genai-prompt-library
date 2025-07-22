import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTemplateSelection } from "../useTemplateSelection";
import { Template } from "../../types";

describe("useTemplateSelection", () => {
  // Mock templates for testing
  const mockTemplates: Template[] = [
    { id: "1", name: "Template A", content: "Content A", role: "role1", expertise: "beginner" },
    { id: "2", name: "Template B", content: "Content B", role: "role1", expertise: "advanced" },
    { id: "3", name: "Template C", content: "Content C", role: "role2", expertise: "beginner" },
    { id: "4", name: "Template D", content: "Content D", role: "role2", expertise: "advanced" }
  ];

  // Spy on console.log to verify logging behavior
  const consoleLogSpy = vi.spyOn(console, "log");

  beforeEach(() => {
    // Clear the spy before each test
    consoleLogSpy.mockClear();
  });

  it("should initialize with empty filtered templates", () => {
    // Arrange & Act
    const { result } = renderHook(() => useTemplateSelection(mockTemplates));
    
    // Assert
    expect(result.current.filteredTemplates).toEqual([]);
  });

  it("should return empty array when roleId is empty", () => {
    // Arrange
    const { result } = renderHook(() => useTemplateSelection(mockTemplates));
    
    // Act
    act(() => {
      result.current.updateFilteredTemplates("", "beginner");
    });
    
    // Assert
    expect(result.current.filteredTemplates).toEqual([]);
  });

  it("should filter templates by roleId only when expertise is empty", () => {
    // Arrange
    const { result } = renderHook(() => useTemplateSelection(mockTemplates));
    
    // Act
    act(() => {
      result.current.updateFilteredTemplates("role1", "");
    });
    
    // Assert
    expect(result.current.filteredTemplates).toHaveLength(2);
    expect(result.current.filteredTemplates[0].id).toBe("1"); // Template A
    expect(result.current.filteredTemplates[1].id).toBe("2"); // Template B
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Filtering templates:", 
      { roleId: "role1", expertise: "", filtered: expect.any(Array) }
    );
  });

  it("should filter templates by both roleId and expertise", () => {
    // Arrange
    const { result } = renderHook(() => useTemplateSelection(mockTemplates));
    
    // Act
    act(() => {
      result.current.updateFilteredTemplates("role1", "advanced");
    });
    
    // Assert
    expect(result.current.filteredTemplates).toHaveLength(1);
    expect(result.current.filteredTemplates[0].id).toBe("2"); // Template B
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Filtering templates:", 
      { roleId: "role1", expertise: "advanced", filtered: expect.any(Array) }
    );
  });

  it("should sort filtered templates alphabetically by name", () => {
    // Arrange
    const unsortedTemplates: Template[] = [
      { id: "1", name: "Z Template", content: "Content Z", role: "role1", expertise: "beginner" },
      { id: "2", name: "A Template", content: "Content A", role: "role1", expertise: "beginner" }
    ];
    
    const { result } = renderHook(() => useTemplateSelection(unsortedTemplates));
    
    // Act
    act(() => {
      result.current.updateFilteredTemplates("role1", "beginner");
    });
    
    // Assert
    expect(result.current.filteredTemplates).toHaveLength(2);
    expect(result.current.filteredTemplates[0].name).toBe("A Template");
    expect(result.current.filteredTemplates[1].name).toBe("Z Template");
  });

  it("should update filtered templates when the hook re-renders with new allTemplates", () => {
    // Arrange
    const { result, rerender } = renderHook(
      ({ templates }) => useTemplateSelection(templates),
      {
        initialProps: { templates: mockTemplates }
      }
    );
    
    // Act - Initial filter
    act(() => {
      result.current.updateFilteredTemplates("role1", "beginner");
    });
    
    // Assert - Initial state
    expect(result.current.filteredTemplates).toHaveLength(1);
    
    // Act - Update with new templates
    const newMockTemplates = [
      ...mockTemplates,
      { id: "5", name: "Template E", content: "Content E", role: "role1", expertise: "beginner" }
    ];
    
    rerender({ templates: newMockTemplates });
    
    // Re-apply filter
    act(() => {
      result.current.updateFilteredTemplates("role1", "beginner");
    });
    
    // Assert - New state
    expect(result.current.filteredTemplates).toHaveLength(2);
    expect(result.current.filteredTemplates.map(t => t.id)).toContain("5");
  });
});
