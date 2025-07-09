import React, { useState, useEffect, useMemo } from "react";
import { useStore } from "../store/useStore";
import { useTemplateStore } from "../store/templateStore";
import { useRoleStore } from "../store/roleStore";
import { Template } from "../types";
import { UserCircle2, BrainCircuit, Search, Filter } from "lucide-react";
import { RoleFilter } from "./RoleFilter";
import { RoleSelector } from "./RoleSelector";

interface TemplateListProps {
  userId?: string;
}

interface ExtendedTemplate extends Template {
  externalUrl?: string;
}

export const TemplateList: React.FC<TemplateListProps> = ({ userId }) => {
  const { userTemplates } = useTemplateStore();
  const {
    setSelectedTemplateForPrompt,
    toggleCreateModal,
    setModalMode,
    searchTerm,
    setSearchTerm,
    selectedRole,
    setSelectedRole,
  } = useStore();

  const { getAllRoles, initializeDefaultRoles } = useRoleStore();
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const loadRoles = () => {
      const roles = getAllRoles();
      if (!roles || roles.length === 0) {
        initializeDefaultRoles([]);
      }
    };
    loadRoles();
  }, [getAllRoles, initializeDefaultRoles]);

  const allRoles = useMemo(() => {
    const roles = getAllRoles();
    return roles.sort((a, b) => a.name.localeCompare(b.name));
  }, [getAllRoles]);

  const filteredTemplates = useMemo(() => {
    return userTemplates.filter((template) => {
      const matchesSearch = searchTerm
        ? template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          allRoles
            .find((r) => r.id === template.role)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      const matchesRole = selectedRole ? template.role === selectedRole : true;

      return matchesSearch && matchesRole;
    });
  }, [userTemplates, searchTerm, selectedRole, allRoles]);

  const handleTemplateClick = (template: ExtendedTemplate) => {
    if (template.externalUrl) {
      window.location.href = template.externalUrl;
      return;
    }

    setSelectedTemplateForPrompt(template);
    setModalMode("createPromptWithTemplate");
    toggleCreateModal();
  };

  return (
    <div className="w-full max-w-[2000px] mx-auto pl-[0px] pr-2 sm:pr-2 py-2 font-vscode">
      <RoleSelector
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />
      <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-vscode-fg" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-7 pr-2 py-1.5 text-sm rounded-sm
              bg-vscode-input-bg text-vscode-input-fg
              border border-vscode-border
              focus:outline-none focus:ring-1 focus:ring-vscode-active
              placeholder-vscode-input-fg/50"
          />
        </div>

        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-1.5 rounded-sm transition-all duration-200
            ${
              showFilter
                ? "bg-vscode-button text-vscode-button-fg"
                : "bg-vscode-input-bg text-vscode-input-fg border border-vscode-border"
            }
            hover:bg-vscode-button-hover
            ${selectedRole ? "ring-1 ring-vscode-active" : ""}
          `}
          title="Filter by role"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {showFilter && (
        <div className="mb-2 animate-fadeIn">
          <RoleFilter onRoleChange={(roleId) => setSelectedRole(roleId)} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredTemplates.map((template) => (
          <button
            key={`template-${template.id}`}
            type="button"
            aria-label={`Select template ${template.name}`}
            onClick={() => handleTemplateClick(template as ExtendedTemplate)}
            className="bg-vscode-section text-vscode-fg rounded-sm border border-vscode-border p-4 
              hover:border-vscode-active cursor-pointer transition-all duration-200 text-left w-full"
          >
            <h3 className="text-sm font-bold">{template.name}</h3>
            <p className="mt-1 text-xs text-vscode-fg line-clamp-2">
              {template.description || "No description"}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {template.role && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-vscode-button/20 text-vscode-button-fg rounded-sm">
                  <UserCircle2 className="w-3 h-3 mr-1" />
                  {allRoles.find((r) => r.id === template.role)?.name ||
                    "Loading..."}
                </span>
              )}
              {template.expertise && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-vscode-button/20 text-vscode-button-fg rounded-sm">
                  <BrainCircuit className="w-3 h-3 mr-1" />
                  {template.expertise}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateList;
