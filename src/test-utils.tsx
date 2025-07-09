import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './contexts/ThemeContext';

// Add any providers, theme, or other wrappers here
const AllTheProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { container?: HTMLElement }
) => {
  // Ensure a valid DOM container is used for React 18+
  const container =
    options?.container ||
    document.body.appendChild(document.createElement('div'));
  return render(ui, { wrapper: AllTheProviders, container, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
