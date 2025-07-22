// Vitest setup
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { Modal } from '../Modal';

describe('Modal', () => {
  // Clean up any mocks after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div data-testid="modal-content">Modal Content</div>
      </Modal>
    );
    
    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument();
  });
  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Find the backdrop button using the test ID
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when escape key is pressed', () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal Content</div>
      </Modal>
    );
    
    // Simulate escape key press
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('hides header when hideHeader is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" hideHeader={true}>
        <div>Modal Content</div>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('applies correct size class based on size prop', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <div>Modal Content</div>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-w-lg');
  });
});
