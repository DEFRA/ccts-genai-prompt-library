import { create} from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { Role } from "../types";
import { generateId } from "../utils/generateId";
import toast from "react-hot-toast";

const DEBUG = true;
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log("[RoleStore]", ...args);
  }
};

const subscribers = new Set<(roleId: string | null) => void>();
debug("Initializing subscribers set");

const isDuplicateRole = (name: string, roles: Role[]): boolean => {
  debug("Checking for duplicate role:", name);
  return roles.some((r) => r.name.toLowerCase() === name.toLowerCase());
};

const createNewRole = (
  roleData: Pick<Role, "name" | "description" | "expertise">,
  isDefault = false
): Role => {
  debug("Creating new role:", roleData);
  return {
    id: generateId(),
    ...roleData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault,
  };
};

export interface RoleState {
  roles: Role[];
  userRoles: Role[];
  defaultRoles: Role[];
  selectedRole: Role | null;
  modalSelectedRole: Role | null;
  isInitialized: boolean;
  initializeDefaultRoles: (roles: Role[]) => void;
  setSelectedRole: (role: Role | null) => void;
  addRole: (
    roleData: Pick<Role, "name" | "description" | "expertise">
  ) => Promise<Role | null>;
  getAllRoles: () => Role[];
  setModalSelectedRole: (role: Role | null) => void;
  clearModalRole: () => void;
  resetDefaultRoles: () => void;
  importRoles: (
    roles: Role[],
    override?: boolean
  ) => Promise<{
    imported: { name: string }[];
    skipped: { name: string; reason: string }[];
  }>;
  deleteRole: (roleId: string) => Promise<boolean>;
  updateRole: (role: Role) => Promise<Role | null>;
  resetRoles: () => void;
  subscribeToRoleChanges: (
    callback: (roleId: string | null) => void
  ) => () => void;
}

export const useRoleStore = create<RoleState>()(
  devtools(
    persist(
      (set, get) => ({
        roles: [],
        userRoles: [],
        defaultRoles: [],
        selectedRole: null,
        modalSelectedRole: null,
        isInitialized: false,

        initializeDefaultRoles: (roles) => {
          debug("Initializing default roles:", roles.length);
          const state = get();

          if (!state.isInitialized) {
            const combinedRoles = [...roles, ...state.userRoles];
            set({
              defaultRoles: roles,
              roles: combinedRoles,
              isInitialized: true,
            });
            debug("Roles initialized:", combinedRoles.length);
          } else {
            debug("Roles already initialized, skipping");
          }
        },

        setSelectedRole: (role) => {
          debug("Setting selected role:", role?.id);
          set({ selectedRole: role });
          subscribers.forEach((callback) => callback(role?.id || null));
        },

        addRole: async (roleData) => {
          debug("Adding new role:", roleData);
          const state = get();
          const allRoles = [...state.defaultRoles, ...state.userRoles];
          if (isDuplicateRole(roleData.name, allRoles)) {
            debug("Duplicate role found:", roleData.name);
            toast.error(`Role with name "${roleData.name}" already exists`);
            return null;
          }
          const newRole = createNewRole(roleData);
          set((state) => ({
            userRoles: [...state.userRoles, newRole],
            roles: [...state.defaultRoles, ...state.userRoles, newRole],
          }));
          return newRole;
        },

        getAllRoles: () => {
          debug("Getting all roles");
          const state = get();
          return [...state.defaultRoles, ...state.userRoles];
        },

        setModalSelectedRole: (role) => {
          debug("Setting modal selected role:", role?.id);
          set({ modalSelectedRole: role });
        },

        clearModalRole: () => {
          debug("Clearing modal role");
          set({ modalSelectedRole: null });
        },

        resetDefaultRoles: () => {
          debug("Resetting default roles");
          const state = get();
          set({ defaultRoles: [...state.defaultRoles] });
        },

        importRoles: async (roles, override = false) => {
          const state = get();
          const allExistingRoles = [...state.defaultRoles, ...state.userRoles];
          const imported: { name: string }[] = [];
          const skipped: { name: string; reason: string }[] = [];

          const newRoles = roles
            .filter((role) => {
              if (isDuplicateRole(role.name, allExistingRoles)) {
                skipped.push({
                  name: role.name,
                  reason: "Role already exists",
                });
                return false;
              }
              imported.push({ name: role.name });
              return true;
            })
            .map((role) =>
              createNewRole({
                name: role.name,
                description: role.description,
                expertise: role.expertise,
              })
            );

          if (newRoles.length > 0) {
            set((state) => ({
              userRoles: [...state.userRoles, ...newRoles],
            }));
          }

          return { imported, skipped };
        },

        deleteRole: async (roleId) => {
          const state = get();
          const isUserRole = state.userRoles.some((r) => r.id === roleId);
          const isDefaultRole = state.defaultRoles.some((r) => r.id === roleId);

          if (!isUserRole && !isDefaultRole) {
            toast.error("Role not found");
            return false;
          }

          set((state) => ({
            userRoles: state.userRoles.filter((r) => r.id !== roleId),
            defaultRoles: state.defaultRoles.filter((r) => r.id !== roleId),
            selectedRole:
              state.selectedRole?.id === roleId ? null : state.selectedRole,
            modalSelectedRole:
              state.modalSelectedRole?.id === roleId
                ? null
                : state.modalSelectedRole,
          }));

          return true;
        },

        updateRole: async (role) => {
          const state = get();
          const existingUserRole = state.userRoles.find(
            (r) => r.id === role.id
          );
          const existingDefaultRole = state.defaultRoles.find(
            (r) => r.id === role.id
          );

          if (!existingUserRole && !existingDefaultRole) {
            toast.error("Role not found");
            return null;
          }

          const updatedRole = {
            ...role,
            updatedAt: new Date().toISOString(),
            isDefault: !!existingDefaultRole,
          };

          if (existingDefaultRole) {
            set((state) => ({
              defaultRoles: state.defaultRoles.map((r) =>
                r.id === role.id ? updatedRole : r
              ),
              roles: [
                ...state.userRoles,
                ...state.defaultRoles.map((r) =>
                  r.id === role.id ? updatedRole : r
                ),
              ],
              modalSelectedRole: updatedRole,
            }));
          } else {
            set((state) => ({
              userRoles: state.userRoles.map((r) =>
                r.id === role.id ? updatedRole : r
              ),
              roles: [
                ...state.userRoles.map((r) =>
                  r.id === role.id ? updatedRole : r
                ),
                ...state.defaultRoles,
              ],
              modalSelectedRole: updatedRole,
            }));
          }

          return updatedRole;
        },

        resetRoles: () =>
          set({
            defaultRoles: [],
            userRoles: [],
            selectedRole: null,
            modalSelectedRole: null,
            isInitialized: false,
          }),

        subscribeToRoleChanges: (callback) => {
          subscribers.add(callback);
          return () => subscribers.delete(callback);
        },
      }),
      {
        name: "prompt-laibrary-roles",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          userRoles: state.userRoles,
          defaultRoles: state.defaultRoles,
          isInitialized: state.isInitialized,
        }),
      }
    ),
    { name: "role-store", enabled: process.env.NODE_ENV === "development" }
  )
);
