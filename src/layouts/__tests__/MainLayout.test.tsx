// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import MainLayout from '../MainLayout';
import { BrowserRouter } from 'react-router-dom';

// Mock the Sidebar component
vi.mock('../../components/Sidebar', () => ({
  Sidebar: ({ setShowEnhancePrompt }: { setShowEnhancePrompt: () => void }) => (
    <div data-testid="mock-sidebar">Sidebar</div>
  ),
}));

// Mock the Outlet component from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>,
  };
});

describe('MainLayout', () => {
  it('renders the layout with sidebar and main content', () => {
    // Arrange
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Assert
    // Check if sidebar is rendered
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    
    // Check if outlet content is rendered
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    
    // Check if main container has correct classes
    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('flex-1', 'ml-16', 'transition-all', 'duration-300', 'ease-in-out', 'overflow-y-auto', 'scrollbar-hide');
  });

  it('maintains correct structure with nested divs', () => {
    // Arrange
    const { container } = render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Assert
    // Check outer container
    const outerContainer = container.firstChild as HTMLElement;
    expect(outerContainer).toHaveClass('flex', 'min-h-screen', 'bg-gray-100', 'dark:bg-dark-bg');

    // Check inner structure
    const mainContent = screen.getByRole('main');
    const innerDivs = mainContent.querySelectorAll('div');
    expect(innerDivs[0]).toHaveClass('pt-2');
    expect(innerDivs[1]).toHaveClass('min-h-[calc(100vh-3rem)]');
  });

  it('renders with proper accessibility structure', () => {
    // Arrange
    render(
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    );

    // Assert
    // Check if main landmark is present
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    // Verify main content is accessible
    expect(mainElement).toBeVisible();
    expect(mainElement).not.toHaveAttribute('aria-hidden');
  });
});
