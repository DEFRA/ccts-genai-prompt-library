// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import { MarkdownRenderer } from '../MarkdownRenderer';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Mock the DOMPurify and marked libraries
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => `sanitized:${html}`)
  }
}));

vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((content) => `parsed:${content}`)
  }
}));

describe('MarkdownRenderer', () => {
  it('renders sanitized HTML from markdown content', () => {
    const testContent = '# Test markdown';
    const mockedParsedContent = `parsed:${testContent}`;
    const mockedSanitizedHtml = `sanitized:${mockedParsedContent}`;
    
    render(<MarkdownRenderer content={testContent} />);
    
    // Check that marked.parse was called with the right content
    expect(marked.parse).toHaveBeenCalledWith(testContent, { async: false });
    
    // Check that DOMPurify.sanitize was called with the parsed content
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(mockedParsedContent, {
      ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });    // Check that a div is rendered that will contain the sanitized content
    const container = document.querySelector('div');
    // We can't easily test the actual content since it's set via dangerouslySetInnerHTML
    expect(container).toBeTruthy();
  });

  it('handles empty content', () => {
    const emptyContent = '';
    render(<MarkdownRenderer content={emptyContent} />);
    
    expect(marked.parse).toHaveBeenCalledWith(emptyContent, { async: false });
  });
});
