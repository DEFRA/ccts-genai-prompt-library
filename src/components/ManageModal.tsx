import { saveAs } from "file-saver";
import {
  BrainCircuit,
  Download,
  Edit2,
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import authService from "../services/authService";
import { useRoleStore } from "../store/roleStore";
import { useTemplateStore } from "../store/templateStore";
import { useStore } from "../store/useStore";
import { Role, Template } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";

interface ImportData {
  roles: Role[];
  templates: Template[];
  version: string;
  exportDate: string;
  metadata?: {
    exportedBy?: string;
    organization?: string;
  };
}

const expertiseSchema = z.string();

const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  expertise: z.array(expertiseSchema).optional(),
  isDefault: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
});

const templateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  role: z.string().optional(),
  roleId: z.string().optional(),
  expertise: z.array(z.string()).optional(),
  raceRole: z.string().optional(),
  raceAction: z.string().optional(),
  raceContext: z.string().optional(),
  raceExecute: z.string().optional(),
  customSections: z.array(z.any()).optional(),
  showProgrammingLanguage: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
});

const importDataSchema = z.object({
  roles: z.array(roleSchema),
  templates: z.array(templateSchema),
  version: z.string(),
  exportDate: z.string(),
  metadata: z
    .object({
      exportedBy: z.string().optional(),
      organization: z.string().optional(),
    })
    .optional(),
});

const createExpertiseId = (expertise: string, index: number) =>
  `${expertise}-${index}`;


const generateId = () => {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, 9);
};
const generateExpertiseId = (expertise: string) =>
  `expertise-${expertise}-${generateId()}`;

const tabButtonStyles = (isActive: boolean) => `
  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200
  ${
    isActive
      ? "bg-vscode-list-active text-vscode-fg"
      : "text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover"
  }
`;

const actionButtonStyles = `
  flex items-center gap-2 px-3 py-1.5 text-sm 
  bg-vscode-button text-vscode-button-fg 
  rounded-sm hover:bg-vscode-button-hover 
  transition-colors
`;

const secondaryButtonStyles = `
  flex items-center gap-2 px-3 py-1.5 text-sm 
  bg-vscode-input-bg text-vscode-input-fg 
  border border-vscode-border
  rounded-sm hover:bg-vscode-list-hover 
  transition-colors
`;

type RoleCardProps = {
  role: Role;
  isEditing: boolean;
  editingRoleData: Partial<Role>;
  editingExpertise: string;
  setEditingRoleData: React.Dispatch<React.SetStateAction<Partial<Role>>>;
  setEditingExpertise: React.Dispatch<React.SetStateAction<string>>;
  handleCancelEdit: () => void;
  handleUpdateRole: () => void;
  handleEditRole: (role: Role) => void;
  handleDeleteRole: (roleId: string) => void;
  isAdmin: boolean;
  actionButtonStyles: string;
  secondaryButtonStyles: string;
};


