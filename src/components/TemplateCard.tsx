import { Bot, BrainCircuit, FileText, UserCircle2 } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import { useRoleStore } from "../store/roleStore";
import { useStore } from "../store/useStore";
import { Template } from "../types";

declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void;
};

const isVSCode = () => {
  try {
    return typeof acquireVsCodeApi !== "undefined";
  } catch (e) {
    console.error('Error in isVSCode:', e);
    return false;
  }
};

interface ExtendedTemplate extends Template {
  externalUrl?: string;
}

interface TemplateCardProps {
  template: ExtendedTemplate;
  isUserTemplate: boolean;
  onEdit: (template: ExtendedTemplate) => void;
  onClose?: () => void;
}

export const TemplateCard = React.memo<TemplateCardProps>(
  ({ template, isUserTemplate, onEdit, onClose }) => {
    const {
      setSelectedTemplateForPrompt,
      setModalMode,
      toggleCreateModal,
      isAdmin = false,
    } = useStore();
    const { roles, userRoles } = useRoleStore();

    const allRoles = useMemo(
      () => [...roles, ...userRoles],
      [roles, userRoles]
    );
    const roleName =
      allRoles.find((r) => r.id === template.role)?.name || "Unknown Role";

    const handleClick = useCallback(() => {
      if (template.externalUrl) {
        if (isVSCode()) {
          const vscode = acquireVsCodeApi();
          vscode.postMessage({
            command: "openExternal",
            url: template.externalUrl,
          });
        } else {
          window.location.href = template.externalUrl;
        }
        return;
      }

      setSelectedTemplateForPrompt(template);
      setModalMode("createPromptWithTemplate");
      toggleCreateModal();
    }, [
      template,
      setSelectedTemplateForPrompt,
      setModalMode,
      toggleCreateModal,
    ]);

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Select template ${template.name}`}
        className={`group relative w-full rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border overflow-hidden text-left cursor-pointer
        ${
          template.externalUrl
            ? "bg-orange-50/50 dark:bg-orange-900/10 border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            : "bg-white dark:bg-gray-800 border-gray-200/75 dark:border-gray-700/75"
        }`}
      >
        <div className="p-2 flex flex-col min-h-[100px] h-full font-bold">
          {/* Header */}
          <div className="flex items-start gap-1 font-bold">
            {/* Icon - Show Bot for external URLs, FileText for regular templates */}
            <div
              className={`p-0.5 rounded shrink-0 ${
                template.externalUrl
                  ? "bg-orange-100 dark:bg-orange-800/50"
                  : "bg-blue-50 dark:bg-blue-900/20"
              }`}
            >
              {template.externalUrl ? (
                <Bot className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              ) : (
                <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {template.name}
                  {template.externalUrl && (
                    <span className="ml-1 text-xs text-orange-500 dark:text-orange-400 font-normal">
                      (external tool)
                    </span>
                  )}
                </h3>
              </div>

              {template.description && (
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-snug">
                  {template.description}
                </p>
              )}
            </div>
          </div>

          {/* Tags Section - Only show for non-external templates */}
          {!template.externalUrl && (
            <div className="flex items-center gap-2 mt-auto pt-2 w-full">
              {/* Role Tag */}
              {template.role && (
                <div
                  className="flex items-center gap-0.5 px-1.5 py-px rounded-full text-[11px] font-medium flex-1 min-w-0
                bg-gray-100 dark:bg-gray-700/50 
                text-gray-700 dark:text-gray-300
                group-hover:bg-blue-50 group-hover:text-blue-700 
                dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300
                transition-colors duration-200"
                >
                  <UserCircle2 className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{roleName}</span>
                </div>
              )}

              {/* Expertise Tag */}
              {template.expertise && (
                <div
                  className="flex items-center gap-0.5 px-1.5 py-px rounded-full text-[11px] font-medium flex-1 min-w-0
                bg-gray-100 dark:bg-gray-700/50 
                text-gray-700 dark:text-gray-300
                group-hover:bg-blue-50 group-hover:text-blue-700
                dark:group-hover:bg-blue-900/20 dark:group-hover:text-blue-300
                transition-colors duration-200"
                >
                  <BrainCircuit className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{template.expertise}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hover Effects */}
        <div
          className={`absolute inset-0 border border-transparent 
        ${
          template.externalUrl
            ? "group-hover:border-orange-300/20 dark:group-hover:border-orange-500/20"
            : "group-hover:border-blue-500/10 dark:group-hover:border-blue-400/10"
        } 
        rounded-lg pointer-events-none transition-all duration-300`}
        />
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 
        ${
          template.externalUrl
            ? "bg-gradient-to-br from-orange-500/[0.02] to-orange-500/[0.08] dark:from-orange-400/[0.03] dark:to-orange-400/[0.12]"
            : "bg-gradient-to-br from-blue-500/[0.01] to-blue-500/[0.05] dark:from-blue-400/[0.02] dark:to-blue-400/[0.08]"
        }
        rounded-lg pointer-events-none transition-all duration-300`}
        />
      </button>
    );
  }
);

TemplateCard.displayName = "TemplateCard";
