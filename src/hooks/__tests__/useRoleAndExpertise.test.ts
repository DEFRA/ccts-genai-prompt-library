import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRoleAndExpertise } from "../useRoleAndExpertise";
import { Role } from "../../types";

describe("useRoleAndExpertise", () => {
  // Mock data
  const mockRoles: Role[] = [
    {
      id: "role1",
      name: "Role 1",
      description: "Description 1",
      expertise: ["beginner", "intermediate", "advanced"]
    },
    {
      id: "role2",
      name: "Role 2",
      description: "Description 2",
      expertise: ["novice", "expert"]
    }
  ];

  it("should initialize with empty selections", () => {
    // Arrange & Act
    const { result } = renderHook(() => useRoleAndExpertise({ roles: mockRoles }));
    
    // Assert
    expect(result.current.selectedRole).toBe("");
    expect(result.current.selectedExpertise).toBe("");
    expect(result.current.expertiseOptions).toEqual([]);
  });

  it("should update selectedRole when setSelectedRole is called", () => {
    // Arrange
    const { result } = renderHook(() => useRoleAndExpertise({ roles: mockRoles }));
    
    // Act
    act(() => {
      result.current.setSelectedRole("role1");
    });
    
    // Assert
    expect(result.current.selectedRole).toBe("role1");
    expect(result.current.expertiseOptions).toEqual(["beginner", "intermediate", "advanced"]);
  });

  it("should update selectedExpertise when setSelectedExpertise is called", () => {
    // Arrange
    const { result } = renderHook(() => useRoleAndExpertise({ roles: mockRoles }));
    
    // Act
    act(() => {
      result.current.setSelectedExpertise("advanced");
    });
    
    // Assert
    expect(result.current.selectedExpertise).toBe("advanced");
  });

  it("should update expertiseOptions when selectedRole changes", () => {
    // Arrange
    const { result } = renderHook(() => useRoleAndExpertise({ roles: mockRoles }));
    
    // Act - Set role1 first
    act(() => {
      result.current.setSelectedRole("role1");
    });
    
    // Assert
    expect(result.current.expertiseOptions).toEqual(["beginner", "intermediate", "advanced"]);
    
    // Act - Change to role2
    act(() => {
      result.current.setSelectedRole("role2");
    });
    
    // Assert
    expect(result.current.expertiseOptions).toEqual(["novice", "expert"]);
  });

  it("should handle role not found in roles array", () => {
    // Arrange
    const { result } = renderHook(() => useRoleAndExpertise({ roles: mockRoles }));
    
    // Act
    act(() => {
      result.current.setSelectedRole("nonexistent-role");
    });
    
    // Assert - Should return empty array when role not found
    expect(result.current.expertiseOptions).toEqual([]);
  });

  it("should handle empty roles array", () => {
    // Arrange
    const { result } = renderHook(() => useRoleAndExpertise({ roles: [] }));
    
    // Act
    act(() => {
      result.current.setSelectedRole("role1");
    });
    
    // Assert
    expect(result.current.expertiseOptions).toEqual([]);
  });

  it("should reset expertiseOptions when selectedRole is cleared", () => {
    // Arrange
    const { result } = renderHook(() => useRoleAndExpertise({ roles: mockRoles }));
    
    // Act - Set a role first
    act(() => {
      result.current.setSelectedRole("role1");
    });
    
    // Assert
    expect(result.current.expertiseOptions).toEqual(["beginner", "intermediate", "advanced"]);
    
    // Act - Clear the role
    act(() => {
      result.current.setSelectedRole("");
    });
    
    // Assert
    expect(result.current.expertiseOptions).toEqual([]);
  });
});
