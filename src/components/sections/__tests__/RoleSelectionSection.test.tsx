import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoleSelectionSection } from '../RoleSelectionSection';
import '@testing-library/jest-dom';

describe('RoleSelectionSection', () => {
  // Mock props
  const mockSetSelectedRole = vi.fn();
  
  // Sample roles for testing
  const mockRoles = [
    { id: 'role1', name: 'Developer' },
    { id: 'role2', name: 'Designer' },
    { id: 'role3', name: 'Product Manager' }
  ];

  // Test case 1: Should render with all provided props
  it('should render with all provided props', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise="role1"
        allRoles={mockRoles}
        selectedRole=""
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Assert
    expect(screen.getByText('Role')).toBeInTheDocument(); // Label
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Select element
    expect(screen.getByText('Developer')).toBeInTheDocument(); // Option from roles
    expect(screen.getByText('Designer')).toBeInTheDocument(); // Option from roles
    expect(screen.getByText('Product Manager')).toBeInTheDocument(); // Option from roles
  });

  // Test case 2: Should select roleFromExpertise when no selectedRole is provided
  it('should select roleFromExpertise when no selectedRole is provided', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise="role1"
        allRoles={mockRoles}
        selectedRole=""
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Assert
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('role1');
  });

  // Test case 3: Should prioritize selectedRole over roleFromExpertise
  it('should prioritize selectedRole over roleFromExpertise', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise="role1"
        allRoles={mockRoles}
        selectedRole="role2"
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Assert
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('role2');
  });

  // Test case 4: Should show default option when no selectedRole or roleFromExpertise is provided
  it('should show default option when no selectedRole or roleFromExpertise is provided', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise=""
        allRoles={mockRoles}
        selectedRole=""
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Assert
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('');
    expect(screen.getByText('Choose a Role')).toBeInTheDocument();
  });

  // Test case 5: Should call setSelectedRole when a new option is selected
  it('should call setSelectedRole when a new option is selected', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise="role1"
        allRoles={mockRoles}
        selectedRole=""
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Act
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'role3' } });

    // Assert
    expect(mockSetSelectedRole).toHaveBeenCalledWith('role3');
  });

  // Test case 6: Should render with empty roles array
  it('should render with empty roles array', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise=""
        allRoles={[]}
        selectedRole=""
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Assert
    // Should still render the select element but with only the default option
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    expect(screen.getByText('Choose a Role')).toBeInTheDocument();
    expect(selectElement.children.length).toBe(1); // Only the default option
  });

  // Test case 7: Should have correct CSS classes
  it('should have correct CSS classes for styling', () => {
    // Arrange
    render(
      <RoleSelectionSection 
        roleFromExpertise=""
        allRoles={mockRoles}
        selectedRole=""
        setSelectedRole={mockSetSelectedRole}
      />
    );

    // Assert
    const label = screen.getByText('Role');
    expect(label).toHaveClass('block', 'text-xs', 'font-medium', 'text-gray-700', 'dark:text-gray-300');
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveClass('w-full', 'text-[0.75rem]', 'p-2', 'border', 'dark:border-dark-border', 'rounded-lg');
  });
});
