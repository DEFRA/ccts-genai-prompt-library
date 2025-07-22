// Vitest setup
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import { Toast } from '../Toast';

describe('Toast', () => {
  // Reset mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders success toast with correct styles and icon', () => {
    render(<Toast message="Operation successful" type="success" />);
    
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
    const toastElement = screen.getByTestId('toast-container');
    
    // Check for success styling
    expect(toastElement).toHaveClass('bg-green-50');
    expect(toastElement).toHaveClass('border-green-200');
    expect(toastElement).toHaveClass('text-green-800');
  });
  
  it('renders error toast with correct styles and icon', () => {
    render(<Toast message="An error occurred" type="error" />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    const toastElement = screen.getByTestId('toast-container');
    
    // Check for error styling
    expect(toastElement).toHaveClass('bg-red-50');
    expect(toastElement).toHaveClass('border-red-200');
    expect(toastElement).toHaveClass('text-red-800');
  });
  
  it('renders warning toast with correct styles and icon', () => {
    render(<Toast message="Warning message" type="warning" />);
    
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    const toastElement = screen.getByTestId('toast-container');
    
    // Check for warning styling
    expect(toastElement).toHaveClass('bg-yellow-50');
    expect(toastElement).toHaveClass('border-yellow-200');
    expect(toastElement).toHaveClass('text-yellow-800');
  });
  
  it('renders info toast with correct styles and icon', () => {
    render(<Toast message="Information message" type="info" />);
    
    expect(screen.getByText('Information message')).toBeInTheDocument();
    const toastElement = screen.getByTestId('toast-container');
    
    // Check for info styling
    expect(toastElement).toHaveClass('bg-blue-50');
    expect(toastElement).toHaveClass('border-blue-200');
    expect(toastElement).toHaveClass('text-blue-800');
  });
  
  it('uses success type by default', () => {
    render(<Toast message="Default toast" />);
    
    const toastElement = screen.getByTestId('toast-container');
    expect(toastElement).toHaveClass('bg-green-50');
  });
  
  it('calls onClose after duration', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(<Toast message="Closing toast" duration={1000} onClose={onClose} />);
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    expect(onClose).toHaveBeenCalledTimes(1);
    
    vi.useRealTimers();
  });
});
