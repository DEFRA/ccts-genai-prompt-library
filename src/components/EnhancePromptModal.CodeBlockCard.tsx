import React from 'react';
import { Copy, Download } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Interface for code block data
 */
export interface CodeBlock {
  language: string;
  content: string;
  fileName: string;
  extension: string;
}

/**
 * CodeBlockCard Component
 * Renders a code block with syntax highlighting and controls
 */
export const CodeBlockCard: React.FC<{
  block: CodeBlock;
  onCopy: (content: string) => void;
  onDownload: (content: string, fileName: string) => void;
}> = ({ block, onCopy, onDownload }) => {
  return (
    <div className="relative mt-4 first:mt-0">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 bg-gray-100/50 dark:bg-gray-800/50">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {block.fileName}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(block.content)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Copy code"
              aria-label="Copy code"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(block.content, block.fileName)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Download file"
              aria-label="Download code"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <SyntaxHighlighter
          language={block.language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            background: 'transparent',
            padding: '1rem',
          }}
        >
          {block.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
