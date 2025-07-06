import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingIndicator, MarkdownCodeBlock } from '../EnhancePromptModal.components';

// Mock the SyntaxHighlighter component since it's used in MarkdownCodeBlock
vi.mock('react-syntax-highlighter', () => ({
  Prism: vi.fn(({ children, ...props }) => <pre data-testid="syntax-highlighter">{children}</pre>),
  default: vi.fn(({ children }) => <pre data-testid="syntax-highlighter">{children}</pre>),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  tomorrow: {}
}));

describe('EnhancePromptModal helper components', () => {  describe('LoadingIndicator', () => {
    it('renders three bouncing dots', () => {
      // Act
      render(<LoadingIndicator />);
      
      // Assert
      const container = screen.getByTestId('loading-indicator');
      expect(container).toBeInTheDocument();
      expect(container.children.length).toBe(3);
      
      // Check if all three dots have the animate-bounce class
      Array.from(container.children).forEach(child => {
        expect(child).toHaveClass('animate-bounce');
      });
    });
  });

  describe('MarkdownCodeBlock', () => {
    it('renders SyntaxHighlighter when a language is specified', () => {
      // Arrange
      const props = {
        inline: false,
        className: 'language-javascript',
        children: 'const x = 42;'
      };
      
      // Act
      render(<MarkdownCodeBlock {...props} />);
      
      // Assert
      expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
      expect(screen.getByText('const x = 42;')).toBeInTheDocument();
    });

    it('renders regular code element for inline code', () => {
      // Arrange
      const props = {
        inline: true,
        className: 'language-javascript',
        children: 'const x = 42;'
      };
      
      // Act
      render(<MarkdownCodeBlock {...props} />);
      
      // Assert
      const codeElement = screen.getByText('const x = 42;');
      expect(codeElement.tagName).toBe('CODE');
      expect(codeElement).toHaveClass('language-javascript');
    });

    it('renders regular code element when no language is specified', () => {
      // Arrange
      const props = {
        inline: false,
        className: '',
        children: 'const x = 42;'
      };
      
      // Act
      render(<MarkdownCodeBlock {...props} />);
      
      // Assert
      const codeElement = screen.getByText('const x = 42;');
      expect(codeElement.tagName).toBe('CODE');
    });
  });
});
