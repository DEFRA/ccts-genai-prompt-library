import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';

interface MessageGroup {
  id: string;
  messages: ChatMessage[];
  timestamp: string;
}

interface ChatInterfaceProps {
  conversationId?: string;
  initialContent?: string;
  onUpdateContent?: (content: string | ((prev: string) => string)) => void;
  messages?: ChatMessage[];
  onMessagesUpdate?: (messages: ChatMessage[]) => void;
  className?: string;
}

const ChatInterface = ({
  conversationId = 'mock-conversation-id',
  initialContent = '',
  onUpdateContent,
  messages = [],
  onMessagesUpdate,
  className = ''
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate the scrollToBottom behavior
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setInputValue(prev => prev + '\n\nFile content:\n' + content);
        }
      };
      reader.readAsText(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Create user message
      const userMessage: ChatMessage = {
        role: 'user',
        content: inputValue,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Update messages with user message
      const updatedMessages = [...messages, userMessage];
      if (onMessagesUpdate) {
        onMessagesUpdate(updatedMessages);
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create mock assistant response
      const aiResponse = `Mock response to: ${inputValue}`;
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      
      // Update messages with AI response
      if (onMessagesUpdate) {
        onMessagesUpdate([...updatedMessages, aiMessage]);
      }

      // Update content if callback provided
      if (onUpdateContent) {
        onUpdateContent(aiResponse);
      }

      // Reset form state
      setInputValue('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      const element = document.getElementById(messageId);
      if (element) {
        element.classList.add('copied');
        setTimeout(() => {
          element.classList.remove('copied');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };
  const renderContent = (content: string) => {
    return <div className="message-content">{content}</div>;
  };
  
  // Group messages by sender (user/assistant)
  const groupMessages = (messages: ChatMessage[]): MessageGroup[] => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    messages.forEach((message) => {
      if (!currentGroup || currentGroup.messages[0].role !== message.role) {
        currentGroup = {
          id: `group-${groups.length}`,
          messages: [message],
          timestamp: message.timestamp
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
        currentGroup.timestamp = message.timestamp;
      }
    });

    return groups;
  };

  // Render individual message
  const renderMessage = (message: ChatMessage, index: number, groupId: string, totalMessages: number) => {
    const messageId = `${groupId}-message-${index}-${message.timestamp}`;
    const isLastMessage = index === totalMessages - 1;
    
    return (
      <button
        key={messageId}
        id={messageId}
        className={`message ${!isLastMessage ? 'border-b border-vscode-border' : ''}`}
        onClick={() => copyMessage(message.content, messageId)}
      >
        <div className="message-header">
          <span className="role">
            {message.role === 'assistant' ? 'Assistant' : 'You'}
          </span>
          <span className="timestamp">{message.timestamp}</span>
        </div>
        {renderContent(message.content)}
      </button>
    );
  };

  // Render message group
  const renderMessageGroup = (group: MessageGroup) => {
    const isAssistant = group.messages[0].role === 'assistant';
    const groupClassName = `message-group ${isAssistant ? 'assistant' : 'user'} max-w-[85%] ${
      isAssistant ? 'bg-vscode-section border border-vscode-border' : 'bg-vscode-button'
    }`;
    
    return (
      <div key={group.id} className={groupClassName}>
        {group.messages.map((message, index) => 
          renderMessage(message, index, group.id, group.messages.length)
        )}
      </div>
    );
  };

  // Render message groups
  const renderMessageGroups = () => {
    const groups = groupMessages(messages);
    return groups.map(renderMessageGroup);
  };

  return (
    <div className={`chat-interface ${className}`}>
      <section className="messages-container" aria-label="Chat messages area">
        {renderMessageGroups()}
        <div ref={messagesEndRef} data-testid="message-end" />
      </section>
      
      <form onSubmit={handleSubmit} className="message-form">
        {selectedFile && (
          <div className="selected-file">
            <div className="file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">({formatFileSize(selectedFile.size)})</span>
            </div>
            <button
              type="button"
              onClick={removeSelectedFile}
              className="remove-file-button"
              aria-label="Remove file"
            >
              X
            </button>
          </div>
        )}

        <div className="input-container">
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isSubmitting}
            className="message-input"
          />
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.md,.json,.yaml,.xml,.csv"
            data-testid="file-input"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="attach-button"
            disabled={isSubmitting}
          >
            <svg className="lucide-paperclip" viewBox="0 0 24 24" width="24" height="24">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!inputValue.trim() || isSubmitting}
          className="send-button"
        >
          {isSubmitting ? (
            <div className="loading-spinner animate-spin" />
          ) : (
            <svg className="lucide-send" viewBox="0 0 24 24" width="24" height="24">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
        <div className="keyboard-shortcuts">
        <span>Press <kbd>Enter</kbd> to send</span>
        <span>Press <kbd>Shift</kbd> + <kbd>Enter</kbd> for new line</span>
      </div>
    </div>  );
};

export default ChatInterface;
