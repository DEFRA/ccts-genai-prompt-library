// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the error message when provided', () => {
    const errorMessage = 'This is an error message';
    render(<ErrorMessage error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-vscode-error');
  });

  it('renders nothing when no error is provided', () => {
    const { container } = render(<ErrorMessage />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when error is an empty string', () => {
    const { container } = render(<ErrorMessage error="" />);
    expect(container.firstChild).toBeNull();
  });
});
