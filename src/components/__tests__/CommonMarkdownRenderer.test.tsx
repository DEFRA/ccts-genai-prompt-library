// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import CommonMarkdownRenderer from '../CommonMarkdownRenderer';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children, components }) => (
    <div data-testid="react-markdown" data-components={JSON.stringify(Object.keys(components || {}))}>
      {children}
    </div>
  )
}));

// Mock MarkdownCodeBlockRenderer
vi.mock('../MarkdownCodeBlockRenderer', () => ({
  default: () => <div data-testid="markdown-code-block-renderer" />
}));

describe('CommonMarkdownRenderer', () => {
  it('renders ReactMarkdown with the provided content', () => {
    const testContent = '# Test Markdown Content';
    render(<CommonMarkdownRenderer content={testContent} />);
    
    const reactMarkdown = screen.getByTestId('react-markdown');
    expect(reactMarkdown).toBeInTheDocument();
    expect(reactMarkdown.textContent).toBe(testContent);
  });
  
  it('configures ReactMarkdown with the code component', () => {
    render(<CommonMarkdownRenderer content="test" />);
    
    const reactMarkdown = screen.getByTestId('react-markdown');
    const componentsData = JSON.parse(reactMarkdown.getAttribute('data-components') || '[]');
    
    // Check that the 'code' component is configured
    expect(componentsData).toContain('code');
  });
});
