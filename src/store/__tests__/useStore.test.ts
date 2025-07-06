import { describe, it, expect, vi, beforeEach } from "vitest";
import { useStore } from "../useStore"; // Adjusted relative path
import authService from "../../services/authService";
import { useRoleStore } from "../roleStore";

// Mock authService with a default export and named exports
vi.mock("../../services/authService", () => ({
    default: {
        login: vi.fn(),
        logout: vi.fn(),
        getUser: vi.fn(() => null),
    },
    login: vi.fn(),
    logout: vi.fn(),
    getUser: vi.fn(() => null),
}));

// Mock useRoleStore
vi.mock("../roleStore", () => ({
    useRoleStore: {
        getState: vi.fn(() => ({
            subscribeToRoleChanges: vi.fn(), // Mocked method
            addRole: vi.fn(),
            updateRole: vi.fn(),
            deleteRole: vi.fn(),
            getAllRoles: vi.fn(() => []),
            setSelectedRole: vi.fn(),
        })),
    },
}));

describe("useStore", () => {
    let store: any;

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the store state using the imported useStore
        useStore.setState({
            isAuthenticated: false,
            currentUser: null,
            isAdmin: false,
        });
        // Ensure roleStore mock always returns expected structure
        useRoleStore.getState = vi.fn(() => ({
            subscribeToRoleChanges: vi.fn(),
            addRole: vi.fn(),
            updateRole: vi.fn(),
            deleteRole: vi.fn(),
            getAllRoles: vi.fn(() => []),
            setSelectedRole: vi.fn(),
        }));
        store = useStore.getState();
    });

    it("should initialize state correctly", () => {
        expect(store.isCreateModalOpen).toBe(false);
        expect(store.isManageModalOpen).toBe(false);
        expect(store.isViewTemplateModalOpen).toBe(false);
        expect(store.initialRoleId).toBe(null);
        expect(store.selectedTemplate).toBe(null);
        expect(store.selectedTemplateForPrompt).toBe(null);
        expect(store.selectedRole).toBe("");
        expect(store.prompts).toEqual([]);
        expect(store.selectedPrompt).toBe(null);
        expect(store.modalMode).toBe("create");
        expect(store.searchTerm).toBe("");
        expect(store.currentUser).toBe(null);
        expect(store.isAdmin).toBe(false);
        expect(store.isAuthenticated).toBe(false);
        expect(store.isLogoClicked).toBe(false);
        expect(store.isEnhanceModalOpen).toBe(false);
        expect(store.enhanceModalContent).toBe("");
    });

    it("should toggle isCreateModalOpen state", () => {
        store.toggleCreateModal();
        expect(useStore.getState().isCreateModalOpen).toBe(true);

        store.toggleCreateModal();
        expect(useStore.getState().isCreateModalOpen).toBe(false);
    });

    it("should toggle isManageModalOpen state", () => {
        store.toggleManageModal();
        expect(useStore.getState().isManageModalOpen).toBe(true);

        store.toggleManageModal();
        expect(useStore.getState().isManageModalOpen).toBe(false);
    });

    it("should toggle isViewTemplateModalOpen state", () => {
        store.toggleViewTemplateModal();
        expect(useStore.getState().isViewTemplateModalOpen).toBe(true);

        store.toggleViewTemplateModal();
        expect(useStore.getState().isViewTemplateModalOpen).toBe(false);
    });

    it("should update initialRoleId", () => {
        store.setInitialRoleId("role123");
        expect(useStore.getState().selectedRole).toBe("role123");
    });

    it("should set selected template", () => {
        const template = { id: "1", name: "Test Template" } as any;
        store.setSelectedTemplate(template);
        expect(useStore.getState().selectedTemplate).toBe(template);
    });

    it("should set selected template for prompt", () => {
        const template = { id: "1", name: "Test Template" } as any;
        store.setSelectedTemplateForPrompt(template);
        expect(useStore.getState().selectedTemplateForPrompt).toBe(template);
    });

    it("should handle delete template", async () => {
        // The deleteTemplate function is currently empty, but we should test it doesn't throw
        await expect(store.deleteTemplate("template123")).resolves.toBeUndefined();
    });

    it("should set selected prompt", () => {
        const prompt = { id: "1", title: "Test Prompt" } as any;
        store.setSelectedPrompt(prompt);
        expect(useStore.getState().selectedPrompt).toBe(prompt);
    });

    it("should handle add prompt", async () => {
        // The addPrompt function is currently empty, but we should test it doesn't throw
        const prompt = { id: "1", title: "Test Prompt" } as any;
        await expect(store.addPrompt(prompt)).resolves.toBeUndefined();
    });

    it("should set modal mode", () => {
        store.setModalMode("createTemplate");
        expect(useStore.getState().modalMode).toBe("createTemplate");
    });

    it("should set search term", () => {
        store.setSearchTerm("test search");
        expect(useStore.getState().searchTerm).toBe("test search");
    });

    it("should handle login successfully", async () => {
        const mockUser = { username: "test", role: "admin" };
        const mockResponse = { user: mockUser, token: "token123" };
        (authService.login as any).mockResolvedValue(mockResponse);

        const result = await store.login("test", "password");

        expect(result).toEqual({
            success: true,
            user: mockUser,
            token: "token123"
        });
        expect(useStore.getState().isAuthenticated).toBe(true);
        expect(useStore.getState().currentUser).toBe(mockUser);
        expect(useStore.getState().isAdmin).toBe(true);
    });

    it("should handle login failure", async () => {
        (authService.login as any).mockResolvedValue({ user: null, token: null });

        const result = await store.login("test", "password");

        expect(result).toEqual({
            success: false,
            user: null,
            token: null
        });
        // The store should be authenticated if getUser returns a user, otherwise false
        expect(useStore.getState().isAuthenticated).toBe(false);
    });

    it("should handle successful login", async () => {
        const mockUser = { id: '1', username: 'test', role: 'user' };
        (authService.login as any).mockResolvedValue({ user: mockUser, token: 'test-token' });

        const result = await store.login("test", "password");

        expect(result).toEqual({
            success: true,
            user: mockUser,
            token: 'test-token'
        });
        expect(useStore.getState().isAuthenticated).toBe(true);
        expect(useStore.getState().currentUser).toEqual(mockUser);
        expect(useStore.getState().isAdmin).toBe(false);
    });

    it("should handle logout", () => {
        // Set up authenticated state
        useStore.setState({
            isAuthenticated: true,
            currentUser: { username: "test" },
            isAdmin: true,
            isLogoClicked: true
        });

        store.logout();

        expect(authService.logout).toHaveBeenCalled();
        expect(useStore.getState().isAuthenticated).toBe(false);
        expect(useStore.getState().currentUser).toBe(null);
        expect(useStore.getState().isAdmin).toBe(false);
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should toggle logo click", () => {
        store.toggleLogoClick();
        expect(useStore.getState().isLogoClicked).toBe(true);

        store.toggleLogoClick();
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should toggle logo click with specific state", () => {
        store.toggleLogoClick(true);
        expect(useStore.getState().isLogoClicked).toBe(true);

        store.toggleLogoClick(false);
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should handle toggle logo click with explicit false when current state is true", () => {
        // Set initial state to true
        useStore.setState({ isLogoClicked: true });
        
        // Call with explicit false - this should test the nullish coalescing operator
        store.toggleLogoClick(false);
        expect(useStore.getState().isLogoClicked).toBe(false);
        
        // Call with explicit false again - should remain false
        store.toggleLogoClick(false);
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should handle toggle logo click with explicit false when current state is false", () => {
        // Set initial state to false
        useStore.setState({ isLogoClicked: false });
        
        // Call with explicit false - should remain false
        store.toggleLogoClick(false);
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should handle toggle logo click with undefined parameter", () => {
        // Set initial state to false
        useStore.setState({ isLogoClicked: false });
        
        // Call with undefined - should toggle to true (testing nullish coalescing)
        store.toggleLogoClick(undefined);
        expect(useStore.getState().isLogoClicked).toBe(true);
        
        // Call with undefined again - should toggle to false
        store.toggleLogoClick(undefined);
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should handle toggle logo click with null parameter", () => {
        // Set initial state to false
        useStore.setState({ isLogoClicked: false });
        
        // Call with null - should toggle to true (testing nullish coalescing)
        store.toggleLogoClick(null as any);
        expect(useStore.getState().isLogoClicked).toBe(true);
        
        // Call with null again - should toggle to false
        store.toggleLogoClick(null as any);
        expect(useStore.getState().isLogoClicked).toBe(false);
    });

    it("should open enhance modal", () => {
        store.openEnhanceModal();
        expect(useStore.getState().isEnhanceModalOpen).toBe(true);
    });

    it("should close enhance modal", () => {
        useStore.setState({ isEnhanceModalOpen: true });
        store.closeEnhanceModal();
        expect(useStore.getState().isEnhanceModalOpen).toBe(false);
    });

    it("should set enhance modal content with string", () => {
        store.setEnhanceModalContent("test content");
        expect(useStore.getState().enhanceModalContent).toBe("test content");
    });

    it("should set enhance modal content with function", () => {
        useStore.setState({ enhanceModalContent: "initial" });
        store.setEnhanceModalContent((prev) => prev + " updated");
        expect(useStore.getState().enhanceModalContent).toBe("initial updated");
    });

    it("should add role successfully", async () => {
        const mockRole = { id: "1", name: "Test Role" };
        const mockAddRole = vi.fn().mockResolvedValue(mockRole);
        (useRoleStore.getState as any).mockReturnValue({
            addRole: mockAddRole
        });

        const roleToAdd = { name: "Test Role", description: "Test", expertise: [] };
        await store.addRole(roleToAdd);

        expect(mockAddRole).toHaveBeenCalledWith(roleToAdd);
        expect(useStore.getState().selectedRole).toBe("1");
    });

    it("should handle add role error", async () => {
        const mockAddRole = vi.fn().mockRejectedValue(new Error("Add failed"));
        (useRoleStore.getState as any).mockReturnValue({
            addRole: mockAddRole
        });

        const roleToAdd = { name: "Test Role", description: "Test", expertise: [] };
        
        await expect(store.addRole(roleToAdd)).rejects.toThrow("Add failed");
    });

    it("should update role successfully", async () => {
        const mockRole = { id: "1", name: "Updated Role" };
        const mockUpdateRole = vi.fn().mockResolvedValue(mockRole);
        (useRoleStore.getState as any).mockReturnValue({
            updateRole: mockUpdateRole
        });

        const roleToUpdate = { id: "1", name: "Updated Role", description: "Test", expertise: [] };
        await store.updateRole(roleToUpdate);

        expect(mockUpdateRole).toHaveBeenCalledWith(roleToUpdate);
        expect(useStore.getState().selectedRole).toBe("1");
    });

    it("should handle update role error", async () => {
        const mockUpdateRole = vi.fn().mockRejectedValue(new Error("Update failed"));
        (useRoleStore.getState as any).mockReturnValue({
            updateRole: mockUpdateRole
        });

        const roleToUpdate = { id: "1", name: "Updated Role", description: "Test", expertise: [] };
        
        await expect(store.updateRole(roleToUpdate)).rejects.toThrow("Update failed");
    });

    it("should delete role successfully", async () => {
        const mockDeleteRole = vi.fn().mockResolvedValue(true);
        (useRoleStore.getState as any).mockReturnValue({
            deleteRole: mockDeleteRole
        });

        useStore.setState({ selectedRole: "1" });
        await store.deleteRole("1");

        expect(mockDeleteRole).toHaveBeenCalledWith("1");
        expect(useStore.getState().selectedRole).toBe("");
    });

    it("should handle delete role error", async () => {
        const mockDeleteRole = vi.fn().mockRejectedValue(new Error("Delete failed"));
        (useRoleStore.getState as any).mockReturnValue({
            deleteRole: mockDeleteRole
        });

        await expect(store.deleteRole("1")).rejects.toThrow("Delete failed");
    });

    it("should set selected role", () => {
        const mockGetAllRoles = vi.fn().mockReturnValue([
            { id: "1", name: "Role 1" },
            { id: "2", name: "Role 2" }
        ]);
        const mockSetSelectedRole = vi.fn();
        (useRoleStore.getState as any).mockReturnValue({
            getAllRoles: mockGetAllRoles,
            setSelectedRole: mockSetSelectedRole
        });

        store.setSelectedRole("2");

        expect(useStore.getState().selectedRole).toBe("2");
        expect(mockGetAllRoles).toHaveBeenCalled();
        expect(mockSetSelectedRole).toHaveBeenCalledWith({ id: "2", name: "Role 2" });
    });

    it("should handle set selected role error", () => {
        const mockGetAllRoles = vi.fn().mockImplementation(() => {
            throw new Error("Get roles failed");
        });
        (useRoleStore.getState as any).mockReturnValue({
            getAllRoles: mockGetAllRoles,
            setSelectedRole: vi.fn()
        });

        // Should not throw error, just log it
        expect(() => store.setSelectedRole("2")).not.toThrow();
    });

    it("should set initial role id", () => {
        const mockGetAllRoles = vi.fn().mockReturnValue([
            { id: "1", name: "Role 1" }
        ]);
        const mockSetSelectedRole = vi.fn();
        (useRoleStore.getState as any).mockReturnValue({
            getAllRoles: mockGetAllRoles,
            setSelectedRole: mockSetSelectedRole
        });

        store.setInitialRoleId("1");

        expect(useStore.getState().selectedRole).toBe("1");
        expect(mockGetAllRoles).toHaveBeenCalled();
        expect(mockSetSelectedRole).toHaveBeenCalledWith({ id: "1", name: "Role 1" });
    });

    it("should handle set initial role id error", () => {
        const mockGetAllRoles = vi.fn().mockImplementation(() => {
            throw new Error("Get roles failed");
        });
        (useRoleStore.getState as any).mockReturnValue({
            getAllRoles: mockGetAllRoles,
            setSelectedRole: vi.fn()
        });

        // Should not throw error, just log it
        expect(() => store.setInitialRoleId("1")).not.toThrow();
    });

    it("should mock authService methods", () => {
        authService.login("test", "password");
        expect(authService.login).toHaveBeenCalledWith("test", "password");

        authService.logout();
        expect(authService.logout).toHaveBeenCalled();

        const user = authService.getUser();
        expect(user).toBe(null);
    });

    it("should mock useRoleStore methods", () => {
        const roleStoreState = useRoleStore.getState();
        
        // Test that the mock returns the expected structure
        expect(roleStoreState).toBeDefined();
        expect(typeof roleStoreState.subscribeToRoleChanges).toBe('function');
        expect(typeof roleStoreState.addRole).toBe('function');
        expect(typeof roleStoreState.updateRole).toBe('function');
        expect(typeof roleStoreState.deleteRole).toBe('function');
        expect(typeof roleStoreState.getAllRoles).toBe('function');
        expect(typeof roleStoreState.setSelectedRole).toBe('function');
    });
});