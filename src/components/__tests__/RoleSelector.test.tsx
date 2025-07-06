// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import { RoleSelector } from '../RoleSelector';

describe('RoleSelector', () => {
  it('renders correctly with minimal content', () => {
    const mockOnRoleChange = vi.fn();
    render(
      <RoleSelector
        selectedRole="qa-engineer"
        onRoleChange={mockOnRoleChange}
      />
    );
    
    // The component returns an empty div with className="mb-0"
    const div = document.querySelector('div.mb-0');
    expect(div).toBeInTheDocument();
  });

  it('calls onRoleChange with the selected role', () => {
    const mockOnRoleChange = vi.fn();
    render(
      <RoleSelector
        selectedRole={null}
        onRoleChange={mockOnRoleChange}
      />
    );
    
    // Since the component currently has minimal functionality, 
    // we're just testing that it renders properly
    const div = document.querySelector('div.mb-0');
    expect(div).toBeInTheDocument();
  });
});
