import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTemplateModal from "../CreateTemplateModal";
import { Template } from "../../types";
import { useTemplateStore } from "../../store/templateStore";
import { useRoleStore } from "../../store/roleStore";
import { useStore } from "../../store/useStore";
import { toast } from "react-hot-toast";
import { TEST_CONFIG } from "../../config/testConfig";

// Use the same mocks from the main test file
vi.mock("react-hot-toast", () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  };
  return {
    __esModule: true,
    toast: mockToast,
    default: mockToast,
  };
});

vi.mock("../../store/templateStore", () => ({
  useTemplateStore: vi.fn(),
}));

vi.mock("../../store/roleStore", () => ({
  useRoleStore: vi.fn(),
}));

vi.mock("../../store/useStore", () => ({
  useStore: vi.fn(),
}));

vi.mock("../Modal", () => ({
  Modal: ({ isOpen, onClose, title, children }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal-mock">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close-button" onClick={onClose}>Close Modal</button>
        <div data-testid="modal-content">{children}</div>
      </div>
    );
  }
}));

vi.mock("../ErrorMessage", () => ({
  ErrorMessage: ({ error }: any) => error ? <div data-testid="error-message">{error}</div> : null,
}));

describe("CreateTemplateModal - RACE Framework", () => {
  const mockAddTemplate = vi.fn().mockReturnValue(TEST_CONFIG.RACE_FRAMEWORK.MOCK_TEMPLATE_ID);
  const mockUpdateTemplate = vi.fn().mockReturnValue(TEST_CONFIG.RACE_FRAMEWORK.MOCK_TEMPLATE_ID);
  
  // Sample roles with expertise levels
  const mockRoles = [
    { 
      id: TEST_CONFIG.RACE_ROLES.ROLE_1.ID, 
      name: TEST_CONFIG.RACE_ROLES.ROLE_1.NAME, 
      description: TEST_CONFIG.RACE_ROLES.ROLE_1.DESCRIPTION, 
      expertise: TEST_CONFIG.RACE_ROLES.ROLE_1.EXPERTISE_LEVELS 
    },
    { 
      id: TEST_CONFIG.RACE_ROLES.ROLE_2.ID, 
      name: TEST_CONFIG.RACE_ROLES.ROLE_2.NAME, 
      description: TEST_CONFIG.RACE_ROLES.ROLE_2.DESCRIPTION, 
      expertise: TEST_CONFIG.RACE_ROLES.ROLE_2.EXPERTISE_LEVELS 
    }
  ];
  
  const mockGetAllRoles = vi.fn().mockReturnValue(mockRoles);
  const mockToggleCreateModal = vi.fn();
  
  // Configure store mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useTemplateStore as any).mockReturnValue({
      addTemplate: mockAddTemplate,
      updateTemplate: mockUpdateTemplate,
      overrideDefaultTemplate: vi.fn(),
    });
    
    (useRoleStore as any).mockReturnValue({
      getAllRoles: mockGetAllRoles,
    });
    
    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: "createTemplate",
      setModalMode: vi.fn(),
      selectedTemplate: null,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
  });  it("should render all RACE framework fields", () => {
    // Arrange & Act
    render(<CreateTemplateModal />);
    
    // Assert - Check all RACE fields are rendered
    expect(screen.getByText(TEST_CONFIG.RACE_FRAMEWORK.FRAMEWORK_TITLE)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i, { selector: 'textarea#raceRole' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Action/i, { selector: 'textarea#raceAction' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Context/i, { selector: 'textarea#raceContext' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Execute/i, { selector: 'textarea#raceExecute' })).toBeInTheDocument();
  });  it("should auto-populate RACE Role field when a role is selected", () => {
    // Arrange
    render(<CreateTemplateModal />);
    
    // Act - Select a role
    const roleSelect = screen.getByLabelText(/Role/i, { selector: 'select#role' });
    fireEvent.change(roleSelect, { target: { value: TEST_CONFIG.RACE_ROLES.ROLE_1.ID } });
    
    // Assert - Check RACE Role field is auto-populated
    const raceRoleField = screen.getByLabelText(/Role/i, { selector: 'textarea#raceRole' });
    expect(raceRoleField).toHaveValue(TEST_CONFIG.RACE_FRAMEWORK.ROLE_VALUE);
  });  it("should validate RACE required fields on form submission", async () => {
    // Arrange
    // Reset mock to ensure it hasn't been called before
    vi.clearAllMocks();
    
    // Mock the handleSaveTemplate function to be prevented when form validation fails
    // Create a mock implementation for toast.error
    const mockToastError = vi.fn();
    (toast.error as any) = mockToastError;
    
    // Set up the component with validation errors
    (useTemplateStore as any).mockReturnValue({
      addTemplate: mockAddTemplate,
      updateTemplate: mockUpdateTemplate,
      overrideDefaultTemplate: vi.fn(),
    });
    
    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: "createTemplate",
      setModalMode: vi.fn(),
      selectedTemplate: null,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    // Render with empty form fields
    render(<CreateTemplateModal />);
    
    // Make sure required fields are empty (title and raceAction)
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: "" } });
    
    // Clear the race action field, which is required
    const raceActionField = screen.getByLabelText(/Action/i, { selector: 'textarea#raceAction' });
    fireEvent.change(raceActionField, { target: { value: "" } });
    
    // Act - Try to submit the invalid form
    const submitButton = screen.getByRole("button", { name: new RegExp(TEST_CONFIG.BUTTON_TEXT.CREATE_TEMPLATE, 'i') });
    fireEvent.click(submitButton);
    
    // Wait to ensure form validation completes
    await waitFor(() => {
      // Check that the mockAddTemplate wasn't called due to validation errors
      expect(mockAddTemplate).not.toHaveBeenCalled();
      // Check that an error toast was shown
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it("should save template with RACE framework values", async () => {
    // Arrange
    render(<CreateTemplateModal />);
    
    // Act - Fill out the form including RACE framework fields
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: TEST_CONFIG.RACE_FRAMEWORK.TEMPLATE_NAME } });
      // Select a role
    const roleSelect = screen.getByLabelText(/Role/i, { selector: 'select#role' });
    fireEvent.change(roleSelect, { target: { value: TEST_CONFIG.RACE_ROLES.ROLE_1.ID } });

    // Select expertise
    const expertiseSelect = screen.getByLabelText(/Expertise/i);
    fireEvent.change(expertiseSelect, { target: { value: TEST_CONFIG.EXPERTISE_LEVELS.EXPERT } });
      // Fill RACE framework fields
    const raceRoleTextarea = screen.getByLabelText(/Role/i, { selector: 'textarea#raceRole' });
    fireEvent.change(raceRoleTextarea, { target: { value: TEST_CONFIG.RACE_FRAMEWORK.ROLE_VALUE } });
    
    const raceActionTextarea = screen.getByLabelText(/Action/i, { selector: 'textarea#raceAction' });
    fireEvent.change(raceActionTextarea, { target: { value: TEST_CONFIG.RACE_FRAMEWORK.ACTION_VALUE } });
    
    const raceContextTextarea = screen.getByLabelText(/Context/i, { selector: 'textarea#raceContext' });
    fireEvent.change(raceContextTextarea, { target: { value: TEST_CONFIG.RACE_FRAMEWORK.CONTEXT_VALUE } });
    
    const raceExecuteTextarea = screen.getByLabelText(/Execute/i, { selector: 'textarea#raceExecute' });
    fireEvent.change(raceExecuteTextarea, { target: { value: TEST_CONFIG.RACE_FRAMEWORK.EXECUTE_VALUE } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: new RegExp(TEST_CONFIG.BUTTON_TEXT.CREATE_TEMPLATE, 'i') }));
    
    // Assert - Check template is created with RACE values
    await waitFor(() => {
      expect(mockAddTemplate).toHaveBeenCalledWith(expect.objectContaining({
        name: TEST_CONFIG.RACE_FRAMEWORK.TEMPLATE_NAME,
        role: TEST_CONFIG.RACE_ROLES.ROLE_1.ID,
        expertise: TEST_CONFIG.EXPERTISE_LEVELS.EXPERT,
        raceRole: TEST_CONFIG.RACE_FRAMEWORK.ROLE_VALUE,
        raceAction: TEST_CONFIG.RACE_FRAMEWORK.ACTION_VALUE,
        raceContext: TEST_CONFIG.RACE_FRAMEWORK.CONTEXT_VALUE,
        raceExecute: TEST_CONFIG.RACE_FRAMEWORK.EXECUTE_VALUE,
      }));
    });
  });

  it("should load and display existing RACE values when editing template", () => {
    // Arrange
    const mockTemplate: Template = {
      id: TEST_CONFIG.RACE_FRAMEWORK.TEMPLATE_ID,
      name: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_TEMPLATE_NAME,
      content: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_TEMPLATE_DESCRIPTION,
      role: TEST_CONFIG.RACE_ROLES.ROLE_1.ID,
      expertise: TEST_CONFIG.EXPERTISE_LEVELS.EXPERT,
      raceRole: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_ROLE,
      raceAction: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_ACTION,
      raceContext: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_CONTEXT,
      raceExecute: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_EXECUTE,
      customSections: [],
      showProgrammingLanguage: false,
      createdAt: TEST_CONFIG.DATES.CREATED_AT,
      updatedAt: TEST_CONFIG.DATES.UPDATED_AT,
      isDefault: false
    };

    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: TEST_CONFIG.MODAL_MODES.UPDATE_TEMPLATE,
      setModalMode: vi.fn(),
      selectedTemplate: mockTemplate,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    // Act
    render(<CreateTemplateModal />);    // Assert - Check RACE fields display the existing values
    expect(screen.getByLabelText(/Role/i, { selector: 'textarea#raceRole' })).toHaveValue(TEST_CONFIG.RACE_FRAMEWORK.EXISTING_ROLE);
    expect(screen.getByLabelText(/Action/i, { selector: 'textarea#raceAction' })).toHaveValue(TEST_CONFIG.RACE_FRAMEWORK.EXISTING_ACTION);
    expect(screen.getByLabelText(/Context/i, { selector: 'textarea#raceContext' })).toHaveValue(TEST_CONFIG.RACE_FRAMEWORK.EXISTING_CONTEXT);
    expect(screen.getByLabelText(/Execute/i, { selector: 'textarea#raceExecute' })).toHaveValue(TEST_CONFIG.RACE_FRAMEWORK.EXISTING_EXECUTE);
  });

  it("should update RACE framework values when editing template", async () => {
    // Arrange
    const mockTemplate: Template = {
      id: TEST_CONFIG.RACE_FRAMEWORK.TEMPLATE_ID,
      name: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_TEMPLATE_NAME,
      content: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_TEMPLATE_DESCRIPTION,
      role: TEST_CONFIG.RACE_ROLES.ROLE_1.ID,
      expertise: TEST_CONFIG.EXPERTISE_LEVELS.EXPERT,
      raceRole: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_ROLE,
      raceAction: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_ACTION,
      raceContext: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_CONTEXT,
      raceExecute: TEST_CONFIG.RACE_FRAMEWORK.EXISTING_EXECUTE,
      customSections: [],
      showProgrammingLanguage: false,
      createdAt: TEST_CONFIG.DATES.CREATED_AT,
      updatedAt: TEST_CONFIG.DATES.UPDATED_AT,
      isDefault: false
    };

    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: TEST_CONFIG.MODAL_MODES.UPDATE_TEMPLATE,
      setModalMode: vi.fn(),
      selectedTemplate: mockTemplate,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    render(<CreateTemplateModal />);
      // Update RACE values
    fireEvent.change(screen.getByLabelText(/Action/i, { selector: 'textarea#raceAction' }), { 
      target: { value: TEST_CONFIG.RACE_FRAMEWORK.UPDATED_ACTION } 
    });
    
    fireEvent.change(screen.getByLabelText(/Context/i, { selector: 'textarea#raceContext' }), { 
      target: { value: TEST_CONFIG.RACE_FRAMEWORK.UPDATED_CONTEXT } 
    });
    
    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: new RegExp(TEST_CONFIG.BUTTON_TEXT.UPDATE_TEMPLATE, 'i') }));
    
    // Assert
    await waitFor(() => {
      expect(mockUpdateTemplate).toHaveBeenCalledWith(expect.objectContaining({
        id: TEST_CONFIG.RACE_FRAMEWORK.TEMPLATE_ID,
        raceAction: TEST_CONFIG.RACE_FRAMEWORK.UPDATED_ACTION,
        raceContext: TEST_CONFIG.RACE_FRAMEWORK.UPDATED_CONTEXT,
      }));
    });
  });
});
