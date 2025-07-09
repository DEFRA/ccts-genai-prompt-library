import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { fireEvent } from '@testing-library/react';
import { TEST_CONFIG } from '../config/testConfig';

// Mock the stores
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}));

vi.mock('../store/roleStore', () => ({
  useRoleStore: vi.fn()
}));

vi.mock('../store/templateStore', () => ({
  useTemplateStore: vi.fn()
}));

vi.mock('../services/authService', () => ({
  default: { getUser: vi.fn() }
}));

// Import the mocked modules
import { useStore } from '../store/useStore';
import { useRoleStore } from '../store/roleStore';
import { useTemplateStore } from '../store/templateStore';
import authService from '../services/authService';

// Mock all the required dependencies
vi.mock('../components/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));
vi.mock('../components/Sidebar', () => ({
  Sidebar: ({ setShowEnhancePrompt }) => (
    <div data-testid="sidebar" onClick={() => setShowEnhancePrompt(true)}>Sidebar</div>
  ),
}));
vi.mock('../components/TemplateList', () => ({
  default: ({ userId }) => <div data-testid="template-list" data-userid={userId}>Template List</div>,
}));
vi.mock('../components/CreatePromptModal', () => ({
  default: () => <div data-testid="create-prompt-modal">Create Prompt Modal</div>,
}));
vi.mock('../components/CreateTemplateModal', () => ({
  default: () => <div data-testid="create-template-modal">Create Template Modal</div>,
}));
vi.mock('../components/ManageModal', () => ({
  default: () => <div data-testid="manage-modal">Manage Modal</div>,
}));
vi.mock('../components/EnhancePromptModal', () => ({
  default: ({ isOpen, onClose, onSubmit, currentPrompt }) => (
    <div data-testid="enhance-prompt-modal" data-isopen={isOpen} onClick={() => onSubmit('enhanced prompt')}>
      Enhance Prompt Modal
      <button data-testid="close-button" onClick={onClose}>Close</button>
      <span data-testid="current-prompt">{currentPrompt}</span>
    </div>
  ),
}));
vi.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container">Toast Container</div>,
}));
vi.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
}));
vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock setup is at the top level

