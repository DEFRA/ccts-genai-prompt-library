// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnCancel = vi.fn();
  const mockOnConfirm = vi.fn();
  const mockMessage = 'Are you sure you want to proceed?';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders when isOpen is true', () => {
    render(
      <ConfirmDialog 
        isOpen={true}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        message={mockMessage}
      />
    );
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText(mockMessage)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });
  
  it('does not render when isOpen is false', () => {
    render(
      <ConfirmDialog 
        isOpen={false}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        message={mockMessage}
      />
    );
    
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    expect(screen.queryByText(mockMessage)).not.toBeInTheDocument();
  });
  
  it('renders custom title when provided', () => {
    const customTitle = 'Custom Dialog Title';
    render(
      <ConfirmDialog 
        isOpen={true}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        message={mockMessage}
        title={customTitle}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog 
        isOpen={true}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        message={mockMessage}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
  
  it('calls onCancel when backdrop is clicked', () => {
    render(
      <ConfirmDialog 
        isOpen={true}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        message={mockMessage}
      />
    );
    
    fireEvent.click(screen.getByLabelText('Close dialog'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
  
  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog 
        isOpen={true}
        onCancel={mockOnCancel}
        onConfirm={mockOnConfirm}
        message={mockMessage}
      />
    );
    
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });
});
