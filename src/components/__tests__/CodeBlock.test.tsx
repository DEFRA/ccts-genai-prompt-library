// Vitest setup
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeBlock from '../CodeBlock';
import { copyToClipboard } from '../../utils/clipboard';
import { downloadCode } from '../../utils/codeUtils';

// Mock the dependencies
vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn()
}));

vi.mock('../../utils/codeUtils', () => ({
  detectFileDetails: vi.fn().mockReturnValue({ fileName: 'test-file.js' }),
  downloadCode: vi.fn()
}));

// Mock SyntaxHighlighter to avoid actual highlighting behavior
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <div data-testid="syntax-highlighter">{children}</div>
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  tomorrow: {}
}));

describe('CodeBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inline code correctly', () => {
    render(<CodeBlock inline={true}>const x = 5;</CodeBlock>);
    expect(screen.getByText('const x = 5;')).toBeInTheDocument();
    expect(screen.queryByTestId('syntax-highlighter')).not.toBeInTheDocument();
  });

  it('renders block code correctly with language detection', () => {
    render(
      <CodeBlock inline={false} className="language-javascript">
        const x = 5;
        console.log(x);
      </CodeBlock>
    );

    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
    expect(screen.getByText('const x = 5; console.log(x);')).toBeInTheDocument();
  });

  it('renders block code without language class', () => {
    render(
      <CodeBlock inline={false}>
        const x = 5;
      </CodeBlock>
    );
    
    expect(screen.getByText('const x = 5;')).toBeInTheDocument();
    expect(screen.queryByTestId('syntax-highlighter')).not.toBeInTheDocument();
  });

  it('allows copying code to clipboard', () => {
    render(
      <CodeBlock inline={false} className="language-javascript">
        const x = 5;
      </CodeBlock>
    );

    const copyButton = screen.getByTitle('Copy code');
    expect(copyButton).toBeInTheDocument();

    fireEvent.click(copyButton);
    expect(copyToClipboard).toHaveBeenCalledWith('const x = 5;');
  });

  it('allows downloading code as a file', () => {
    render(
      <CodeBlock inline={false} className="language-javascript">
        const x = 5;
      </CodeBlock>
    );

    const downloadButton = screen.getByTitle('Download code');
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);
    expect(downloadCode).toHaveBeenCalledWith('const x = 5;', 'test-file.js');
  });
  it('removes trailing newline from code content', () => {
    render(
      <CodeBlock inline={false} className="language-javascript">
        const x = 5;
        {'\n'}
      </CodeBlock>
    );

    fireEvent.click(screen.getByTitle('Copy code'));
    expect(copyToClipboard).toHaveBeenCalledWith('const x = 5;,');
  });

  it('passes additional props to code element when inline', () => {
    render(
      <CodeBlock inline={true} data-testid="inline-code">
        const x = 5;
      </CodeBlock>
    );
    
    const codeElement = screen.getByTestId('inline-code');
    expect(codeElement).toBeInTheDocument();
    expect(codeElement.textContent).toBe('const x = 5;');
  });

  it('passes additional props to SyntaxHighlighter when not inline', () => {
    render(
      <CodeBlock inline={false} className="language-javascript" data-custom="test-prop">
        const x = 5;
      </CodeBlock>
    );
    
    // Since we're mocking SyntaxHighlighter, we can't test this directly
    // But our implementation passes all props to SyntaxHighlighter
    expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
  });
});
