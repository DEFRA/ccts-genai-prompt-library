import React from 'react';
import { ChatMessage } from '../types';

type MessageButtonProps = {
  readonly message: ChatMessage;
  readonly messageId: string;
  readonly isLast: boolean;
  readonly onCopy: (content: string, messageId: string) => void;
  readonly renderContent: (content: string) => React.ReactNode;
};

export function MessageButton({ message, messageId, isLast, onCopy, renderContent }: MessageButtonProps) {
  return (
    <button
      key={messageId}
      id={messageId}
      type="button"
      className={`p-3 w-full text-left${!isLast ? ' border-b border-vscode-border' : ''}`}
      onClick={() => onCopy(message.content, messageId)}
      aria-label="Copy message to clipboard"
    >
      {/* Message Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-vscode-fg">
          {message.role === 'assistant' ? 'Assistant' : 'You'}
        </span>
        <span className="text-xs text-vscode-fg">
          {message.timestamp}
        </span>
      </div>
      {/* Message Content */}
      <div className="prose prose-sm dark:prose-invert max-w-none text-vscode-fg">
        {renderContent(message.content)}
      </div>
    </button>
  );
}