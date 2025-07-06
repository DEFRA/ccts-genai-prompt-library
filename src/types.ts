import { ReactNode } from "react";

export interface Store {
  prompts: Prompt[];
  tags: Tag[];
  templates: Template[];
  sharedPrompts: SharedPrompt[];
  roles: Role[];
  searchTerm: string;
  modalMode: ModalMode;
  selectedPrompt: Prompt | null;
  selectedTemplate: Template | null;
  selectedRole: string | null;
  initialRoleId: string | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  isAdmin: boolean;
  id: string;
  email: string;
  selectedTags: string[];
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (prompt: Prompt) => void;
  deletePrompt: (id: string) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setModalMode: (mode: ModalMode) => void;
  setSelectedRole: (role: string | null) => void;
  toggleManageModal: () => void;
  isManageModalOpen: boolean;
  toggleCreateModal: () => void;
  isCreateModalOpen: boolean;
  selectedTemplateForPrompt: Template | null;
  setSelectedTemplateForPrompt: (template: Template | null) => void;
  toggleViewTemplateModal: () => void;
  isViewTemplateModalOpen: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addRole: (role: Role) => Promise<Role>;
  updateRole: (role: Role) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  setInitialRoleId: (roleId: string | null) => void;
  setSearchTerm: (term: string) => void;
  toggleTag: (tagId: string) => void;
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  updateFormData: (key: string, value: any) => void;
  clearFormData: () => void;
  setParentModalMode: (mode: string) => void;
  parentModalMode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  organization?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface Prompt {
  priority?: ReactNode;
  id: string;
  title: string;
  content: string;
  roleId: string;
  templateId?: string;
  bestPractices?: { description: string; label: string }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  expertise?: string[];
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  overridesDefaultRole?: string;
}

export interface Template {
  id: string;
  name: string;
  content: string; // Add this line
  role: string;
  expertise?: string;
  framework?: string;
  raceRole?: string;
  raceAction?: string;
  raceContext?: string;
  raceExpectation?: string;
  raceExecute?: string;
  showProgrammingLanguage?: boolean;
  inputValidation?: string;
  customSections?: CustomSection[];
  isDefault?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  overridesDefaultTemplate?: boolean;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface SharedPrompt {
  promptId: string;
  userId: string;
  permissions: "view" | "edit" | "admin";
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Language {
  id: string;
  name: string;
  extension: string;
  isCompiled: boolean;
}

interface InputValidation {
  type: "regex" | "bdd" | "code-snippet";
  pattern?: string;
  errorMessage?: string;
  language?: string;
}

export interface CustomSection {
  id: string;
  name: string;
  description?: string;
  type: "textarea" | "select" | "multiselect" | "file";
  options?: string[];
  isVisible?: boolean;
  label?: string;
  placeholder?: string;
  required?: boolean;
  inputValidation?: InputValidation;
  content?: string;
  maxLength?: number;
  acceptedFileTypes?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void | Promise<void>;
  children?: ReactNode;
  title?: string;
  size?: string;
}

export type ModalMode =
  | "create"
  | "createPrompt"
  | "createTemplate"
  | "createPromptWithTemplate"
  | "manage"
  | "enhance"
  | "view"
  | "updateTemplate";

export type OnCloseFunction = () => void | Promise<void>;

export interface AuthResponse {
  success: boolean;
  user?: {
    username: string;
    role?: string;
  };
  token?: string;
}

export interface FileData {
  id: string;
  name: string;
  content: string;
}

export interface SectionErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: SectionErrors;
}

export interface SectionValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  file?: {
    name: string;
    content: string;
    type: string;
    size: number;
  };
  isThinking?: boolean;
  isKeepAlive?: boolean;
  fullContent?: string;
  thoughtProcess?: {
    steps: {
      type: string;
      content: string;
    }[];
  };
}

export interface ContentVersion {
  id: string;
  content: string;
  timestamp: string;
}

export type OutputFormat = "TDD" | "BDD" | "code" | "general";

export type ThoughtStepType =
  | "thought"
  | "action"
  | "observation"
  | "conclusion";

export interface ThoughtStep {
  type: ThoughtStepType;
  content: string;
}

export interface ThoughtProcess {
  steps: ThoughtStep[];
  currentStep: number;
  isComplete: boolean;
}
