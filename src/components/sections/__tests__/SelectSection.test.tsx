import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectSection } from '../SelectSection';
import { CustomSection } from '../../../types';
import '@testing-library/jest-dom';

describe('SelectSection', () => {
  // Mock props and functions
  const mockHandleCustomSectionChange = vi.fn();
  
  // Sample section for testing
  const mockSection: CustomSection = {
    id: 'select1',
    name: 'Test Select',
    type: 'select',
    description: 'Select an option',
    required: true,
    options: ['Option 1', 'Option 2', 'Option 3']
  };

  // Sample section without optional fields
  const mockSectionMinimal: CustomSection = {
    id: 'select2',
    name: 'Minimal Select',
    type: 'select',
    options: ['Choice A', 'Choice B']
  };

  // Sample section with placeholder
  const mockSectionWithPlaceholder: CustomSection = {
    id: 'select3',
    name: 'Placeholder Select',
    type: 'select',
    placeholder: 'Choose something...',
    options: ['Item 1', 'Item 2', 'Item 3']
  };

  const mockErrors = {
    select1: ''
  };

  // Test case 1: Should render with all provided props
  it('should render with all provided props', () => {
    // Arrange
    render(
      <SelectSection 
        section={mockSection}
        value="Option 1"
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={mockErrors}
      />
    );

    // Assert
    expect(screen.getByText('Test Select')).toBeInTheDocument(); // Label
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    expect(screen.getByText('Select an option')).toBeInTheDocument(); // Description
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(selectElement).toHaveValue('Option 1');
    
    // All options should be in the document
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
  });

  // Test case 2: Should render with minimal props
  it('should render with minimal props', () => {
    // Arrange
    render(
      <SelectSection 
        section={mockSectionMinimal}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Minimal Select')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument(); // No required indicator
    expect(screen.queryByText('Select an option')).not.toBeInTheDocument(); // No description
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Default empty option should be present with default text
    expect(screen.getByText('Select an option...')).toBeInTheDocument();
    
    // Options should be in the document
    expect(screen.getByRole('option', { name: 'Choice A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Choice B' })).toBeInTheDocument();
  });

  // Test case 3: Should render with custom placeholder
  it('should render with custom placeholder', () => {
    // Arrange
    render(
      <SelectSection 
        section={mockSectionWithPlaceholder}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Choose something...')).toBeInTheDocument(); // Custom placeholder
  });

  // Test case 4: Should call handleCustomSectionChange when a new option is selected
  it('should call handleCustomSectionChange when a new option is selected', () => {
    // Arrange
    render(
      <SelectSection 
        section={mockSection}
        value="Option 1"
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={mockErrors}
      />
    );

    // Act
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'Option 2' } });

    // Assert
    expect(mockHandleCustomSectionChange).toHaveBeenCalledWith('select1', 'Option 2');
  });

  // Test case 5: Should display error message when provided
  it('should display error message when provided', () => {
    // Arrange
    const errorsWithMessage = {
      select1: 'This field is required'
    };

    render(
      <SelectSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Assert
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  // Test case 6: Should apply error styling to select when there's an error
  it('should apply error styling to select when there is an error', () => {
    // Arrange
    const errorsWithMessage = {
      select1: 'This field is required'
    };

    render(
      <SelectSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Get the select element
    const selectElement = screen.getByRole('combobox');
    
    // Assert
    expect(selectElement.className).toContain('border-vscode-error');
  });

  // Test case 7: Should handle no options array
  it('should handle section with no options array', () => {
    // Arrange
    const sectionWithoutOptions: CustomSection = {
      id: 'select4',
      name: 'No Options Select',
      type: 'select'
    };

    render(
      <SelectSection 
        section={sectionWithoutOptions}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Should only have the default empty option
    expect(selectElement.children.length).toBe(1);
  });

  // Test case 8: Should have correct CSS classes
  it('should have correct CSS classes for styling', () => {
    // Arrange
    render(
      <SelectSection 
        section={mockSection}
        value=""
        handleCustomSectionChange={mockHandleCustomSectionChange}
        templateSectionErrors={{}}
      />
    );

    // Assert
    const label = screen.getByText('Test Select');
    expect(label).toHaveClass('block', 'text-sm', 'font-bold', 'text-vscode-fg', 'mb-1');
    
    const description = screen.getByText('Select an option');
    expect(description).toHaveClass('mt-1', 'text-xs', 'text-vscode-fg');
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement.className).toContain('w-full');
    expect(selectElement.className).toContain('rounded-sm');
    expect(selectElement.className).toContain('bg-vscode-dropdown');
  });
});
