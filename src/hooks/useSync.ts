import { useState } from "react";
import { toast } from "react-hot-toast";
import { defaultRoles } from "../data/defaultRoles";
import { defaultTemplates } from "../data/defaultTemplates";
import { useRoleStore } from "../store/roleStore";
import { useTemplateStore } from "../store/templateStore";
import { generateId } from "@/utils/generateId";

export const useSync = (
  resetDefaultRoles: () => void,
  resetDefaultTemplates: () => void,
  currentUser: any,
  isAuthenticated: boolean,
  isAdmin: boolean
) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const showLoadingToast = (): string =>
    toast.loading("Synchronizing data...", {
      position: "top-center",
      style: getToastStyle(
        "var(--vscode-editor-background)",
        "var(--vscode-editor-foreground)"
      ),
      className: "toast-overlay",
    });

  const showSuccessToast = () => {
    toast.success("Sync complete", {
      duration: 2000,
      position: "top-center",
      style: getToastStyle(
        "var(--vscode-button-background)",
        "var(--vscode-button-foreground)"
      ),
      className: "toast-overlay",
    });
  };

  const showErrorToast = () => {
    toast.error("Sync failed", {
      duration: 2000,
      position: "top-center",
      style: getToastStyle(
        "var(--vscode-errorForeground)",
        "var(--vscode-editor-foreground)"
      ),
      className: "toast-overlay",
    });
  };

  const getToastStyle = (background: string, color: string) => ({
    background,
    color,
    border: "1px solid var(--vscode-panel-border)",
    padding: "12px 16px",
    borderRadius: "4px",
    boxShadow: "var(--vscode-widget-shadow) 0px 2px 8px",
  });

  const handleSync = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      toast.dismiss();

      const loadingToast = showLoadingToast();

      const roleStore = useRoleStore.getState();
      const templateStore = useTemplateStore.getState();

      const userRoles = [...roleStore.userRoles];
      const userTemplates = [...templateStore.userTemplates];

      roleStore.resetRoles();
      templateStore.resetTemplates();

      roleStore.initializeDefaultRoles(defaultRoles);
      templateStore.initializeDefaultTemplates(defaultTemplates);

      await addUserRoles(roleStore, userRoles);
      await addUserTemplates(templateStore, userTemplates);

      await templateStore.fetchTemplates();

      storeUserData();

      toast.dismiss(loadingToast);
      showSuccessToast();
    } catch (error) {
      console.error("Sync failed:", error);
      showErrorToast();
    } finally {
      setIsSyncing(false);
    }
  };

  const addUserRoles = async (roleStore: any, userRoles: any[]) => {
    for (const role of userRoles) {
      await roleStore.addRole({
        name: role.name,
        description: role.description,
        expertise: role.expertise,
      });
    }
  };

  const addUserTemplates = async (templateStore: any, userTemplates: any[]) => {
    for (const template of userTemplates) {
      await templateStore.addTemplate({
        id: template.id ?? generateId(),
        name: template.name,
        description: template.description,
        role: template.role,
        expertise: template.expertise,
        framework: template.framework,
        raceRole: template.raceRole,
        raceAction: template.raceAction,
        raceContext: template.raceContext,
        raceExpectation: template.raceExpectation,
        raceExecute: template.raceExecute,
        showProgrammingLanguage: template.showProgrammingLanguage,
        inputValidation: template.inputValidation,
        customSections: template.customSections,
      });
    }
  };

  const storeUserData = () => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
    localStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
    localStorage.setItem("isAdmin", JSON.stringify(isAdmin));
  };

  return { isSyncing, handleSync };
};