const ExpertiseList: React.FC<{
  expertise: string[];
  onRemove: (index: number) => void;
}> = ({ expertise, onRemove }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {expertise.map((exp, index) => (
      <span
        key={createExpertiseId(exp, index)}
        className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-vscode-button/20 text-vscode-button-fg rounded-sm"
      >
        {exp}
        <button
          onClick={() => onRemove(index)}
          className="hover:text-vscode-error"
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    ))}
  </div>
);

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  isEditing,
  editingRoleData,
  editingExpertise,
  setEditingRoleData,
  setEditingExpertise,
  handleCancelEdit,
  handleUpdateRole,
  handleEditRole,
  handleDeleteRole,
  isAdmin,
  actionButtonStyles,
  secondaryButtonStyles,
}) => {

  const handleRemoveExpertise = (index: number) => {
    setEditingRoleData((prev) => ({
      ...prev,
      expertise: prev.expertise?.filter((_, i) => i !== index) || [],
    }));
  };

  if (isEditing) {
    return (
      <div className="group bg-vscode-section border border-vscode-border rounded-sm p-4 hover:border-vscode-active transition-all duration-200">
        <div className="space-y-4">
          <input
            type="text"
            value={editingRoleData.name}
            onChange={(e) =>
              setEditingRoleData({
                ...editingRoleData,
                name: e.target.value,
              })
            }
            className="w-full px-3 py-1.5 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active"
            placeholder="Enter role name"
          />

          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={editingExpertise}
                onChange={(e) => setEditingExpertise(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active"
                placeholder="Add expertise"
              />
              <button
                onClick={() => {
                  if (editingExpertise.trim()) {
                    setEditingRoleData((prev) => ({
                      ...prev,
                      expertise: [
                        ...(prev.expertise || []),
                        editingExpertise.trim(),
                      ],
                    }));
                    setEditingExpertise("");
                  }
                }}
                className={actionButtonStyles}
              >
                Add
              </button>
            </div>

            {editingRoleData.expertise && editingRoleData.expertise.length > 0 && (
              <ExpertiseList
                expertise={editingRoleData.expertise}
                onRemove={handleRemoveExpertise}
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancelEdit}
              className={secondaryButtonStyles}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={!editingRoleData.name?.trim()}
              className={`${actionButtonStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-vscode-section border border-vscode-border rounded-sm p-4 hover:border-vscode-active transition-all duration-200"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-vscode-fg">
            {role.name}
          </h3>
          {role.expertise && role.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {role.expertise.map((exp, index) => (
                <span
                  key={`${role.id}-expertise-${index}`}
                  className="px-2 py-1 text-xs
                    bg-vscode-button/20 text-vscode-button-fg rounded-sm"
                >
                  {exp}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleEditRole(role)}
            className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => handleDeleteRole(role.id)}
              className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-error hover:bg-vscode-list-hover"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ManageModal = () => {
  const {
    isManageModalOpen,
    toggleManageModal,
    setModalMode,
    toggleCreateModal,
    setSelectedTemplate,
    setInitialRoleId,
  } = useStore();

  const {
    roles: defaultRoles,
    getAllRoles,
    resetDefaultRoles,
    deleteRole,
    addRole,
    updateRole,
    importRoles,
  } = useRoleStore();

  const {
    userTemplates,
    deleteTemplate,
    resetDefaultTemplates,
    importTemplates,
    fetchTemplates,
  } = useTemplateStore();

  const currentUser = authService.getUser();
  const isAdmin = currentUser?.role === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"templates" | "roles">(
    "templates"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "template" | "role";
  } | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingRoleData, setEditingRoleData] = useState<Partial<Role>>({
    name: "",
    description: "",
    expertise: [],
  });
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
  });
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [editingExpertise, setEditingExpertise] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const filteredTemplates = useMemo(() => {
    return userTemplates.filter((template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userTemplates, searchQuery]);

  useEffect(() => {
    if (isManageModalOpen) {
      fetchTemplates();
      getAllRoles();
    }
  }, [isManageModalOpen, fetchTemplates, getAllRoles]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "template") {
        deleteTemplate(itemToDelete.id);
        toast.success("Template deleted successfully");
        await fetchTemplates();
      } else {
        const success = await deleteRole(itemToDelete.id);
        if (success) {
          toast.success("Role deleted successfully");
          getAllRoles();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete item");
      }
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (id: string, type: "template" | "role") => {
    setItemToDelete({ id, type });
    setShowDeleteConfirm(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setInitialRoleId(template.role);
    setModalMode("updateTemplate");
    toggleCreateModal();
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setEditingRoleData({
      name: role.name,
      description: role.description,
      expertise: role.expertise || [],
    });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setEditingRoleData({
      name: "",
      description: "",
      expertise: [],
    });
  };

  useEffect(() => {
    if (!isManageModalOpen) {
      setSearchQuery("");
      setActiveTab("templates");
      setEditingRole(null);
      setEditingRoleData({
        name: "",
        description: "",
        expertise: [],
      });
      setNewRole({
        name: "",
        description: "",
      });
      setSelectedExpertise([]);   
    }
  }, [isManageModalOpen]);

  const allRoles = useMemo(() => {
    const roles = getAllRoles();
    return roles;
  }, [getAllRoles]);

  const filteredRoles = useMemo(() => {
    const filtered = allRoles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered;
  }, [allRoles, searchQuery]);


  const handleDeleteRole = async (roleId: string) => {
    try {
      const templatesUsingRole = userTemplates.filter((t) => t.role === roleId);
      if (templatesUsingRole.length > 0) {
        toast.error("Cannot delete role that is being used by templates");
        return;
      }

      const isDefaultRole = defaultRoles.some((r) => r.id === roleId);
      if (!isAdmin && isDefaultRole) {
        toast.error("Only administrators can delete default roles");
        return;
      }

      confirmDelete(roleId, "role");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete role");
      }
    }
  };
  async function handleAddRole(event?: React.FormEvent) {
    if (event) {
      event.preventDefault();
    }

    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      const result = await addRole({
        name: newRole.name.trim(),
        description: newRole.description?.trim() || "",
        expertise: selectedExpertise,
      });

      if (result) {
        setNewRole({ name: "", description: "" });
        setSelectedExpertise([]);
        setShowNewRoleForm(false);
        toast.success("Role created successfully");
        getAllRoles();
      }
    } catch (error) {
      toast.error(error.message ?? "Failed to create role");
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole || !editingRoleData.name?.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      const updatedRole: Role = {
        ...editingRole,
        name: editingRoleData.name.trim(),
        description:
          editingRoleData.description?.trim() || editingRole.description || "",
        expertise: editingRoleData.expertise || editingRole.expertise || [],
        updatedAt: new Date().toISOString(),
      };

      const result = await updateRole(updatedRole);
      if (result !== null) {
        toast.success("Role updated successfully");
        getAllRoles();
        handleCancelEdit();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update role");
      }
    }
  };

  const handleToggleNewRoleForm = () => {
    setShowNewRoleForm(!showNewRoleForm);
    if (!showNewRoleForm) {
      setNewRole({ name: "", description: "" });
      setSelectedExpertise([]);
    }
  };


  const handleExport = () => {
    try {
      const exportData: ImportData = {
        roles: allRoles,
        templates: [...userTemplates],
        version: "1.0",
        exportDate: new Date().toISOString(),
        metadata: {},
      };

      const fileName = `prompt-laibrary-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, fileName);

      toast.success("Export completed successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to export data: ${error.message}`);
      } else {
        toast.error("Failed to export data");
      }
    }
  };

  const processImportFileContent = async (content: string) => {
    try {
      setIsLoading(true);
      const data = JSON.parse(content);


      let roleResults = { imported: [] };
      let templateResults = { imported: [] };

      await Promise.all([resetDefaultRoles(), resetDefaultTemplates()]);

      try {
        if (data.roles && data.templates) {
          roleResults = await importRoles(
            data.roles.map((r: any) => ({
              id: r.id,
              name: r.name,
              description: r.description ?? "",
              expertise: r.expertise ?? [],
              isDefault: r.isDefault ?? false,
              createdAt: r.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: r.createdBy ?? "system",
            })),
            true
          );

          templateResults = await importTemplates(
            data.templates.map((t: any) => ({
              id: t.id,
              name: t.name,
              role: t.role ?? t.roleId ?? "",
              expertise: Array.isArray(t.expertise)
                ? t.expertise.join(", ")
                : t.expertise ?? "",
              description: t.description ?? "",
              raceRole: t.raceRole ?? "",
              raceAction: t.raceAction ?? "",
              raceContext: t.raceContext ?? "",
              raceExecute: t.raceExecute ?? "",
              customSections: t.customSections ?? [],
              showProgrammingLanguage: t.showProgrammingLanguage ?? false,
              isDefault: t.isDefault ?? false,
              createdAt: t.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: t.createdBy ?? "system",
            })),
            true
          );
        } else if (data.roles && Array.isArray(data.roles)) {
          roleResults = await importRoles(
            data.roles.map((r: any) => ({
              id: r.id,
              name: r.name,
              description: r.description ?? "",
              expertise: r.expertise ?? [],
              isDefault: true,
              createdAt: r.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: "system",
            })),
            true
          );
        } else if (Array.isArray(data)) {
          templateResults = await importTemplates(
            data.map((t: any) => ({
              id: t.id,
              name: t.name,
              role: t.role ?? t.roleId ?? "",
              expertise: Array.isArray(t.expertise)
                ? t.expertise.join(", ")
                : t.expertise ?? "",
              description: t.description ?? "",
              raceRole: t.raceRole ?? "",
              raceAction: t.raceAction ?? "",
              raceContext: t.raceContext ?? "",
              raceExecute: t.raceExecute ?? "",
              customSections: t.customSections ?? [],
              showProgrammingLanguage: t.showProgrammingLanguage ?? false,
              isDefault: t.isDefault ?? false,
              createdAt: t.createdAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: t.createdBy ?? "system",
            })),
            true
          );
        } else {
          throw new Error("Unrecognized import format");
        }

        if (
          roleResults.imported.length > 0 ||
          templateResults.imported.length > 0
        ) {
          toast.success(
            `Successfully imported ${roleResults.imported.length} roles and ${templateResults.imported.length} templates`
          );

          await fetchTemplates();
          getAllRoles();
        } else {
          toast.error("No valid data found in import file");
        }
      } catch (error: any) {
        console.error("Import processing error:", error);
        toast.error(error.message ?? "Failed to process import data");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON format in import file");
      } else {
        toast.error(
          "Failed to import data: " + (error.message ?? "Unknown error")
        );
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        toast.error("Please select a file to import");
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result as string;
        await processImportFileContent(content);
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setIsLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import data");
      setIsLoading(false);
    }
  };


  if (!isManageModalOpen) return null;

  if (isLoading) {
    return (
      <Modal
        isOpen={isManageModalOpen}
        onClose={toggleManageModal}
        title="Manage Laibrary"
        size="full"
        className="w-full h-full max-w-none max-h-none overflow-visible"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isManageModalOpen}
      onClose={toggleManageModal}
      size="full"
      className="w-screen h-screen max-w-screen max-h-screen overflow-visible font-sans bg-gray-50 dark:bg-vscode-editor-background"
      title="Manage Templates & Roles"
    >
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".json"
        onChange={handleImport}
      />

      <div className="flex flex-col h-[calc(100vh-60px)]">
        
        <div className="flex space-x-1 px-4 py-2 bg-vscode-section border-b border-vscode-border">
          <button
            onClick={() => setActiveTab("templates")}
            className={tabButtonStyles(activeTab === "templates")}
          >
            <FileText className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={tabButtonStyles(activeTab === "roles")}
          >
            <UserCircle2 className="w-4 h-4" />
            Roles
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-2 bg-vscode-panel">
          {/* Search and Actions Bar */}
          <div className="sticky top-0 z-10 bg-vscode-panel border-b border-vscode-border pb-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-vscode-fg" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full pl-9 pr-4 py-1.5 text-sm rounded-sm
                    bg-vscode-input-bg text-vscode-input-fg
                    border border-vscode-border
                    focus:outline-none focus:ring-1 focus:ring-vscode-active
                    placeholder-vscode-input-fg/50"
                />
              </div>

              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExport}
                  className={secondaryButtonStyles}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={secondaryButtonStyles}
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={
                    activeTab === "templates"
                      ? () => {
                          setModalMode("createTemplate");
                          toggleCreateModal();
                        }
                      : handleToggleNewRoleForm
                  }
                  className={actionButtonStyles}
                >
                  <Plus className="w-4 h-4" />
                  Add {activeTab === "templates" ? "Template" : "Role"}
                </button>
              </div>
            </div>
        </div>
        <div>
          {activeTab === "templates" ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group bg-vscode-section border border-vscode-border rounded-sm p-4 hover:border-vscode-active transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-vscode-fg">
                      {template.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {template.raceRole && (
                        <span
                          className="inline-flex items-center px-2 py-1 text-xs bg-vscode-button/20 text-vscode-button-fg rounded-sm"
                        >
                          {template.raceRole}
                        </span>
                      )}
                      {template.expertise && (
                        <span
                          className="inline-flex items-center px-2 py-1 text-xs bg-vscode-button/20 text-vscode-button-fg rounded-sm"
                        >
                          <BrainCircuit className="w-3 h-3 mr-1" />
                          {template.expertise}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => confirmDelete(template.id, "template")}
                        className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-error hover:bg-vscode-list-hover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {showNewRoleForm && (
                <div className="mb-4 bg-vscode-section border border-vscode-border rounded-sm p-4">
                  <form onSubmit={handleAddRole}>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="Role name"
                        className="w-full px-3 py-1.5 text-sm rounded-sm
                          bg-vscode-input-bg text-vscode-input-fg
                          border border-vscode-border
                          focus:outline-none focus:ring-1 focus:ring-vscode-active"
                      />
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingExpertise}
                            onChange={(e) => setEditingExpertise(e.target.value)}
                            placeholder="Add expertise (optional)"
                            className="flex-1 px-3 py-1.5 text-sm rounded-sm
                              bg-vscode-input-bg text-vscode-input-fg
                              border border-vscode-border
                              focus:outline-none focus:ring-1 focus:ring-vscode-active"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editingExpertise.trim()) {
                                setSelectedExpertise([...selectedExpertise, editingExpertise.trim()]);
                                setEditingExpertise("");
                              }
                            }}
                            className={actionButtonStyles}
                          >
                            Add
                          </button>
                        </div>
                        {selectedExpertise.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedExpertise.map((exp) => (
                              <span
                                key={generateExpertiseId(exp)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-vscode-button/20 text-vscode-button-fg rounded-sm"
                              >
                                {exp}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedExpertise(
                                      selectedExpertise.filter((item) => item !== exp)
                                    );
                                  }}
                                  className="hover:text-vscode-error"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleToggleNewRoleForm}
                          className={secondaryButtonStyles}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newRole.name.trim()}
                          className={`${actionButtonStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Create Role
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Existing roles list */}
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  isEditing={editingRole?.id === role.id}
                  editingRoleData={editingRoleData}
                  editingExpertise={editingExpertise}
                  setEditingRoleData={setEditingRoleData}
                  setEditingExpertise={setEditingExpertise}
                  handleCancelEdit={handleCancelEdit}
                  handleUpdateRole={handleUpdateRole}
                  handleEditRole={handleEditRole}
                  handleDeleteRole={handleDeleteRole}
                  isAdmin={isAdmin}
                  actionButtonStyles={actionButtonStyles}
                  secondaryButtonStyles={secondaryButtonStyles}
                />
              ))}
            </>
          )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        message={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`}
      />
    </Modal>
  );
};
export default ManageModal;