// Helper function to set up non-loading state for modal tests
const setupNonLoadingState = () => {
  // Ensure templateStore is not in loading state
  vi.mocked(useTemplateStore).mockReturnValue({
    fetchTemplates: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    initializeTemplates: vi.fn(),
    clearModalTemplate: vi.fn(),
  });
  
  // Make sure useRoleStore.getState().isInitialized is true
  vi.mocked(useRoleStore.getState).mockReturnValue({
    roles: [],
    userRoles: [],
    defaultRoles: [],
    selectedRole: null,
    modalSelectedRole: null,
    isInitialized: true,
    initializeDefaultRoles: vi.fn(),
    setSelectedRole: vi.fn(),
    addRole: vi.fn().mockResolvedValue(null),
    getAllRoles: vi.fn().mockReturnValue([]),
    setModalSelectedRole: vi.fn(),
    clearModalRole: vi.fn(),
    resetDefaultRoles: vi.fn(),
    importRoles: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
    deleteRole: vi.fn().mockResolvedValue(true),
    updateRole: vi.fn().mockResolvedValue(null),
    resetRoles: vi.fn(),
    subscribeToRoleChanges: vi.fn().mockImplementation((callback) => {
      callback(null);
      return () => {};
    }),
  });
  
  // Mock templateStore state initialized to true
  vi.mocked(useTemplateStore.getState).mockReturnValue({
    templates: [],
    userTemplates: [],
    defaultTemplates: [],
    selectedTemplate: null,
    modalSelectedTemplate: null,
    isInitialized: true,
    isLoading: false,
    initializeTemplates: vi.fn(),
    addTemplate: vi.fn().mockReturnValue('mock-id'),
    updateTemplate: vi.fn().mockReturnValue('mock-id'),
    deleteTemplate: vi.fn(),
    setSelectedTemplate: vi.fn(),
    overrideDefaultTemplate: vi.fn(),
    resetDefaultTemplate: vi.fn(),
    getAllTemplates: vi.fn().mockReturnValue([]),
    fetchTemplates: vi.fn().mockResolvedValue(undefined),
    importTemplates: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
    resetDefaultTemplates: vi.fn(),
    resetTemplates: vi.fn(),
    initializeDefaultTemplates: vi.fn(),
    copyDefaultsToUserTemplates: vi.fn(),
    clearModalTemplate: vi.fn(),
  });
  
  // Mock auth service
  vi.mocked(authService.getUser).mockReturnValue({ 
    username: TEST_CONFIG.USER.USERNAME,
    isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED,
    role: TEST_CONFIG.USER.ROLE
  });
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: null,
      isCreateModalOpen: false,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });

    vi.mocked(useRoleStore).mockReturnValue({
      initializeDefaultRoles: vi.fn(),
    });

    // Mock useRoleStore.getState
    (useRoleStore as any).getState = vi.fn(() => ({
      roles: [],
      userRoles: [],
      defaultRoles: [],
      selectedRole: null,
      modalSelectedRole: null,
      isInitialized: true,
      initializeDefaultRoles: vi.fn(),
      setSelectedRole: vi.fn(),
      addRole: vi.fn().mockResolvedValue(null),
      getAllRoles: vi.fn().mockReturnValue([]),
      setModalSelectedRole: vi.fn(),
      clearModalRole: vi.fn(),
      resetDefaultRoles: vi.fn(),
      importRoles: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
      deleteRole: vi.fn().mockResolvedValue(true),
      updateRole: vi.fn().mockResolvedValue(null),
      resetRoles: vi.fn(),
      subscribeToRoleChanges: vi.fn().mockImplementation((callback) => {
        callback(null);
        return () => {};
      }),
    }));

    vi.mocked(useTemplateStore).mockReturnValue({
      fetchTemplates: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
      initializeTemplates: vi.fn(),
      clearModalTemplate: vi.fn(),
    });

    // Mock useTemplateStore.getState
    (useTemplateStore as any).getState = vi.fn(() => ({
      templates: [],
      userTemplates: [],
      defaultTemplates: [],
      selectedTemplate: null,
      modalSelectedTemplate: null,
      isInitialized: true,
      isLoading: false,
      initializeTemplates: vi.fn(),
      addTemplate: vi.fn().mockReturnValue('mock-id'),
      updateTemplate: vi.fn().mockReturnValue('mock-id'),
      deleteTemplate: vi.fn(),
      setSelectedTemplate: vi.fn(),
      overrideDefaultTemplate: vi.fn(),
      resetDefaultTemplate: vi.fn(),
      getAllTemplates: vi.fn().mockReturnValue([]),
      fetchTemplates: vi.fn().mockResolvedValue(undefined),
      importTemplates: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
      resetDefaultTemplates: vi.fn(),
      resetTemplates: vi.fn(),
      initializeDefaultTemplates: vi.fn(),
      copyDefaultsToUserTemplates: vi.fn(),
      clearModalTemplate: vi.fn(),
    }));

    vi.mocked(authService.getUser).mockReturnValue({ 
      username: TEST_CONFIG.USER.USERNAME,
      isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED,
      role: TEST_CONFIG.USER.ROLE
    });
  });

  it('renders login page when user is not authenticated', () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: false,
      modalMode: null,
      isCreateModalOpen: false,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: null,
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    render(<App />);
    
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('template-list')).not.toBeInTheDocument();
  });

  it('renders loading state when templates are loading', () => {
    vi.mocked(useTemplateStore).mockReturnValue({
      fetchTemplates: vi.fn().mockResolvedValue(undefined),
      isLoading: true,
      initializeTemplates: vi.fn(),
    });
    
    render(<App />);
    
    expect(screen.queryByTestId('template-list')).not.toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    
    // Find the spinner using the class name directly in the HTML structure
    const spinnerElement = document.querySelector('.animate-spin');
    expect(spinnerElement).not.toBeNull();
  });

  it('renders main application when authenticated and templates are loaded', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('template-list')).toBeInTheDocument();
      expect(screen.getByTestId('template-list')).toHaveAttribute('data-userid', TEST_CONFIG.USER.USERNAME);
    });
  });

  it('initializes roles and templates on mount if not initialized', async () => {
    // Setup for this specific test
    (useRoleStore as any).getState = vi.fn(() => ({
      roles: [],
      userRoles: [],
      defaultRoles: [],
      selectedRole: null,
      modalSelectedRole: null,
      isInitialized: false,
      initializeDefaultRoles: vi.fn(),
      setSelectedRole: vi.fn(),
      addRole: vi.fn().mockResolvedValue(null),
      getAllRoles: vi.fn().mockReturnValue([]),
      setModalSelectedRole: vi.fn(),
      clearModalRole: vi.fn(),
      resetDefaultRoles: vi.fn(),
      importRoles: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
      deleteRole: vi.fn().mockResolvedValue(true),
      updateRole: vi.fn().mockResolvedValue(null),
      resetRoles: vi.fn(),
      subscribeToRoleChanges: vi.fn().mockImplementation((callback) => {
        callback(null);
        return () => {};
      }),
    }));
    
    (useTemplateStore as any).getState = vi.fn(() => ({
      templates: [],
      userTemplates: [],
      defaultTemplates: [],
      selectedTemplate: null,
      modalSelectedTemplate: null,
      isInitialized: false,
      isLoading: false,
      initializeTemplates: vi.fn(),
      addTemplate: vi.fn().mockReturnValue('mock-id'),
      updateTemplate: vi.fn().mockReturnValue('mock-id'),
      deleteTemplate: vi.fn(),
      setSelectedTemplate: vi.fn(),
      overrideDefaultTemplate: vi.fn(),
      resetDefaultTemplate: vi.fn(),
      getAllTemplates: vi.fn().mockReturnValue([]),
      fetchTemplates: vi.fn().mockResolvedValue(undefined),
      importTemplates: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
      resetDefaultTemplates: vi.fn(),
      resetTemplates: vi.fn(),
      initializeDefaultTemplates: vi.fn(),
      copyDefaultsToUserTemplates: vi.fn(),
      clearModalTemplate: vi.fn(),
    }));
    
    const initializeDefaultRolesMock = vi.fn();
    const initializeTemplatesMock = vi.fn();
    const fetchTemplatesMock = vi.fn().mockResolvedValue(undefined);
    
    vi.mocked(useRoleStore).mockReturnValue({
      initializeDefaultRoles: initializeDefaultRolesMock,
    });
    
    vi.mocked(useTemplateStore).mockReturnValue({
      fetchTemplates: fetchTemplatesMock,
      isLoading: false,
      initializeTemplates: initializeTemplatesMock,
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(initializeDefaultRolesMock).toHaveBeenCalled();
      expect(initializeTemplatesMock).toHaveBeenCalled();
    });
  });

  it('renders create prompt modal when isCreateModalOpen is true and modalMode is createPrompt', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'createPrompt',
      isCreateModalOpen: true,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });
  });

  it('renders create template modal when isCreateModalOpen is true and modalMode is createTemplate', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'createTemplate',
      isCreateModalOpen: true,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('create-template-modal')).toBeInTheDocument();
    });
  });

  it('renders manage modal when isManageModalOpen is true and modalMode is manage', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'manage',
      isCreateModalOpen: false,
      isManageModalOpen: true,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('manage-modal')).toBeInTheDocument();
    });
  });

  it('handles enhance prompt modal state', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'createPrompt',
      isCreateModalOpen: false,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false, // initial state
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    
    // Wait for the app to render (not loading)
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
    
    // Simulate sidebar click to open enhance prompt modal
    fireEvent.click(screen.getByTestId('sidebar'));
    await waitFor(() => {
      expect(screen.getByTestId('enhance-prompt-modal')).toBeInTheDocument();
    });
  });

  it('catches and logs errors during initialization', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the store functions to throw an error
    vi.mocked(useRoleStore).mockReturnValue({
      roles: [],
      userRoles: [],
      defaultRoles: [],
      selectedRole: null,
      modalSelectedRole: null,
      isInitialized: false,
      initializeDefaultRoles: vi.fn().mockRejectedValue(new Error('Initialization failed')),
      setSelectedRole: vi.fn(),
      addRole: vi.fn().mockResolvedValue(null),
      getAllRoles: vi.fn().mockReturnValue([]),
      setModalSelectedRole: vi.fn(),
      clearModalRole: vi.fn(),
      resetDefaultRoles: vi.fn(),
      importRoles: vi.fn().mockResolvedValue({ imported: [], skipped: [] }),
      deleteRole: vi.fn().mockResolvedValue(true),
      updateRole: vi.fn().mockResolvedValue(null),
      resetRoles: vi.fn(),
      subscribeToRoleChanges: vi.fn().mockImplementation((callback) => {
        callback(null);
        return () => {};
      }),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
      fetchTemplates: vi.fn().mockRejectedValue(new Error('Template fetch failed')),
      initializeTemplates: vi.fn(),
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('renders create prompt modal for createPromptWithTemplate modalMode', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'createPromptWithTemplate',
      isCreateModalOpen: true,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });
  });

  it('renders create prompt modal for updatePrompt modalMode', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'updatePrompt',
      isCreateModalOpen: true,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('create-prompt-modal')).toBeInTheDocument();
    });
  });

  it('renders create template modal for updateTemplate modalMode', async () => {
    vi.mocked(useStore).mockReturnValue({
      isAuthenticated: true,
      modalMode: 'updateTemplate',
      isCreateModalOpen: true,
      isManageModalOpen: false,
      isViewTemplateModalOpen: false,
      initialRoleId: null,
      toggleCreateModal: vi.fn(),
      toggleManageModal: vi.fn(),
      toggleViewTemplateModal: vi.fn(),
      selectedTemplate: null,
      selectedTemplateForPrompt: null,
      setSelectedTemplate: vi.fn(),
      setSelectedTemplateForPrompt: vi.fn(),
      deleteTemplate: vi.fn(),
      addRole: vi.fn(),
      updateRole: vi.fn(),
      deleteRole: vi.fn(),
      selectedRole: '',
      setSelectedRole: vi.fn(),
      setInitialRoleId: vi.fn(),
      prompts: [],
      addPrompt: vi.fn(),
      selectedPrompt: null,
      setSelectedPrompt: vi.fn(),
      setModalMode: vi.fn(),
      searchTerm: '',
      setSearchTerm: vi.fn(),
      currentUser: { 
        username: TEST_CONFIG.USER.USERNAME, 
        isAuthenticated: TEST_CONFIG.USER.IS_AUTHENTICATED, 
        role: TEST_CONFIG.USER.ROLE 
      },
      isAdmin: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLogoClicked: false,
      toggleLogoClick: vi.fn(),
      isEnhanceModalOpen: false,
      enhanceModalContent: '',
      openEnhanceModal: vi.fn(),
      closeEnhanceModal: vi.fn(),
      setEnhanceModalContent: vi.fn(),
    });
    
    // Mock template store to not be loading
    vi.mocked(useTemplateStore).mockReturnValue({
      isLoading: false,
    });
    
    // Mock role store to not be loading
    vi.mocked(useRoleStore).mockReturnValue({
      isInitialized: true,
    });
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('create-template-modal')).toBeInTheDocument();
    });
  });
});
