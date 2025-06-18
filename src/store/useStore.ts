import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Prompt, Template, Role, AuthResponse } from "../types";
import authService from "../services/authService";
import { useRoleStore } from "./roleStore";

interface StoreState {
  isCreateModalOpen: boolean;
  isManageModalOpen: boolean;
  isViewTemplateModalOpen: boolean;
  initialRoleId: string | null;

  toggleCreateModal: () => void;
  toggleManageModal: () => void;
  toggleViewTemplateModal: () => void;

  selectedTemplate: Template | null;
  selectedTemplateForPrompt: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  setSelectedTemplateForPrompt: (template: Template | null) => void;
  deleteTemplate: (id: string) => Promise<void>;

  addRole: (role: Role) => Promise<void>;
  updateRole: (role: Role) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  setInitialRoleId: (id: string) => void;

  prompts: Prompt[];
  addPrompt: (prompt: Prompt) => Promise<void>;
  selectedPrompt: Prompt | null;
  setSelectedPrompt: (prompt: Prompt | null) => void;

  modalMode: string;
  setModalMode: (mode: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  currentUser: any;
  isAdmin: boolean;

  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;

  isLogoClicked: boolean;
  toggleLogoClick: (state?: boolean) => void;

  isEnhanceModalOpen: boolean;
  enhanceModalContent: string;
  openEnhanceModal: () => void;
  closeEnhanceModal: () => void;
  setEnhanceModalContent: (
    content: string | ((prev: string) => string)
  ) => void;
}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => {
        useRoleStore.getState().subscribeToRoleChanges((roleId) => {
          if (get().selectedRole !== roleId) {
            set({ selectedRole: roleId || "" });
          }
        });

        return {
          isCreateModalOpen: false,
          isManageModalOpen: false,
          isViewTemplateModalOpen: false,
          initialRoleId: null,

          toggleCreateModal: () =>
            set((state) => ({ isCreateModalOpen: !state.isCreateModalOpen })),
          toggleManageModal: () =>
            set((state) => ({ isManageModalOpen: !state.isManageModalOpen })),
          toggleViewTemplateModal: () =>
            set((state) => ({
              isViewTemplateModalOpen: !state.isViewTemplateModalOpen,
            })),

          selectedTemplate: null,
          selectedTemplateForPrompt: null,
          setSelectedTemplate: (template) =>
            set({ selectedTemplate: template }),
          setSelectedTemplateForPrompt: (template) =>
            set({ selectedTemplateForPrompt: template }),
          deleteTemplate: async (id) => {},

          addRole: async (role) => {
            const { addRole: addRoleToStore } = useRoleStore.getState();
            try {
              const newRole = await addRoleToStore({
                name: role.name,
                description: role.description,
                expertise: role.expertise,
              });
              if (newRole) {
                set((state) => ({
                  ...state,
                  selectedRole: newRole.id,
                }));
              }
            } catch (error) {
              console.error("Failed to add role:", error);
              throw error;
            }
          },
          updateRole: async (role) => {
            const { updateRole: updateRoleInStore } = useRoleStore.getState();
            try {
              const updatedRole = await updateRoleInStore(role);
              if (updatedRole) {
                set((state) => ({
                  ...state,
                  selectedRole: updatedRole.id,
                }));
              }
            } catch (error) {
              console.error("Failed to update role:", error);
              throw error;
            }
          },
          deleteRole: async (id) => {
            const { deleteRole: deleteRoleFromStore } = useRoleStore.getState();
            try {
              const success = await deleteRoleFromStore(id);
              if (success) {
                set((state) => ({
                  ...state,
                  selectedRole:
                    state.selectedRole === id ? "" : state.selectedRole,
                }));
              }
            } catch (error) {
              console.error("Failed to delete role:", error);
              throw error;
            }
          },
          selectedRole: "",
          setSelectedRole: (role) => {
            set({ selectedRole: role });
            try {
              const { getAllRoles, setSelectedRole: setRoleStoreSelectedRole } =
                useRoleStore.getState();
              const allRoles = getAllRoles();
              const roleObj = allRoles.find((r) => r.id === role);
              setRoleStoreSelectedRole(roleObj || null);
            } catch (error) {
              console.error("Failed to set selected role:", error);
            }
          },
          setInitialRoleId: (id) => {
            set({ selectedRole: id });
            try {
              const { getAllRoles, setSelectedRole: setRoleStoreSelectedRole } =
                useRoleStore.getState();
              const allRoles = getAllRoles();
              const roleObj = allRoles.find((r) => r.id === id);
              setRoleStoreSelectedRole(roleObj || null);
            } catch (error) {
              console.error("Failed to set initial role:", error);
            }
          },

          prompts: [],
          addPrompt: async (prompt) => {},
          selectedPrompt: null,
          setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

          modalMode: "create",
          setModalMode: (mode) => set({ modalMode: mode }),
          searchTerm: "",
          setSearchTerm: (term) => set({ searchTerm: term }),

          currentUser: null,
          isAdmin: false,

          isAuthenticated: !!authService.getUser(),
          login: async (
            username: string,
            password: string
          ): Promise<AuthResponse> => {
            const response = await authService.login(username, password);
            if (response?.user) {
              set({
                isAuthenticated: true,
                currentUser: response.user,
                isAdmin: response.user.role === "admin",
              });
            }
            return {
              success: !!response.user,
              user: response.user,
              token: response.token,
            };
          },
          logout: () => {
            authService.logout();
            set({
              isAuthenticated: false,
              currentUser: null,
              isAdmin: false,
              isLogoClicked: false,
            });
          },

          isLogoClicked: false,
          toggleLogoClick: (state?: boolean) =>
            set((current) => ({
              isLogoClicked:
                state ?? !current.isLogoClicked,
            })),

          isEnhanceModalOpen: false,
          enhanceModalContent: "",

          openEnhanceModal: () => set({ isEnhanceModalOpen: true }),
          closeEnhanceModal: () => set({ isEnhanceModalOpen: false }),
          setEnhanceModalContent: (content) =>
            set((state) => ({
              enhanceModalContent:
                typeof content === "function"
                  ? content(state.enhanceModalContent)
                  : content,
            })),
        };
      },
      {
        name: "auth-storage",
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          currentUser: state.currentUser,
          isAdmin: state.isAdmin,
          isLogoClicked: state.isLogoClicked,
        }),
      }
    ),
    { name: "main-store", enabled: process.env.NODE_ENV === "development" }
  )
);
