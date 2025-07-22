import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UnifiedModal } from "../UnifiedModal";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon">X Icon</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">Arrow Left Icon</div>
}));

describe("UnifiedModal", () => {
  // Mock functions for props
  const mockOnClose = vi.fn();
  const mockOnBack = vi.fn();

  // Test case 1: Modal should not render when isOpen is false
  it("should not render when isOpen is false", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={false} onClose={mockOnClose}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  // Test case 2: Modal should render when isOpen is true
  it("should render when isOpen is true", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  // Test case 3: Modal should render title when provided
  it("should render title when provided", () => {
    // Arrange
    const title = "Test Modal Title";
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} title={title}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  // Test case 4: Modal should not render back button when onBack is not provided
  it("should not render back button when onBack is not provided", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
    expect(screen.queryByTestId("arrow-left-icon")).not.toBeInTheDocument();
  });

  // Test case 5: Modal should render back button when onBack is provided
  it("should render back button when onBack is provided", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} onBack={mockOnBack}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
  });

  // Test case 6: Modal should call onClose when close button is clicked
  it("should call onClose when close button is clicked", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Act
    fireEvent.click(screen.getByTestId("x-icon").parentElement as HTMLElement);
    
    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test case 7: Modal should call onBack when back button is clicked
  it("should call onBack when back button is clicked", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} onBack={mockOnBack}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Act
    fireEvent.click(screen.getByText("Back").parentElement as HTMLElement);
    
    // Assert
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  // Test case 8: Modal should apply default size class when no size is provided
  it("should apply default size class when no size is provided", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    const modalElement = screen.getByText("Modal content").parentElement?.parentElement;
    expect(modalElement?.className).toContain("max-w-lg");
  });

  // Test case 9: Modal should apply correct size class when size is provided
  it("should apply correct size class when size is provided", () => {
    // Arrange
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} size="sm">
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    const modalElement = screen.getByText("Modal content").parentElement?.parentElement;
    expect(modalElement?.className).toContain("max-w-sm");
  });

  // Test case 10: Modal should apply additional className when provided
  it("should apply additional className when provided", () => {
    // Arrange
    const additionalClass = "test-class";
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose} className={additionalClass}>
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    const modalElement = screen.getByText("Modal content").parentElement?.parentElement;
    expect(modalElement?.className).toContain(additionalClass);
  });

  // Test case 11: Modal should correctly render children content
  it("should correctly render children content", () => {
    // Arrange
    const complexChildren = (
      <div>
        <h3>Complex Title</h3>
        <p>Paragraph content</p>
        <button>Click me</button>
      </div>
    );
    
    render(
      <UnifiedModal isOpen={true} onClose={mockOnClose}>
        {complexChildren}
      </UnifiedModal>
    );
    
    // Assert
    expect(screen.getByText("Complex Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph content")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  // Test case 12: Modal should handle all size variants
  it.each(["sm", "md", "lg", "xl", "2xl", "4xl"])("should apply correct size class for %s size", (size) => {
    // Arrange
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={mockOnClose} 
        size={size as "sm" | "md" | "lg" | "xl" | "2xl" | "4xl"}
      >
        <div>Modal content</div>
      </UnifiedModal>
    );
    
    // Assert
    const modalElement = screen.getByText("Modal content").parentElement?.parentElement;
    expect(modalElement?.className).toContain(`max-w-${size}`);
  });
});
