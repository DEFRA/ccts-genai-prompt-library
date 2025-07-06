import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadSection } from '../FileUploadSection';
import { CustomSection } from '../../../types';
import '@testing-library/jest-dom';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload Icon</div>,
  X: () => <div data-testid="x-icon">X Icon</div>,
}));

describe('FileUploadSection', () => {
  // Mock props and functions
  const mockHandleFileChange = vi.fn();
  
  // Sample section for testing
  const mockSection: CustomSection = {
    id: 'file1',
    name: 'Test File Upload',
    type: 'file',
    description: 'Upload a test file here',
    required: true,
    acceptedFileTypes: '.pdf,.docx,.txt'
  };

  // Sample section without optional fields
  const mockSectionMinimal: CustomSection = {
    id: 'file2',
    name: 'Minimal File Upload',
    type: 'file'
  };

  // Sample section with placeholder
  const mockSectionWithPlaceholder: CustomSection = {
    id: 'file3',
    name: 'Placeholder File Upload',
    type: 'file',
    placeholder: 'Upload your document here'
  };

  const mockFileNames = {
    file1: '',
    file2: '',
    file3: ''
  };

  const mockErrors = {
    file1: ''
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test case 1: Should render with full props
  it('should render with all provided props', () => {
    // Arrange
    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={mockErrors}
      />
    );

    // Assert
    expect(screen.getByText('Test File Upload')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    expect(screen.getByText('Upload a test file here')).toBeInTheDocument(); // Description
    expect(screen.getByRole('button')).toBeInTheDocument(); // Upload button
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument(); // Upload icon
    expect(screen.getByText('Choose file...')).toBeInTheDocument(); // Default placeholder
  });

  // Test case 2: Should render with minimal props
  it('should render with minimal props', () => {
    // Arrange
    render(
      <FileUploadSection 
        section={mockSectionMinimal}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Minimal File Upload')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument(); // No required indicator
    expect(screen.queryByText('Upload a test file here')).not.toBeInTheDocument(); // No description
    expect(screen.getByRole('button')).toBeInTheDocument(); // Upload button
  });

  // Test case 3: Should render with custom placeholder
  it('should render with custom placeholder', () => {
    // Arrange
    render(
      <FileUploadSection 
        section={mockSectionWithPlaceholder}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Upload your document here')).toBeInTheDocument(); // Custom placeholder
  });  // Test case 4: Should handle file selection
  it('should handle file selection', () => {
    // Arrange
    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Create a mock file
    const file = new File(['file content'], 'test.pdf', { type: 'application/pdf' });
    // Get input by its ID
    const inputElement = document.getElementById(mockSection.id) as HTMLInputElement;
    
    // Act
    fireEvent.change(inputElement, { target: { files: [file] } });

    // Assert
    expect(mockHandleFileChange).toHaveBeenCalledWith('file1', file);
  });

  // Test case 5: Should display file name when file is selected
  it('should display file name when file is selected', () => {
    // Arrange
    const fileNamesWithFile = {
      ...mockFileNames,
      file1: 'test.pdf'
    };

    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={fileNamesWithFile}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('test.pdf')).toBeInTheDocument(); // File name is displayed
    expect(screen.getByTestId('x-icon')).toBeInTheDocument(); // X icon for removal
    expect(screen.queryByText('Choose file...')).not.toBeInTheDocument(); // No upload button
  });

  // Test case 6: Should handle file removal
  it('should handle file removal', () => {
    // Arrange
    const fileNamesWithFile = {
      ...mockFileNames,
      file1: 'test.pdf'
    };

    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={fileNamesWithFile}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Act - click the remove button (parent of the X icon)
    const removeButton = screen.getByTestId('x-icon').closest('button');
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    // Assert
    expect(mockHandleFileChange).toHaveBeenCalledWith('file1', null as any);
  });

  // Test case 7: Should handle button click to trigger file input
  it('should trigger file input when button is clicked', () => {
    // Arrange
    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Mock the HTMLInputElement click method
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    
    // Act
    fireEvent.click(screen.getByText('Choose file...'));

    // Assert
    expect(clickSpy).toHaveBeenCalled();
    
    // Clean up
    clickSpy.mockRestore();
  });

  // Test case 8: Should display error message when provided
  it('should display error message when provided', () => {
    // Arrange
    const errorsWithMessage = {
      file1: 'This field is required'
    };

    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Assert
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  // Test case 9: Should apply error styling to button when there's an error
  it('should apply error styling to button when there is an error', () => {
    // Arrange
    const errorsWithMessage = {
      file1: 'This field is required'
    };

    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Get the button element
    const button = screen.getByRole('button');
    
    // Assert
    expect(button.className).toContain('border-vscode-error');
  });

  // Test case 10: Should not display error message or styling when no error
  it('should not display error message or styling when no error', () => {
    // Arrange
    render(
      <FileUploadSection 
        section={mockSection}
        fileNames={mockFileNames}
        handleFileChange={mockHandleFileChange}
        templateSectionErrors={{}}
      />
    );

    // Get the button element
    const button = screen.getByRole('button');
    
    // Assert
    expect(button.className).not.toContain('border-vscode-error');
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });
});
