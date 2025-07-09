import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelectSection } from '../MultiSelectSection';
import { CustomSection } from '../../../types';
import '@testing-library/jest-dom';

// Mock Lucide icon
vi.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown Icon</div>,
}));

describe('MultiSelectSection', () => {
  // Mock props and functions
  const mockHandleMultiSelectChange = vi.fn((id, option, checked, current) => 
    checked ? current.filter(v => v !== option) : [...current, option]
  );
  const mockSetSelectedMultiSections = vi.fn();
  const mockHandleCheckAll = vi.fn();
  const mockHandleUncheckAll = vi.fn();
  
  // Sample section for testing
  const mockSection: CustomSection = {
    id: 'multiselect1',
    name: 'Test MultiSelect',
    type: 'multiselect',
    description: 'Select multiple options',
    required: true,
    options: ['Option 1', 'Option 2', 'Option 3']
  };

  // Sample section without optional fields
  const mockSectionMinimal: CustomSection = {
    id: 'multiselect2',
    name: 'Minimal MultiSelect',
    type: 'multiselect',
    options: ['Option A', 'Option B']
  };

  // Sample section with placeholder
  const mockSectionWithPlaceholder: CustomSection = {
    id: 'multiselect3',
    name: 'Placeholder MultiSelect',
    type: 'multiselect',
    placeholder: 'Choose multiple options...',
    options: ['Item 1', 'Item 2', 'Item 3']
  };

  const mockSelectedMultiSections = {
    multiselect1: ['Option 1'],
    multiselect2: [],
    multiselect3: ['Item 1', 'Item 2']
  };

  const mockErrors = {
    multiselect1: ''
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
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
        handleCheckAll={mockHandleCheckAll}
        handleUncheckAll={mockHandleUncheckAll}
      />
    );

    // Assert
    expect(screen.getByText('Test MultiSelect')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    expect(screen.getByText('Select multiple options')).toBeInTheDocument(); // Description
    expect(screen.getByText('1 selected')).toBeInTheDocument(); // Selected count
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument(); // Dropdown icon
  });

  // Test case 2: Should render with minimal props
  it('should render with minimal props', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSectionMinimal}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Minimal MultiSelect')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument(); // No required indicator
    expect(screen.queryByText('Select multiple options')).not.toBeInTheDocument(); // No description
    expect(screen.getByText('Select options...')).toBeInTheDocument(); // Default placeholder
  });

  // Test case 3: Should render with custom placeholder
  it('should render with custom placeholder', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSectionWithPlaceholder}
        selectedMultiSections={{}} // Empty selected items for this test
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={{}}
      />
    );

    // Assert
    expect(screen.getByText('Choose multiple options...')).toBeInTheDocument(); // Custom placeholder
  });

  // Test case 4: Should open dropdown when button is clicked
  it('should open dropdown when button is clicked', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
        handleCheckAll={mockHandleCheckAll}
        handleUncheckAll={mockHandleUncheckAll}
      />
    );

    // Act
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Assert - check if dropdown options are visible
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  // Test case 5: Should toggle option selection when clicked
  it('should toggle option selection when clicked', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Act - click on "Option 2" to select it
    const option2 = screen.getByLabelText('Option 2');
    fireEvent.click(option2);

    // Assert
    expect(mockSetSelectedMultiSections).toHaveBeenCalled();
  });
  // Test case 6: Should check if "Option 1" is already selected
  it('should show "Option 1" as checked', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Assert - find the checkbox directly
    // The checkbox is inside the label element for "Option 1"
    const option1Checkbox = screen.getByRole('checkbox', { name: 'Option 1' });
    expect(option1Checkbox).toBeChecked();
  });

  // Test case 7: Should call handleCheckAll when "Select All" is clicked
  it('should call handleCheckAll when "Select All" is clicked', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
        handleCheckAll={mockHandleCheckAll}
        handleUncheckAll={mockHandleUncheckAll}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Act - click on "Select All" button
    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    // Assert
    expect(mockHandleCheckAll).toHaveBeenCalledWith('multiselect1', ['Option 1', 'Option 2', 'Option 3']);
  });

  // Test case 8: Should call handleUncheckAll when "Clear All" is clicked
  it('should call handleUncheckAll when "Clear All" is clicked', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
        handleCheckAll={mockHandleCheckAll}
        handleUncheckAll={mockHandleUncheckAll}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Act - click on "Clear All" button
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    // Assert
    expect(mockHandleUncheckAll).toHaveBeenCalledWith('multiselect1');
  });

  // Test case 9: Should display error message when provided
  it('should display error message when provided', () => {
    // Arrange
    const errorsWithMessage = {
      multiselect1: 'Please select at least one option'
    };

    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Assert
    expect(screen.getByText('Please select at least one option')).toBeInTheDocument();
  });

  // Test case 10: Should apply error styling to dropdown when there's an error
  it('should apply error styling to dropdown when there is an error', () => {
    // Arrange
    const errorsWithMessage = {
      multiselect1: 'Please select at least one option'
    };

    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={errorsWithMessage}
      />
    );

    // Get the dropdown button
    const dropdownButton = screen.getByText('1 selected').closest('button');
    
    // Assert
    expect(dropdownButton?.className).toContain('border-vscode-error');
  });

  // Test case 11: Should not render Select All and Clear All when handlers are not provided
  it('should not render Select All and Clear All when handlers are not provided', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
        // No handleCheckAll or handleUncheckAll props
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Assert
    expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  // Test case 12: Should close dropdown when clicking outside
  it('should close dropdown when clicking outside', () => {
    // Arrange
    render(
      <MultiSelectSection 
        section={mockSection}
        selectedMultiSections={mockSelectedMultiSections}
        handleMultiSelectChange={mockHandleMultiSelectChange}
        setSelectedMultiSections={mockSetSelectedMultiSections}
        templateSectionErrors={mockErrors}
      />
    );

    // Open dropdown
    const dropdownButton = screen.getByText('1 selected').closest('button');
    if (dropdownButton) {
      fireEvent.click(dropdownButton);
    }

    // Assert dropdown is open
    expect(screen.getByText('Option 1')).toBeInTheDocument();

    // Act - simulate click outside
    fireEvent.mouseDown(document.body);

    // Assert dropdown is closed - options should no longer be visible
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });
});
