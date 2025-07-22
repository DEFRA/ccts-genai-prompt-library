import { vi } from 'vitest';

// Store state
export const mockStoreState = {
  isCreateModalOpen: false,
  isManageModalOpen: false,
  isViewTemplateModalOpen: false,
  initialRoleId: null,
  selectedTemplate: null,
  selectedTemplateForPrompt: null,
  selectedRole: '',
  prompts: [],
  selectedPrompt: null,
  modalMode: 'create',
  searchTerm: '',
  currentUser: null,
  isAdmin: false,
  isAuthenticated: false,
  isLogoClicked: false,
  isEnhanceModalOpen: false,
  enhanceModalContent: ''
};

// Auth service mocks
export const mockAuthService = {
  getUser: vi.fn().mockReturnValue(null),
  login: vi.fn().mockResolvedValue({ 
    success: true, 
    user: { username: 'testuser', role: 'admin' }, 
    token: 'test-token' 
  }),
  logout: vi.fn(),
  isAuthenticated: vi.fn().mockReturnValue(false),
  isAdmin: vi.fn().mockReturnValue(false),
};

// Role store mocks
export const mockAddRole = vi.fn().mockResolvedValue({ 
  id: 'new-role-id', 
  name: 'New Role', 
  description: 'Test description',
  expertise: ['Expert']
});

export const mockUpdateRole = vi.fn().mockResolvedValue({ 
  id: 'updated-role-id', 
  name: 'Updated Role', 
  description: 'Updated description',
  expertise: ['Expert']
});

export const mockDeleteRole = vi.fn().mockResolvedValue(true);

export const mockGetAllRoles = vi.fn().mockReturnValue([
  { id: 'role1', name: 'Test Role 1', description: 'Description 1', expertise: ['Expert'] },
  { id: 'role2', name: 'Test Role 2', description: 'Description 2', expertise: ['Beginner'] }
]);

export const mockSetSelectedRole = vi.fn();

// Create a function for storing callbacks
const callbacks = new Set();
export const mockSubscribeToRoleChanges = vi.fn(callback => {
  callbacks.add(callback);
  return () => callbacks.delete(callback);
});

// Add a way to trigger callbacks for testing
mockSubscribeToRoleChanges.triggerCallbacks = (roleId) => {
  callbacks.forEach(callback => callback(roleId));
};

// Store function mocks
export const mockStoreFunctions = {
  setSelectedTemplate: vi.fn(),
  setSelectedTemplateForPrompt: vi.fn(),
  deleteTemplate: vi.fn().mockResolvedValue(undefined),
  addRole: vi.fn().mockResolvedValue(undefined),
  updateRole: vi.fn().mockResolvedValue(undefined),
  deleteRole: vi.fn().mockResolvedValue(undefined),
  setSelectedRole: vi.fn(),
  setInitialRoleId: vi.fn(),
  setSelectedPrompt: vi.fn(),
  setModalMode: vi.fn(),
  setSearchTerm: vi.fn(),
  login: vi.fn().mockResolvedValue({
    success: true,
    user: { username: 'testuser', role: 'admin' },
    token: 'test-token'  }),
  logout: vi.fn().mockImplementation(() => {
    mockAuthService.logout();
  }),
  toggleCreateModal: vi.fn(),
  toggleManageModal: vi.fn(),
  toggleViewTemplateModal: vi.fn(),
  toggleLogoClick: vi.fn(),
  addPrompt: vi.fn().mockResolvedValue(undefined),
  openEnhanceModal: vi.fn(),
  closeEnhanceModal: vi.fn(),
  setEnhanceModalContent: vi.fn()
};
