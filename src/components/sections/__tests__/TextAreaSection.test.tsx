import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextAreaSection } from '../TextAreaSection';
import { CustomSection } from '../../../types';
import '@testing-library/jest-dom';

// Mock Lucide icon
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload Icon</div>,
}));

describe('TextAreaSection', () => {
  // Mock props and functions
  const mockHandleCustomSectionChange = vi.fn();
  const mockGetInputClassName = vi.fn((id) => id === 'textarea1' ? 'custom-class' : '');
  
  // Sample section for testing
  const mockSection: CustomSection = {
    id: 'textarea1',
    name: 'Test TextArea',
    type: 'textarea',
    description: 'Enter text here',
    required: true,
    placeholder: 'Type something...'
  };

  // Sample section without optional fields
  const mockSectionMinimal: CustomSection = {
    id: 'textarea2',
    name: 'Minimal TextArea',
    type: 'textarea'
  };

  const mockErrors = {
    textarea1: ''
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // Test case 1: Should render with all provided props
  it('should render with all provided props', () => {
    // Arrange
    render(
      <TextAreaSection 
        section={mockSection}
        value="Some text content"
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={mockErrors}
      />
    );

    // Assert
    expect(screen.getByText('Test TextArea')).toBeInTheDocument(); // Label
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    expect(screen.getByText('Enter text here')).toBeInTheDocument(); // Description
    
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeInTheDocument();
    expect(textareaElement).toHaveValue('Some text content');
    expect(textareaElement).toHaveAttribute('placeholder', 'Type something...');
    
    // Upload icon should be present
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
  });

  // Test case 2: Should render with minimal props
  it('should render with minimal props', () => {
    // Arrange
    render(
      <TextAreaSection 
        section={mockSectionMinimal}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Minimal TextArea')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument(); // No required indicator
    expect(screen.queryByText('Enter text here')).not.toBeInTheDocument(); // No description
    
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement).toBeInTheDocument();
    expect(textareaElement).toHaveValue('');
    expect(textareaElement).not.toHaveAttribute('placeholder'); // No placeholder
  });

  // Test case 3: Should call handleCustomSectionChange when text is entered
  it('should call handleCustomSectionChange when text is entered', () => {
    // Arrange
    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={mockErrors}
      />
    );

    // Act
    const textareaElement = screen.getByRole('textbox');
    fireEvent.change(textareaElement, { target: { value: 'New text' } });

    // Assert
    expect(mockHandleCustomSectionChange).toHaveBeenCalledWith('textarea1', 'New text');
  });

  // Test case 4: Should display error message when provided
  it('should display error message when provided', () => {
    // Arrange
    const errorsWithMessage = {
      textarea1: 'This field is required'
    };

    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Assert
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  // Test case 5: Should apply error styling to textarea when there's an error
  it('should apply error styling to textarea when there is an error', () => {
    // Arrange
    const errorsWithMessage = {
      textarea1: 'This field is required'
    };

    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Get the textarea element
    const textareaElement = screen.getByRole('textbox');
    
    // Assert
    expect(textareaElement.className).toContain('border-vscode-error');
  });
  // Test case 6: Should handle file upload when a file is selected
  it('should handle file upload when a file is selected', async () => {
    // Arrange
    // Mock file.text() method
    const mockFileText = vi.fn().mockResolvedValue('File content');
    const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(mockFile, 'text', { value: mockFileText });

    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={mockErrors}
      />
    );

    // Get the file input using query selector directly since it's hidden
    const fileInput = document.querySelector(`#file-upload-textarea1`) as HTMLInputElement;
    expect(fileInput).not.toBeNull(); // Verify we found the input
    
    // Act
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(mockHandleCustomSectionChange).toHaveBeenCalledWith('textarea1', 'File content');
    });
  });

  // Test case 7: Should handle drag and drop
  it('should handle drag and drop of files', async () => {
    // Arrange
    // Mock file.text() method
    const mockFileText = vi.fn().mockResolvedValue('Dropped file content');
    const mockFile = new File(['dropped file content'], 'dropped.txt', { type: 'text/plain' });
    Object.defineProperty(mockFile, 'text', { value: mockFileText });

    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={mockErrors}
      />
    );

    // Get the textarea element for drag and drop
    const textareaElement = screen.getByRole('textbox');
    
    // Act - simulate drag over
    fireEvent.dragOver(textareaElement, {
      dataTransfer: { files: [mockFile] }
    });
    
    // Act - simulate drop
    fireEvent.drop(textareaElement, {
      dataTransfer: { files: [mockFile] }
    });
    
    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(mockHandleCustomSectionChange).toHaveBeenCalledWith('textarea1', 'Dropped file content');
    });
  });
  // Test case 8: Should handle file reading errors
  it('should handle errors when reading files', async () => {
    // Arrange
    // Spy on console.error to verify it's called
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock file.text() method to throw an error
    const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
    const error = new Error('Failed to read file');
    Object.defineProperty(mockFile, 'text', { 
      value: vi.fn().mockRejectedValue(error)
    });

    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={mockErrors}
      />
    );

    // Get the file input using query selector directly since it's hidden
    const fileInput = document.querySelector(`#file-upload-textarea1`) as HTMLInputElement;
    expect(fileInput).not.toBeNull(); // Verify we found the input
    
    // Act
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    
    // Wait for async operations to complete
    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error reading file:', error);
    });
    
    // Verify handleCustomSectionChange was not called
    expect(mockHandleCustomSectionChange).not.toHaveBeenCalled();
    
    // Clean up
    consoleErrorSpy.mockRestore();
  });

  // Test case 9: Should have correct CSS classes
  it('should have correct CSS classes for styling', () => {
    // Arrange
    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={{}}
      />
    );

    // Assert
    const label = screen.getByText('Test TextArea');
    expect(label).toHaveClass('block', 'text-sm', 'font-bold', 'text-vscode-fg', 'mb-1');
    
    const description = screen.getByText('Enter text here');
    expect(description).toHaveClass('mt-1', 'text-xs', 'text-vscode-fg');
    
    const textareaElement = screen.getByRole('textbox');
    expect(textareaElement.className).toContain('w-full');
    expect(textareaElement.className).toContain('rounded-sm');
    expect(textareaElement.className).toContain('bg-vscode-input-bg');
  });

  // Test case 10: Should show tooltip on hover
  it('should contain the upload tooltip', () => {
    // Arrange
    render(
      <TextAreaSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        getInputClassName={mockGetInputClassName}
        templateSectionErrors={{}}
      />
    );

    // Assert - tooltip should be in the document
    expect(screen.getByText('Upload file')).toBeInTheDocument();
  });
});
