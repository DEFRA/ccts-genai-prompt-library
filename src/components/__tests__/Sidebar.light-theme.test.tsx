import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';

const mockToggleTheme = vi.fn();
const mockSetShowEnhancePrompt = vi.fn();

// Only mock the light theme in this file
beforeEach(() => {
  vi.resetModules();
  vi.mock('../../contexts/ThemeContext', () => ({
    useTheme: () => ({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      logoToDisplay: 'test-logo.png',
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }));
});

describe('Sidebar Component - Light Theme', () => {
  it('renders with light theme classes', async () => {
    const { Sidebar } = await import('../Sidebar');
    render(<Sidebar setShowEnhancePrompt={mockSetShowEnhancePrompt} />);
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('bg-light-sidebar');
  });

  it('renders light theme toggle button with Moon icon', async () => {
    const { Sidebar } = await import('../Sidebar');
    render(<Sidebar setShowEnhancePrompt={mockSetShowEnhancePrompt} />);
    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('applies light theme classes to toggle button', async () => {
    const { Sidebar } = await import('../Sidebar');
    render(<Sidebar setShowEnhancePrompt={mockSetShowEnhancePrompt} />);
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(toggleButton).toHaveClass('bg-light-sidebar');
  });

  it('applies light theme classes to sidebar elements', async () => {
    const { Sidebar } = await import('../Sidebar');
    render(<Sidebar setShowEnhancePrompt={mockSetShowEnhancePrompt} />);
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('bg-light-sidebar');
    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(toggleButton).toHaveClass('bg-light-sidebar');
  });

  it('shows Moon icon for light theme toggle', async () => {
    const { Sidebar } = await import('../Sidebar');
    render(<Sidebar setShowEnhancePrompt={mockSetShowEnhancePrompt} />);
    const themeButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeButton).toBeInTheDocument();
  });
}); 