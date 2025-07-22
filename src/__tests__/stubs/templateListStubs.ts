import { vi } from 'vitest';
import { Template, Role } from '../../types.ts';
import { TEST_CONFIG } from '../../config/testConfig';

// Define the ExtendedTemplate interface for testing
export interface ExtendedTemplate extends Template {
  externalUrl?: string;
}

// Helper function to create base template with common fields
const createBaseTemplate = (overrides: Pick<Template, 'id' | 'name' | 'content' | 'role' | 'expertise' | 'raceRole' | 'raceAction' | 'raceContext' | 'raceExecute'>): Template => ({
  customSections: [],
  showProgrammingLanguage: false,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  isDefault: false,
  ...overrides,
});

// Helper function to create base role with common fields
const createBaseRole = (overrides: Pick<Role, 'id' | 'name' | 'description' | 'expertise'>): Role => ({
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  isDefault: true,
  ...overrides,
});

// Mock roles data
export const mockRoles: Role[] = [
  createBaseRole({
    id: 'role1', 
    name: 'Developer',
    description: 'Software developer',
    expertise: ['Frontend', 'Backend'],
  }),
  createBaseRole({
    id: 'role2', 
    name: 'QA Engineer',
    description: 'Quality assurance engineer',
    expertise: ['Testing', 'Automation'],
  }),
  createBaseRole({
    id: 'role3', 
    name: 'DevOps',
    description: 'DevOps engineer',
    expertise: ['CI/CD', 'Cloud'],
  }),
];

// Mock templates data
export const mockTemplates: Template[] = [
  createBaseTemplate({
    id: 'template1',
    name: 'Frontend Template',
    content: 'A template for frontend tasks',
    role: 'role1',
    expertise: 'Frontend',
    raceRole: 'Developer',
    raceAction: 'Code',
    raceContext: 'Frontend context',
    raceExecute: 'Quality code',
  }),
  createBaseTemplate({
    id: 'template2',
    name: 'Backend Template',
    content: 'A template for backend tasks',
    role: 'role1',
    expertise: 'Backend',
    raceRole: 'Developer',
    raceAction: 'Code',
    raceContext: 'Backend context',
    raceExecute: 'Efficient code',
  }),
  createBaseTemplate({
    id: 'template3',
    name: 'Testing Template',
    content: 'A template for QA testing',
    role: 'role2',
    expertise: 'Testing',
    raceRole: 'QA Engineer',
    raceAction: 'Test',
    raceContext: 'Testing context',
    raceExecute: 'Thorough tests',
  }),
  createBaseTemplate({
    id: 'template4',
    name: 'Pipeline Template',
    content: 'A template for CI/CD pipelines',
    role: 'role3',
    expertise: 'CI/CD',
    raceRole: 'DevOps',
    raceAction: 'Configure',
    raceContext: 'Pipeline context',
    raceExecute: 'Stable pipeline',
  }),
];

// Mock templates with external URL
export const mockTemplatesWithExternalUrl: ExtendedTemplate[] = [
  {
    ...mockTemplates[0],
    externalUrl: TEST_CONFIG.TEMPLATE_LIST.EXTERNAL_URL
  },
  ...mockTemplates.slice(1)
];

// Mock store functions
export const mockStoreFunctions = {
  setSelectedTemplateForPrompt: vi.fn(),
  toggleCreateModal: vi.fn(),
  setModalMode: vi.fn(),
  setSearchTerm: vi.fn(),
  setSelectedRole: vi.fn(),
  getAllRoles: vi.fn().mockReturnValue(mockRoles),
  initializeDefaultRoles: vi.fn(),
};

// Mock store states
const defaultStoreState = {
  setSelectedTemplateForPrompt: mockStoreFunctions.setSelectedTemplateForPrompt,
  toggleCreateModal: mockStoreFunctions.toggleCreateModal,
  setModalMode: mockStoreFunctions.setModalMode,
  searchTerm: '',
  setSearchTerm: mockStoreFunctions.setSearchTerm,
  selectedRole: null,
  setSelectedRole: mockStoreFunctions.setSelectedRole,
};

export const mockStoreStates = {
  default: defaultStoreState,
  withSearchTerm: (searchTerm: string) => ({
    ...defaultStoreState,
    searchTerm,
  }),
  withSelectedRole: (roleId: string) => ({
    ...defaultStoreState,
    selectedRole: roleId,
  }),
  withSearchAndRole: (searchTerm: string, roleId: string) => ({
    ...defaultStoreState,
    searchTerm,
    selectedRole: roleId,
  }),
  empty: {
    ...defaultStoreState,
    userTemplates: [],
  },
};

// Mock template store states
export const mockTemplateStoreStates = {
  default: {
    userTemplates: mockTemplates,
  },
  withExternalUrl: {
    userTemplates: mockTemplatesWithExternalUrl,
  },
  empty: {
    userTemplates: [],
  },
};

// Mock role store states
export const mockRoleStoreStates = {
  default: {
    getAllRoles: mockStoreFunctions.getAllRoles,
    initializeDefaultRoles: mockStoreFunctions.initializeDefaultRoles,
  },
  empty: {
    getAllRoles: vi.fn().mockReturnValue([]),
    initializeDefaultRoles: mockStoreFunctions.initializeDefaultRoles,
  },
}; 