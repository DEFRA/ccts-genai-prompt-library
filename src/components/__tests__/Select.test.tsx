// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { Select } from '../Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select', () => {
  it('renders all options correctly', () => {
    render(
      <Select 
        options={mockOptions}
        value=""
        onChange={vi.fn()}
      />
    );
    
    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('shows the selected value', () => {
    const selectedValue = 'option2';
    
    render(
      <Select 
        options={mockOptions}
        value={selectedValue}
        onChange={vi.fn()}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue(selectedValue);
  });

  it('shows the placeholder when provided', () => {
    const placeholder = 'Select an option';
    
    render(
      <Select 
        options={mockOptions}
        value=""
        onChange={vi.fn()}
        placeholder={placeholder}
      />
    );
    
    expect(screen.getByText(placeholder)).toBeInTheDocument();
  });

  it('calls onChange handler when an option is selected', () => {
    const onChangeMock = vi.fn();
    
    render(
      <Select 
        options={mockOptions}
        value=""
        onChange={onChangeMock}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option3' } });
    
    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith('option3');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-select-class';
    
    render(
      <Select 
        options={mockOptions}
        value=""
        onChange={vi.fn()}
        className={customClass}
      />
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveClass(customClass);
  });
});
