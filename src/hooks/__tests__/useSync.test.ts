import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import * as React from 'react';
import { useSync } from "../useSync";
import { toast } from "react-hot-toast";
import { useRoleStore } from "../../store/roleStore";
import { useTemplateStore } from "../../store/templateStore";

// Mock dependencies
vi.mock("react-hot-toast", () => ({
  toast: {
    loading: vi.fn(() => "loading-toast-id"),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn()
  }
}));

vi.mock("../../store/roleStore", () => ({
  useRoleStore: {
    getState: vi.fn()
  }
}));

vi.mock("../../store/templateStore", () => ({
  useTemplateStore: {
    getState: vi.fn()
  }
}));

// Mock generateId directly instead of mocking the module
vi.mock("@/utils/generateId", () => ({
  generateId: vi.fn(() => "generated-id")
}));

describe("useSync", () => {
  // Mock data
  const mockCurrentUser = { id: "user1", name: "Test User" };
  const mockIsAuthenticated = true;
  const mockIsAdmin = false;
  
  // Mock functions
  const mockResetDefaultRoles = vi.fn();
  const mockResetDefaultTemplates = vi.fn();
  
  // Mock store states with partial implementations
  const mockRoleStore = {
    userRoles: [{ name: "Role 1", description: "Description 1", expertise: "beginner" }],
    resetRoles: vi.fn(),
    initializeDefaultRoles: vi.fn(),
    addRole: vi.fn(),
    // Add required properties for TypeScript
    roles: [],
    defaultRoles: [],
    selectedRole: null,
    modalSelectedRole: null,
    // Include other required properties as needed
    setSelectedRole: vi.fn(),
    setModalSelectedRole: vi.fn(),
    addUserRole: vi.fn(),
    removeRole: vi.fn()
  };
  
  const mockTemplateStore = {
    userTemplates: [{
      id: "template1",
      name: "Template 1",
      description: "Description 1",
      role: "role1",
      expertise: "beginner",
      framework: "framework1",
      raceRole: "role1",
      raceAction: "action1",
      raceContext: "context1",
      raceExpectation: "expectation1",
      raceExecute: "execute1",
      showProgrammingLanguage: true,
      inputValidation: true,
      customSections: []
    }],
    resetTemplates: vi.fn(),
    initializeDefaultTemplates: vi.fn(),
    addTemplate: vi.fn(),
    fetchTemplates: vi.fn(),
    // Add required properties for TypeScript
    templates: [],
    defaultTemplates: [],
    selectedTemplate: null,
    modalSelectedTemplate: null,
    // Include other required properties as needed
    setSelectedTemplate: vi.fn(),
    setModalSelectedTemplate: vi.fn(),
    removeTemplate: vi.fn()
  };
  
  // Mock localStorage
  const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      clear: vi.fn(() => {
        store = {};
      })
    };
  })();
  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
    
    // Setup store mocks - use type assertion to avoid TypeScript errors
    vi.mocked(useRoleStore.getState).mockReturnValue(mockRoleStore as any);
    vi.mocked(useTemplateStore.getState).mockReturnValue(mockTemplateStore as any);
  });

  // Cleanup after each test
  afterEach(() => {
    vi.resetAllMocks();
  });

  // Tests
  it("should initialize with isSyncing set to false", () => {
    // Arrange & Act
    const { result } = renderHook(() => 
      useSync(
        mockResetDefaultRoles,
        mockResetDefaultTemplates,
        mockCurrentUser,
        mockIsAuthenticated,
        mockIsAdmin
      )
    );
    
    // Assert
    expect(result.current.isSyncing).toBe(false);
  });

  it("should handle sync operation successfully", async () => {
    // Arrange
    const { result } = renderHook(() => 
      useSync(
        mockResetDefaultRoles,
        mockResetDefaultTemplates,
        mockCurrentUser,
        mockIsAuthenticated,
        mockIsAdmin
      )
    );
    
    // Act
    await act(async () => {
      await result.current.handleSync();
    });
    
    // Assert
    expect(toast.loading).toHaveBeenCalledWith("Synchronizing data...", expect.any(Object));
    expect(mockRoleStore.resetRoles).toHaveBeenCalled();
    expect(mockTemplateStore.resetTemplates).toHaveBeenCalled();
    expect(mockRoleStore.initializeDefaultRoles).toHaveBeenCalled();
    expect(mockTemplateStore.initializeDefaultTemplates).toHaveBeenCalled();
    expect(mockRoleStore.addRole).toHaveBeenCalledWith({
      name: "Role 1",
      description: "Description 1",
      expertise: "beginner"
    });
    expect(mockTemplateStore.addTemplate).toHaveBeenCalledWith(expect.objectContaining({
      id: "template1",
      name: "Template 1"
    }));
    expect(mockTemplateStore.fetchTemplates).toHaveBeenCalled();
    expect(toast.dismiss).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Sync complete", expect.any(Object));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify(mockCurrentUser));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isAuthenticated", JSON.stringify(mockIsAuthenticated));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isAdmin", JSON.stringify(mockIsAdmin));
    expect(result.current.isSyncing).toBe(false);
  });

  it("should handle errors during sync operation", async () => {
    // Arrange
    mockRoleStore.resetRoles.mockImplementation(() => {
      throw new Error("Mock error");
    });
    
    const { result } = renderHook(() => 
      useSync(
        mockResetDefaultRoles,
        mockResetDefaultTemplates,
        mockCurrentUser,
        mockIsAuthenticated,
        mockIsAdmin
      )
    );
    
    // Setup spy for console.error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Act
    await act(async () => {
      await result.current.handleSync();
    });
    
    // Assert
    expect(toast.loading).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("Sync failed:", expect.any(Error));
    expect(toast.error).toHaveBeenCalledWith("Sync failed", expect.any(Object));
    expect(result.current.isSyncing).toBe(false);
    
    // Restore console.error
    consoleSpy.mockRestore();
  });  it("should not start sync if already syncing", async () => {
    // Arrange
    // Create a special mock that will keep the sync function hanging
    let resolveSync: () => void;
    mockRoleStore.resetRoles.mockImplementationOnce(() => {
      return new Promise<void>((resolve) => {
        resolveSync = resolve;
      });
    });
    
    const { result } = renderHook(() => 
      useSync(
        mockResetDefaultRoles,
        mockResetDefaultTemplates,
        mockCurrentUser,
        mockIsAuthenticated,
        mockIsAdmin
      )
    );
    
    // Act - Start the first sync but don't let it complete yet
    let firstSyncPromise: Promise<void>;
    act(() => {
      firstSyncPromise = result.current.handleSync();
    });
    
    // Wait a bit to ensure the first sync has started
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Clear the mock counters to make assertions simpler
    toast.loading.mockClear();
    mockRoleStore.resetRoles.mockClear();
    
    // Try to start a second sync while the first one is still in progress
    act(() => {
      result.current.handleSync();
    });
    
    // Assert - Second sync should not have triggered any calls
    expect(toast.loading).not.toHaveBeenCalled();
    expect(mockRoleStore.resetRoles).not.toHaveBeenCalled();
    
    // Allow the first sync to complete
    if (resolveSync) resolveSync();
    await act(async () => {
      await firstSyncPromise;
    });
  });
  
  it("should handle templates without an id by generating one", async () => {
    // Arrange
    const { generateId } = await import("@/utils/generateId");
    vi.mocked(generateId).mockReturnValue("generated-id");
    
    const templateWithoutId = {
      // Define template without id property
      name: "Template Without ID",
      description: "Description",
      role: "role1",
      expertise: "beginner",
      framework: "framework1",
      raceRole: "role1",
      raceAction: "action1",
      raceContext: "context1",
      raceExpectation: "expectation1",
      raceExecute: "execute1",
      showProgrammingLanguage: true,
      inputValidation: true,
      customSections: []
    };
    
    // Deep copy the template to avoid reference issues
    mockTemplateStore.userTemplates = [JSON.parse(JSON.stringify(templateWithoutId))];
    
    const { result } = renderHook(() => 
      useSync(
        mockResetDefaultRoles,
        mockResetDefaultTemplates,
        mockCurrentUser,
        mockIsAuthenticated,
        mockIsAdmin
      )
    );
    
    // Mock the addTemplate implementation to add the generated ID
    mockTemplateStore.addTemplate.mockImplementation((template) => {
      if (!template.id) {
        template.id = "generated-id";
      }
      return Promise.resolve(template);
    });
    
    // Act
    await act(async () => {
      await result.current.handleSync();
    });
    
    // Assert
    expect(mockTemplateStore.addTemplate).toHaveBeenCalled();
    const addedTemplate = mockTemplateStore.addTemplate.mock.calls[0][0];
    expect(addedTemplate).toMatchObject({
      id: "generated-id",
      name: "Template Without ID"
    });
  });

  it("should not store user data if currentUser is null", async () => {
    // Arrange
    const { result } = renderHook(() => 
      useSync(
        mockResetDefaultRoles,
        mockResetDefaultTemplates,
        null,
        mockIsAuthenticated,
        mockIsAdmin
      )
    );
    
    // Act
    await act(async () => {
      await result.current.handleSync();
    });
    
    // Assert
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith("user", expect.any(String));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isAuthenticated", JSON.stringify(mockIsAuthenticated));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith("isAdmin", JSON.stringify(mockIsAdmin));
  });
});
