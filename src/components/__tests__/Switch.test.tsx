// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('renders with the correct label', () => {
    const label = 'Test Switch';
    render(<Switch checked={false} onChange={vi.fn()} label={label} />);
    
    // Get checkbox by role instead of label text
    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
    expect(switchElement).toHaveAttribute('aria-label', label);
  });

  it('renders as checked when checked prop is true', () => {
    render(<Switch checked={true} onChange={vi.fn()} label="Test Switch" />);
    
    const switchElement = screen.getByRole('checkbox');
    expect(switchElement).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const onChangeMock = vi.fn();
    render(<Switch checked={false} onChange={onChangeMock} label="Test Switch" />);
    
    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);
    
    expect(onChangeMock).toHaveBeenCalledTimes(1);
  });

  it('has the correct CSS classes', () => {
    const { container } = render(
      <Switch checked={false} onChange={vi.fn()} label="Test Switch" />
    );
    
    expect(container.querySelector('.switch')).toBeInTheDocument();
    expect(container.querySelector('.slider')).toBeInTheDocument();
    expect(container.querySelector('.round')).toBeInTheDocument();
  });
});
