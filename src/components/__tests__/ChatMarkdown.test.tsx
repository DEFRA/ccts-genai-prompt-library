// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import ChatMarkdown from '../ChatMarkdown';

// Mock the CommonMarkdownRenderer component
vi.mock('../CommonMarkdownRenderer', () => ({
  default: ({ content }) => <div data-testid="common-markdown-renderer">{content}</div>
}));

describe('ChatMarkdown', () => {
  it('renders CommonMarkdownRenderer with provided LLM response', () => {
    const testResponse = 'This is a test LLM response';
    render(<ChatMarkdown llmResponse={testResponse} />);
    
    const renderer = screen.getByTestId('common-markdown-renderer');
    expect(renderer).toBeInTheDocument();
    expect(renderer.textContent).toBe(testResponse);
  });
  
  it('renders CommonMarkdownRenderer with empty string when LLM response is null', () => {
    render(<ChatMarkdown llmResponse={null} />);
    
    const renderer = screen.getByTestId('common-markdown-renderer');
    expect(renderer).toBeInTheDocument();
    expect(renderer.textContent).toBe('');
  });
});
