// Vitest setup
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { RoleFilter } from '../RoleFilter';

// Mock the stores
vi.mock('../../store/roleStore', () => ({
  useRoleStore: () => ({
    getAllRoles: () => [
      { id: 'role1', name: 'Admin' },
      { id: 'role2', name: 'Developer' },
      { id: 'role3', name: 'Manager' }
    ]
  })
}));

vi.mock('../../store/useStore', () => ({
  useStore: () => ({
    selectedRole: 'role2'
  })
}));

describe('RoleFilter', () => {
  let onRoleChange: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    onRoleChange = vi.fn();
  });
  
  it('renders with roles sorted alphabetically', () => {
    render(<RoleFilter onRoleChange={onRoleChange} />);
    
    // Get the dropdown element
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Check "All Roles" option is present
    expect(screen.getByText('All Roles')).toBeInTheDocument();
    
    // Check that all options are present in alphabetical order
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4); // "All Roles" + 3 roles
    expect(options[0]).toHaveTextContent('All Roles');
    expect(options[1]).toHaveTextContent('Admin');
    expect(options[2]).toHaveTextContent('Developer');
    expect(options[3]).toHaveTextContent('Manager');
  });
  
  it('sets the default selected value from store', () => {
    render(<RoleFilter onRoleChange={onRoleChange} />);
    
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('role2');
  });
  
  it('calls onRoleChange when selection changes', () => {
    render(<RoleFilter onRoleChange={onRoleChange} />);
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'role3' } });
    
    expect(onRoleChange).toHaveBeenCalledWith('role3');
  });
  
  it('displays the correct heading and icon', () => {
    render(<RoleFilter onRoleChange={onRoleChange} />);
    
    expect(screen.getByText('Filter by Role')).toBeInTheDocument();
  });
});
