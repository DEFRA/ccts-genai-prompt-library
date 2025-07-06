import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewTemplateModal } from "../ViewTemplateModal";
import { Template } from "../../types";

// Mock the Modal component
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

describe("ViewTemplateModal", () => {
  // Mock props and functions
  const mockOnClose = vi.fn();
  const mockOnUseTemplate = vi.fn();
  
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Sample template for testing
  const mockTemplate: Template = {
    id: "template1",
    name: "Test Template",
    content: "Test content",
    role: "Developer",
    description: "A test template description",
    raceRole: "Developer role",
    raceAction: "Write tests",
    raceContext: "For components",
    raceExpectation: "With high coverage",
    customSections: [
      {
        id: "section1",
        name: "Custom Section 1",
        type: "textarea",
        description: "A custom section description",
        content: "Custom section content"
      },
      {
        id: "section2",
        name: "Custom Section 2",
        type: "textarea",
        description: "Another custom section"
        // No content to test conditional rendering
      }
    ]
  };

  // Test case 1: Should not render when template is null
  it("should not render when template is null", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={null}
      />
    );

    // Assert
    expect(screen.queryByTestId("modal-mock")).not.toBeInTheDocument();
  });

  // Test case 2: Should render the modal with template information when isOpen=true
  it("should render the modal with template information when isOpen=true", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    expect(screen.getByTestId("modal-mock")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent(mockTemplate.name);
  });

  // Test case 3: Should not render the modal when isOpen=false
  it("should not render the modal when isOpen=false", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={false}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    expect(screen.queryByTestId("modal-mock")).not.toBeInTheDocument();
  });

  // Test case 4: Should render description section when available
  it("should render description section when available", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).toHaveTextContent("Description");
    expect(modalContent).toHaveTextContent(mockTemplate.description as string);
  });

  // Test case 5: Should not render description section when not available
  it("should not render description section when not available", () => {
    // Arrange
    const templateWithoutDescription = { ...mockTemplate, description: undefined };
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={templateWithoutDescription}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).not.toHaveTextContent("Description");
  });

  // Test case 6: Should render role section
  it("should render role section", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).toHaveTextContent("Role");
    expect(modalContent).toHaveTextContent(mockTemplate.role);
  });

  // Test case 7: Should render RACE framework sections when available
  it("should render RACE framework sections when available", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).toHaveTextContent("RACE Framework");
    
    // Check for all RACE sections
    expect(modalContent).toHaveTextContent("Role");
    expect(modalContent).toHaveTextContent(mockTemplate.raceRole as string);
    
    expect(modalContent).toHaveTextContent("Action");
    expect(modalContent).toHaveTextContent(mockTemplate.raceAction as string);
    
    expect(modalContent).toHaveTextContent("Context");
    expect(modalContent).toHaveTextContent(mockTemplate.raceContext as string);
    
    expect(modalContent).toHaveTextContent("Execute");
    expect(modalContent).toHaveTextContent(mockTemplate.raceExpectation as string);
  });

  // Test case 8: Should not render RACE sections when not available
  it("should not render RACE sections when not available", () => {
    // Arrange
    const templateWithoutRace = { 
      ...mockTemplate, 
      raceRole: undefined,
      raceAction: undefined,
      raceContext: undefined,
      raceExpectation: undefined 
    };
    
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={templateWithoutRace}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).toHaveTextContent("RACE Framework"); // Title still shows
    
    // The actual content sections shouldn't be there
    expect(modalContent.textContent).not.toMatch(/Role.*Developer role/); // Not finding "Role" followed by the content
    expect(modalContent.textContent).not.toMatch(/Action.*Write tests/);
    expect(modalContent.textContent).not.toMatch(/Context.*For components/);
    expect(modalContent.textContent).not.toMatch(/Execute.*With high coverage/);
  });

  // Test case 9: Should render custom sections with their content
  it("should render custom sections with their content", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    
    // First custom section (with content)
    expect(modalContent).toHaveTextContent("Custom Section 1");
    expect(modalContent).toHaveTextContent("A custom section description");
    expect(modalContent).toHaveTextContent("Custom section content");
    
    // Second custom section (without content)
    expect(modalContent).toHaveTextContent("Custom Section 2");
    expect(modalContent).toHaveTextContent("Another custom section");
  });

  // Test case 10: Should render close button and call onClose when clicked
  it("should render close button and call onClose when clicked", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Act
    fireEvent.click(screen.getByTestId("modal-close-button"));
    
    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test case 11: Should render "Use Template" button when onUseTemplate is provided
  it("should render Use Template button when onUseTemplate is provided", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).toHaveTextContent("Use Template");
  });

  // Test case 12: Should not render "Use Template" button when onUseTemplate is not provided
  it("should not render Use Template button when onUseTemplate is not provided", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
      />
    );

    // Assert
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).not.toHaveTextContent("Use Template");
  });

  // Test case 13: Should call onUseTemplate when "Use Template" button is clicked
  it("should call onUseTemplate when Use Template button is clicked", () => {
    // Arrange
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={mockTemplate}
        onUseTemplate={mockOnUseTemplate}
      />
    );

    // Act - Find the button in the modal content and click it
    const useTemplateButton = screen.getByText("Use Template");
    fireEvent.click(useTemplateButton);
    
    // Assert
    expect(mockOnUseTemplate).toHaveBeenCalledTimes(1);
  });

  // Test case 14: Should handle template with no custom sections
  it("should handle template with no custom sections", () => {
    // Arrange
    const templateWithoutCustomSections = { ...mockTemplate, customSections: undefined };
    render(
      <ViewTemplateModal 
        isOpen={true}
        onClose={mockOnClose}
        template={templateWithoutCustomSections}
      />
    );

    // Assert - Should render without errors
    expect(screen.getByTestId("modal-mock")).toBeInTheDocument();
    // Should not have custom section headers
    const modalContent = screen.getByTestId("modal-content");
    expect(modalContent).not.toHaveTextContent("Custom Section 1");
    expect(modalContent).not.toHaveTextContent("Custom Section 2");
  });
});
