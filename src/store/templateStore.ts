import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import { Template } from "../types";
import { generateId } from "../utils/generateId";
import toast from "react-hot-toast";
import { defaultTemplates } from "../data/defaultTemplates";
import { STORE_NAMES, DEVTOOLS_ENABLED } from "../config/storeConfig";

const DEBUG = true;
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log(...args);
  }
};

interface TemplateStore {
  templates: Template[];
  userTemplates: Template[];
  defaultTemplates: Template[];
  selectedTemplate: Template | null;
  modalSelectedTemplate: Template | null;
  isInitialized: boolean;
  isLoading: boolean;
  initializeTemplates: () => void;
  addTemplate: (
    template: Omit<Template, "id"> & { id?: string }
  ) => string | null;
  updateTemplate: (template: Template) => string | null;
  deleteTemplate: (id: string) => void;
  setSelectedTemplate: (template: Template | null) => void;
  overrideDefaultTemplate: (template: Template) => void;
  resetDefaultTemplate: (id: string) => void;
  getAllTemplates: () => Template[];
  fetchTemplates: () => Promise<void>;
  importTemplates: (
    templates: Template[],
    override?: boolean
  ) => Promise<{
    imported: { name: string }[];
    skipped: { name: string; reason: string }[];
  }>;
  resetDefaultTemplates: () => void;
  resetTemplates: () => void;
  initializeDefaultTemplates: (templates: Template[]) => void;
  copyDefaultsToUserTemplates: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  devtools(
    persist(
      (set, get) => ({
        templates: [],
        userTemplates: [],
        defaultTemplates: [] as Template[],
        selectedTemplate: null,
        modalSelectedTemplate: null,
        isInitialized: false,
        isLoading: false,

        initializeTemplates: () => {
          set((state) => {
            const userTemplates =
              state.userTemplates.length === 0
                ? state.defaultTemplates.map((template) => ({
                    ...template,
                    id: generateId(),
                    isDefault: false,
                    overridesDefaultTemplate: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }))
                : state.userTemplates;

            return {
              isInitialized: true,
              userTemplates,
              templates: [...state.defaultTemplates, ...userTemplates],
            };
          });
        },

        fetchTemplates: async () => {
          debug("Fetching templates");
          set({ isLoading: true });
          try {
            const state = get();
            const uniqueTemplates = [
              ...new Map(
                [...state.defaultTemplates, ...state.userTemplates].map(
                  (item) => [item.id, item]
                )
              ).values(),
            ];

            set({
              templates: uniqueTemplates,
              isLoading: false,
            });
          } catch (error) {
            debug("Error fetching templates:", error);
            set({ isLoading: false });
            toast.error("Failed to fetch templates");
          }
        },

        setSelectedTemplate: (template) => {
          debug("Setting selected template:", template?.id);
          set({ selectedTemplate: template });
        },

        addTemplate: (template: Omit<Template, "id"> & { id?: string }) => {
          const newTemplate = {
            ...template,
            id: template.id || generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isDefault: false,
          };

          set((state) => ({
            userTemplates: [...state.userTemplates, newTemplate],
            templates: [...state.templates, newTemplate],
          }));

          return newTemplate.id;
        },

        getAllTemplates: () => {
          const state = get();
          return state.userTemplates;
        },

        setModalSelectedTemplate: (template) => {
          debug("Setting modal selected template:", template?.id);
          set({ modalSelectedTemplate: template });
        },

        clearModalTemplate: () => {
          debug("Clearing modal template");
          set({ modalSelectedTemplate: null });
        },

        deleteTemplate: (id) => {
          set((state) => ({
            templates: state.templates.filter((t) => t.id !== id),
            userTemplates: state.userTemplates.filter((t) => t.id !== id),
          }));
        },

        updateTemplate: (template) => {
          set((state) => {
            const updatedTemplates = state.templates.map((t) =>
              t.id === template.id ? template : t
            );

            const updatedUserTemplates = state.userTemplates.map((t) =>
              t.id === template.id ? template : t
            );

            return {
              templates: updatedTemplates,
              userTemplates: updatedUserTemplates,
            };
          });

          return template.id;
        },

        overrideDefaultTemplate: (template) => {
          set((state) => {
            const updatedDefaultTemplates = state.defaultTemplates.map((t) =>
              t.id === template.id
                ? {
                    ...template,
                    isDefault: true,
                    overridesDefaultTemplate: true,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            );

            const updatedTemplates = state.templates.map((t) =>
              t.id === template.id
                ? {
                    ...template,
                    isDefault: true,
                    overridesDefaultTemplate: true,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            );

            return {
              defaultTemplates: updatedDefaultTemplates,
              templates: updatedTemplates,
            };
          });
        },

        resetDefaultTemplate: (id) => {
          set((state) => {
            const originalTemplate = defaultTemplates.find((t) => t.id === id);
            if (!originalTemplate) return {};

            const updatedDefaultTemplates = state.defaultTemplates.map((t) =>
              t.id === id ? originalTemplate : t
            );

            const updatedTemplates = state.templates.map((t) =>
              t.id === id ? originalTemplate : t
            );

            return {
              defaultTemplates: updatedDefaultTemplates,
              templates: updatedTemplates,
            };
          });
        },

        importTemplates: async (templates, override = false) => {
          const state = get();
          const imported: { name: string }[] = [];
          const skipped: { name: string; reason: string }[] = [];

    
          const newTemplates = templates
            .map((template) => {
              const exists = state.userTemplates.some(
                (t) => t.id === template.id
              );

              if (exists && !override) {
                skipped.push({
                  name: template.name,
                  reason: "Template already exists",
                });
                return null;
              }
              imported.push({ name: template.name });
              return {
                ...template,
                id: template.id || generateId(),
                createdAt: template.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isDefault: false,
              };
            })
            .filter(Boolean) as Template[];

          if (newTemplates.length > 0) {
            const filterOutNewTemplateIds = (userTemplates: Template[], newTemplates: Template[]) => {
              const newTemplateIds = new Set(newTemplates.map((nt) => nt.id));
              return userTemplates.filter((t) => !newTemplateIds.has(t.id));
            };

            set((state) => {
              let updatedUserTemplates = state.userTemplates;
              if (override) {
                updatedUserTemplates = filterOutNewTemplateIds(state.userTemplates, newTemplates);
              }

              return {
                userTemplates: [...updatedUserTemplates, ...newTemplates],
                templates: [...state.templates, ...newTemplates],
              };
            });
          }

          return { imported, skipped };
        },

        resetDefaultTemplates: () => {
          set((state) => ({
            templates: [...state.defaultTemplates],
          }));
        },

        resetTemplates: () => {
          set((state) => ({
            templates: [...state.defaultTemplates],
          }));
        },

        initializeDefaultTemplates: (templates) => {
          set({
            defaultTemplates: templates.map((t) => ({ ...t })),
            templates: [...templates],
          });
        },

        copyDefaultsToUserTemplates: () => {
          set((state) => {
            const userTemplates = state.defaultTemplates.map((template) => ({
              ...template,
              id: generateId(),
              isDefault: false,
              overridesDefaultTemplate: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));

            return {
              userTemplates: [...state.userTemplates, ...userTemplates],
              templates: [...state.templates, ...userTemplates],
            };
          });
        },
      }),
      {
        name: STORE_NAMES.TEMPLATES,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          defaultTemplates: state.defaultTemplates,
          userTemplates: state.userTemplates,
        }),
      }
    ),
    { name: STORE_NAMES.TEMPLATES, enabled: DEVTOOLS_ENABLED }
  )
);
