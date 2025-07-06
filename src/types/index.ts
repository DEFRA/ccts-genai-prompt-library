export interface RACEComponents {
  role: string;
  action: string;
  context: string;
  execute: string;
}

export type ModalMode =
  | "create"
  | "createPrompt"
  | "createPromptNew"
  | "createTemplate"
  | "createPromptWithTemplate"
  | "updatePrompt"
  | "updateTemplate"
  | "manage"
  | "enhance"
  | "view"
  | "history";

export type CustomSectionType = "textarea" | "multiselect" | "file" | "select";

export interface Tag {
  id: string;
  name: string;
  parentId?: string;
  color: string;
}

export interface CustomSection {
  id: string;
  name: string;
  label?: string;
  type: CustomSectionType;
  required?: boolean;
  isVisible?: boolean;
  options?: string[];
  inputValidation?: {
    type: "regex" | "format" | "custom" | "required";
    pattern?: string;
    errorMessage?: string;
  };
}

export interface Template {
  id: string;
  name: string;
  role: string;
  expertise: string;
  description: string;
  content: string;
  raceAction: string;
  raceContext: string;
  raceExecute: string;
  raceExpectation?: string;
  showProgrammingLanguage?: boolean;
  inputValidation?: string;
  bestPractices: {
    description: string;
    label: string;
  }[];
  customSections: CustomSection[];
  createdBy: string;
  showOutputValidation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomSectionData {
  id: string;
  title: string;
  content: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  template?: Template;
  bestPractices: string[];
  checkedPractices: string[];
  additionalText: string;
  uploadedFiles: FileData[];
  customTextAreas: CustomTextArea[];
  programmingLanguage: string;
  outputValidation: string;
  customSections: CustomSectionData[];
  tags: string[];
  priority: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
}

export interface FileData {
  name: string;
  content: string;
}

export interface CustomTextArea {
  id: string;
  title: string;
  content: string;
}

export interface SharedPrompt {
  id: string;
  promptId: string;
  userId: string;
  sharedWith: string[];
  permissions: "admin" | "view" | "edit";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  expertise?: string[];
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  content: string;
  timestamp: Date;
  author: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
}

export interface RequestQueueItem {
  id: string;
  userId: string;
  request: () => Promise<any>;
  timestamp: Date;
}

export interface Store {
  id: string;
  email: string;
  prompts: Prompt[];
  promptHistory: Prompt[];
  tags: Tag[];
  templates: Template[];
  roles: Role[];
  searchQuery: string;
  searchTerm: string;
  selectedTags: string[];
  selectedRole: Role | null;
  selectedPrompt: Prompt | null;
  selectedTemplate: Template | null;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  currentUser: {
    id: string;
    username: string;
    name?: string;
    email?: string;
    role: string;
    requestCount?: number;
    rateLimitExpiry?: Date;
  } | null;
  formData: Record<string, any>;
  requestQueue: RequestQueueItem[];
  isCreateModalOpen: boolean;
  isManageModalOpen: boolean;
  isViewTemplateModalOpen: boolean;
  modalMode: ModalMode;
  selectedTemplateForPrompt: Template | null;
  initialRoleId: string | null;
  versions: PromptVersion[];
  teams: Team[];
  sharedPrompts: SharedPrompt[];

  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (prompt: Prompt) => void;
  deletePrompt: (id: string) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  setSelectedTemplate: (template: Template | null) => void;
  setModalMode: (mode: ModalMode) => void;
  setSharedPrompts: (sharedPrompts: SharedPrompt[]) => void;
  sharePrompt: (
    promptId: string,
    userId: string,
    permissions: "admin" | "view" | "edit"
  ) => void;
  unsharePrompt: (promptId: string, userId: string) => void;
  setCurrentUser: (
    user: {
      id: string;
      username: string;
      name?: string;
      email?: string;
      role: string;
    } | null
  ) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setInitialRoleId: (roleId: string | null) => void;
  processQueue: () => void;
  enqueueRequest: (request: () => Promise<any>) => void;
  setFormData: (data: Record<string, any>) => void;
  updateFormData: (key: string, value: any) => void;
  clearFormData: () => void;
}

export interface ImportData {
  roles?: Role[];
  templates?: Template[];
}
