import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * LoadingIndicator Component
 * Displays a loading animation with three animated bouncing dots
 */
export const LoadingIndicator = () => (
  <div className="flex items-center gap-1 text-vscode-fg mt-4" data-testid="loading-indicator">
    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.2s' }} />
    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0.4s' }} />
  </div>
);

/**
 * MarkdownCodeBlock Component
 * Renders code blocks in markdown with syntax highlighting
 */
export const MarkdownCodeBlock = ({ inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className ?? '');
  if (!inline && match) {
    return (
      <SyntaxHighlighter
        language={match[1]}
        style={tomorrow}
        PreTag="div"
        customStyle={{
          margin: 0,
          background: 'var(--vscode-editor-background)',
          padding: '1rem',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  }
  return <code className={className} {...props}>{children}</code>;
};
