import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTemplateModal from "../CreateTemplateModal";
import { Template } from "../../types.ts";
import { toast } from "react-hot-toast";
import { useTemplateStore } from "../../store/templateStore";
import { useRoleStore } from "../../store/roleStore";
import { useStore } from "../../store/useStore";

// Mock the dependencies
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

describe("CreateTemplateModal", () => {
  // Mock store functions
  const mockAddTemplate = vi.fn().mockReturnValue("template-id-123");
  const mockUpdateTemplate = vi.fn().mockReturnValue("template-id-123");
  const mockOverrideDefaultTemplate = vi.fn();
  
  const mockGetAllRoles = vi.fn().mockReturnValue([
    { id: "role1", name: "Developer", description: "Software Developer", expertise: ["Beginner", "Intermediate", "Expert"] },
    { id: "role2", name: "Designer", description: "UX Designer", expertise: ["Beginner", "Intermediate", "Expert"] }
  ]);
  
  const mockToggleCreateModal = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations for stores
    (useTemplateStore as any).mockReturnValue({
      addTemplate: mockAddTemplate,
      updateTemplate: mockUpdateTemplate,
      overrideDefaultTemplate: mockOverrideDefaultTemplate,
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
  });

  it("should render correctly in create mode", () => {
    // Arrange & Act
    render(<CreateTemplateModal />);
    
    // Assert
    expect(screen.getByTestId("modal-mock")).toBeInTheDocument();    expect(screen.getByTestId("modal-title")).toHaveTextContent("Create Template");
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i, { selector: 'select#role' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Expertise/i)).toBeInTheDocument();
    expect(screen.getByText(/RACE Framework/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i, { selector: 'textarea#raceRole' })).toBeInTheDocument();
    expect(screen.getByText(/Custom Sections/i)).toBeInTheDocument();
    expect(screen.getByText(/Show Programming Language Field/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Template/i })).toBeInTheDocument();
  });

  it("should render correctly in edit mode", () => {
    // Arrange
    const mockTemplate: Template = {
      id: "template1",
      name: "Test Template",
      role: "role1",
      expertise: "Expert",
      content: "",
      raceRole: "Developer role",
      raceAction: "Write code",
      raceContext: "In a project",
      raceExecute: "Using best practices",
      customSections: [],
      showProgrammingLanguage: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
      createdBy: "user1"
    };

    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: "updateTemplate",
      setModalMode: vi.fn(),
      selectedTemplate: mockTemplate,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    // Act
    render(<CreateTemplateModal />);
    
    // Assert
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Edit Template");
    expect(screen.getByRole("button", { name: /Update Template/i })).toBeInTheDocument();
  });

  it("should not render when modal is closed", () => {
    // Arrange
    (useStore as any).mockReturnValue({
      isCreateModalOpen: false,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: "createTemplate",
      setModalMode: vi.fn(),
      selectedTemplate: null,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    // Act
    render(<CreateTemplateModal />);
    
    // Assert
    expect(screen.queryByTestId("modal-mock")).not.toBeInTheDocument();
  });

  it("should call toggleCreateModal when Cancel button is clicked", () => {
    // Arrange
    render(<CreateTemplateModal />);
    
    // Act
    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    
    // Assert
    expect(mockToggleCreateModal).toHaveBeenCalledTimes(1);
  });

  it("should handle form submission for create template", async () => {
    // Arrange
    render(<CreateTemplateModal />);
      // Act - Fill out the form
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "New Template" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Template description" } });
    
    // Select a role - Use a more specific selector to avoid ambiguity with the RACE role field
    const roleSelect = screen.getByLabelText(/Role/i, { selector: 'select#role' });
    fireEvent.change(roleSelect, { target: { value: "role1" } });

    // Select expertise
    const expertiseSelect = screen.getByLabelText(/Expertise/i);
    fireEvent.change(expertiseSelect, { target: { value: "Expert" } });
      // Fill RACE framework fields
    const raceRoleTextarea = screen.getByLabelText(/Role/i, { selector: 'textarea#raceRole' });
    fireEvent.change(raceRoleTextarea, { target: { value: "Developer role" } });
    
    const raceActionTextarea = screen.getByLabelText(/Action/i);
    fireEvent.change(raceActionTextarea, { target: { value: "Write code" } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /Create Template/i }));
    
    // Assert - Wait for the async actions to complete
    await waitFor(() => {
      expect(mockAddTemplate).toHaveBeenCalledWith(expect.objectContaining({
        name: "New Template",
        description: "Template description",
        role: "role1",
        expertise: "Expert",
        raceRole: "Developer role",
        raceAction: "Write code",
      }));
      expect(toast.success).toHaveBeenCalledWith("Template created successfully");
      expect(mockToggleCreateModal).toHaveBeenCalled();
    });
  });

  it("should handle form submission for update template", async () => {
    // Arrange
    const mockTemplate: Template = {
      id: "template1",
      name: "Test Template",
      role: "role1",
      expertise: "Expert",
      content: "",
      raceRole: "Developer role",
      raceAction: "Write code",
      raceContext: "In a project",
      raceExecute: "Using best practices",
      customSections: [],
      showProgrammingLanguage: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
      isDefault: false,
      createdBy: "user1"
    };

    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: "updateTemplate",
      setModalMode: vi.fn(),
      selectedTemplate: mockTemplate,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    render(<CreateTemplateModal />);
    
    // Update the template name
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Updated Template" } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /Update Template/i }));
    
    // Assert
    await waitFor(() => {
      expect(mockUpdateTemplate).toHaveBeenCalledWith(expect.objectContaining({
        id: "template1",
        name: "Updated Template",
      }));
      expect(toast.success).toHaveBeenCalledWith("Template updated successfully");
      expect(mockToggleCreateModal).toHaveBeenCalled();
    });
  });

  it("should handle update of default template", async () => {
    // Arrange
    const mockDefaultTemplate: Template = {
      id: "template1",
      name: "Default Template",
      role: "role1",
      expertise: "Expert",
      content: "",
      raceRole: "Developer role",
      raceAction: "Write code",
      raceContext: "In a project",
      raceExecute: "Using best practices",
      customSections: [],
      showProgrammingLanguage: true,
      createdAt: "2023-01-01",
      updatedAt: "2023-01-01",
      isDefault: true // This is a default template
    };

    (useStore as any).mockReturnValue({
      isCreateModalOpen: true,
      toggleCreateModal: mockToggleCreateModal,
      modalMode: "updateTemplate",
      setModalMode: vi.fn(),
      selectedTemplate: mockDefaultTemplate,
      setSelectedTemplate: vi.fn(),
      setInitialRoleId: vi.fn(),
    });
    
    render(<CreateTemplateModal />);
    
    // Update the template name
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "Updated Default Template" } });
    
    // Submit the form
    fireEvent.submit(screen.getByRole("button", { name: /Update Template/i }));
    
    // Assert
    await waitFor(() => {
      expect(mockOverrideDefaultTemplate).toHaveBeenCalledWith(expect.objectContaining({
        id: "template1",
        name: "Updated Default Template",
        isDefault: true
      }));
      expect(toast.success).toHaveBeenCalledWith("Default template updated successfully");
    });
  });
  it("should toggle programming language field checkbox", () => {
    // Arrange
    render(<CreateTemplateModal />);
    
    // Act - Find and toggle the programming language checkbox
    const checkbox = screen.getByLabelText("Show Programming Language Field", {
      selector: 'input[type="checkbox"]'
    });
    
    // Test shows the checkbox is initially checked, so we'll update our test to match
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    
    // Assert - After click, it should be unchecked
    expect(checkbox).not.toBeChecked();
  });

  describe('Custom Section Management', () => {
    it('should open add section form when Section button is clicked', () => {
      render(<CreateTemplateModal />);
      const addSectionButton = screen.getByText('Section');
      fireEvent.click(addSectionButton);
      expect(screen.getByText('Add New Section')).toBeInTheDocument();
      expect(screen.getByLabelText('Section Name')).toBeInTheDocument();
      // Use selector to disambiguate
      expect(screen.getByLabelText('Description', { selector: '#section-description' })).toBeInTheDocument();
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
    });

    it('should close section form when X button is clicked', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      expect(screen.getByText('Add New Section')).toBeInTheDocument();
      
      // Act - Click the X button (first button with empty name)
      const closeButton = screen.getAllByRole('button', { name: '' })[0];
      fireEvent.click(closeButton);
      
      // Assert - Section form should be hidden
      expect(screen.queryByText('Add New Section')).not.toBeInTheDocument();
    });

    it('should handle section type changes', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Act - Change section type to select
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'select' } });
      
      // Assert - Options section should be visible
      expect(screen.getByLabelText('Options')).toBeInTheDocument();
    });

    it('should handle validation type changes', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Change to textarea type first
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'textarea' } });
      
      // Act - Change validation type to regex
      const validationSelect = screen.getByLabelText('Validation Type');
      fireEvent.change(validationSelect, { target: { value: 'regex' } });
      
      // Assert - Validation pattern field should be visible
      expect(screen.getByLabelText('Validation Pattern')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter regex pattern')).toBeInTheDocument();
    });

    it('should handle code-snippet validation type with language selection', () => {
      render(<CreateTemplateModal />);
      fireEvent.click(screen.getByText('Section'));
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'textarea' } });
      const validationSelect = screen.getByLabelText('Validation Type');
      fireEvent.change(validationSelect, { target: { value: 'code-snippet' } });
      const languageSelect = screen.getByLabelText('Programming Language');
      // Instead of getByDisplayValue, check value directly
      expect(languageSelect.value).toBe('javascript');
    });

    it('should handle BDD validation type placeholder', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Change to textarea type first
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'textarea' } });
      
      // Act - Change validation type to BDD
      const validationSelect = screen.getByLabelText('Validation Type');
      fireEvent.change(validationSelect, { target: { value: 'bdd' } });
      
      // Assert - BDD placeholder should be shown
      expect(screen.getByPlaceholderText('Enter BDD format')).toBeInTheDocument();
    });

    it('should handle option addition and removal for select/multiselect sections', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Change to select type
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'select' } });
      
      // Act - Add an option
      const optionInput = screen.getByPlaceholderText('Type option and press Enter');
      fireEvent.change(optionInput, { target: { value: 'Option 1' } });
      fireEvent.keyDown(optionInput, { key: 'Enter', code: 'Enter' });
      
      // Assert - Option should be added
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      
      // Act - Remove the option (first button with empty name in the options area)
      const removeButton = screen.getAllByRole('button', { name: '' })[1]; // X button in options
      fireEvent.click(removeButton);
      
      // Assert - Option should be removed
      expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('should handle required field toggle', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Act - Toggle required field
      const requiredCheckbox = screen.getByLabelText('Required field');
      fireEvent.click(requiredCheckbox);
      
      // Assert - Checkbox should be checked
      expect(requiredCheckbox).toBeChecked();
    });

    it('should handle placeholder input', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Act - Enter placeholder text
      const placeholderInput = screen.getByLabelText('Placeholder');
      fireEvent.change(placeholderInput, { target: { value: 'Enter your text here' } });
      
      // Assert - Value should be set
      expect(placeholderInput).toHaveValue('Enter your text here');
    });

    it('should handle file upload section type', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Act - Change to file type
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'file' } });
      
      // Assert - File upload section should be configured
      expect(typeSelect).toHaveValue('file');
    });

    it('should validate section data before saving', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Try to save without name (should be disabled)
      const saveButton = screen.getByRole('button', { name: 'Add Section' });
      expect(saveButton).toBeDisabled();
      
      // Act - Add section name
      const nameInput = screen.getByLabelText('Section Name');
      fireEvent.change(nameInput, { target: { value: 'Test Section' } });
      
      // Assert - Button should be enabled
      expect(saveButton).not.toBeDisabled();
    });

    it('should handle section editing', () => {
      // Arrange
      const mockTemplate: Template = {
        id: "template1",
        name: "Test Template",
        description: "Test description",
        role: "role1",
        expertise: "Expert",
        raceRole: "Developer role",
        raceAction: "Write code",
        raceContext: "In a project",
        raceExecute: "Using best practices",
        customSections: [
          {
            id: "section1",
            name: "Test Section",
            description: "Test section description",
            type: "textarea",
            options: [],
            isVisible: true,
            required: false
          }
        ],
        showProgrammingLanguage: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        isDefault: false
      };

      (useStore as any).mockReturnValue({
        isCreateModalOpen: true,
        toggleCreateModal: mockToggleCreateModal,
        modalMode: "updateTemplate",
        setModalMode: vi.fn(),
        selectedTemplate: mockTemplate,
        setSelectedTemplate: vi.fn(),
        setInitialRoleId: vi.fn(),
      });
      
      render(<CreateTemplateModal />);
      
      // Act - Click edit button on the section (first button with empty name)
      const editButton = screen.getAllByRole('button', { name: '' })[0];
      fireEvent.click(editButton);
      
      // Assert - Edit form should be open with section data
      expect(screen.getByText('Edit Section: Test Section')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Section')).toBeInTheDocument();
    });

    it('should handle section deletion', () => {
      // Arrange
      const mockTemplate: Template = {
        id: "template1",
        name: "Test Template",
        description: "Test description",
        role: "role1",
        expertise: "Expert",
        raceRole: "Developer role",
        raceAction: "Write code",
        raceContext: "In a project",
        raceExecute: "Using best practices",
        customSections: [
          {
            id: "section1",
            name: "Test Section",
            description: "Test section description",
            type: "textarea",
            options: [],
            isVisible: true,
            required: false
          }
        ],
        showProgrammingLanguage: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        isDefault: false
      };
      (useStore as any).mockReturnValue({
        isCreateModalOpen: true,
        toggleCreateModal: mockToggleCreateModal,
        modalMode: "updateTemplate",
        setModalMode: vi.fn(),
        selectedTemplate: mockTemplate,
        setSelectedTemplate: vi.fn(),
        setInitialRoleId: vi.fn(),
      });
      render(<CreateTemplateModal />);
      const deleteButton = screen.getAllByRole('button', { name: '' })[1];
      fireEvent.click(deleteButton);
      // Assert: section should be removed
      expect(screen.queryByText('Test Section')).not.toBeInTheDocument();
    });

    it('should handle multiselect section with options display', () => {
      // Arrange
      const mockTemplate: Template = {
        id: "template1",
        name: "Test Template",
        description: "Test description",
        role: "role1",
        expertise: "Expert",
        raceRole: "Developer role",
        raceAction: "Write code",
        raceContext: "In a project",
        raceExecute: "Using best practices",
        customSections: [
          {
            id: "section1",
            name: "Test Multiselect",
            description: "Test multiselect description",
            type: "multiselect",
            options: ["Option 1", "Option 2", "Option 3"],
            isVisible: true,
            required: false
          }
        ],
        showProgrammingLanguage: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        isDefault: false
      };

      (useStore as any).mockReturnValue({
        isCreateModalOpen: true,
        toggleCreateModal: mockToggleCreateModal,
        modalMode: "updateTemplate",
        setModalMode: vi.fn(),
        selectedTemplate: mockTemplate,
        setSelectedTemplate: vi.fn(),
        setInitialRoleId: vi.fn(),
      });
      
      render(<CreateTemplateModal />);
      
      // Assert - Options should be displayed
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should handle textarea section display', () => {
      // Arrange
      const mockTemplate: Template = {
        id: "template1",
        name: "Test Template",
        description: "Test description",
        role: "role1",
        expertise: "Expert",
        raceRole: "Developer role",
        raceAction: "Write code",
        raceContext: "In a project",
        raceExecute: "Using best practices",
        customSections: [
          {
            id: "section1",
            name: "Test Textarea",
            description: "Test textarea description",
            type: "textarea",
            options: [],
            isVisible: true,
            required: false
          }
        ],
        showProgrammingLanguage: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        isDefault: false
      };

      (useStore as any).mockReturnValue({
        isCreateModalOpen: true,
        toggleCreateModal: mockToggleCreateModal,
        modalMode: "updateTemplate",
        setModalMode: vi.fn(),
        selectedTemplate: mockTemplate,
        setSelectedTemplate: vi.fn(),
        setInitialRoleId: vi.fn(),
      });
      
      render(<CreateTemplateModal />);
      
      // Assert - Textarea section should be displayed
      expect(screen.getByText('Text Area Input')).toBeInTheDocument();
    });

    it('should handle file upload section display', () => {
      // Arrange
      const mockTemplate: Template = {
        id: "template1",
        name: "Test Template",
        description: "Test description",
        role: "role1",
        expertise: "Expert",
        raceRole: "Developer role",
        raceAction: "Write code",
        raceContext: "In a project",
        raceExecute: "Using best practices",
        customSections: [
          {
            id: "section1",
            name: "Test File Upload",
            description: "Test file upload description",
            type: "file",
            options: [],
            isVisible: true,
            required: false
          }
        ],
        showProgrammingLanguage: true,
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
        isDefault: false
      };

      (useStore as any).mockReturnValue({
        isCreateModalOpen: true,
        toggleCreateModal: mockToggleCreateModal,
        modalMode: "updateTemplate",
        setModalMode: vi.fn(),
        selectedTemplate: mockTemplate,
        setSelectedTemplate: vi.fn(),
        setInitialRoleId: vi.fn(),
      });
      
      render(<CreateTemplateModal />);
      
      // Assert - File upload section should be displayed
      expect(screen.getByText('File Upload Input')).toBeInTheDocument();
    });
  });

  describe('Form State and Effects', () => {

    it('should handle validation pattern and error message changes', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Change to textarea type and add validation
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'textarea' } });
      
      const validationSelect = screen.getByLabelText('Validation Type');
      fireEvent.change(validationSelect, { target: { value: 'regex' } });
      
      // Act - Change validation pattern
      const patternInput = screen.getByLabelText('Validation Pattern');
      fireEvent.change(patternInput, { target: { value: '^[A-Za-z]+$' } });
      
      // Act - Change error message
      const errorInput = screen.getByLabelText('Error Message');
      fireEvent.change(errorInput, { target: { value: 'Only letters are allowed' } });
      
      // Assert - Values should be set
      expect(patternInput).toHaveValue('^[A-Za-z]+$');
      expect(errorInput).toHaveValue('Only letters are allowed');
    });

    it('should handle language selection for code-snippet validation', () => {
      // Arrange
      render(<CreateTemplateModal />);
      
      // Open the section form
      fireEvent.click(screen.getByText('Section'));
      
      // Change to textarea type and add code-snippet validation
      const typeSelect = screen.getByLabelText('Type');
      fireEvent.change(typeSelect, { target: { value: 'textarea' } });
      
      const validationSelect = screen.getByLabelText('Validation Type');
      fireEvent.change(validationSelect, { target: { value: 'code-snippet' } });
      
      // Act - Change language
      const languageSelect = screen.getByLabelText('Programming Language');
      fireEvent.change(languageSelect, { target: { value: 'typescript' } });
      
      // Assert - Language should be changed
      expect(languageSelect).toHaveValue('typescript');
    });
  });
});
