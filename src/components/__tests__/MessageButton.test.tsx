// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { MessageButton } from '../MessageButton';
import { ChatMessage } from '../../types';

describe('MessageButton', () => {
  const mockMessage: ChatMessage = {
    role: 'user',
    content: 'Test message content',
    timestamp: '12:00 PM'
  };
  
  const mockRenderContent = (content: string) => <div data-testid="rendered-content">{content}</div>;
  
  it('renders message content and metadata correctly', () => {
    render(
      <MessageButton 
        message={mockMessage} 
        messageId="test-id" 
        isLast={false} 
        onCopy={() => {}} 
        renderContent={mockRenderContent} 
      />
    );
    
    // Check role label
    expect(screen.getByText('You')).toBeInTheDocument();
    
    // Check timestamp
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    
    // Check rendered content
    expect(screen.getByTestId('rendered-content')).toBeInTheDocument();
    expect(screen.getByText('Test message content')).toBeInTheDocument();
  });

  it('displays "Assistant" label for assistant messages', () => {
    const assistantMessage: ChatMessage = {
      ...mockMessage,
      role: 'assistant'
    };
    
    render(
      <MessageButton 
        message={assistantMessage} 
        messageId="test-id" 
        isLast={false} 
        onCopy={() => {}} 
        renderContent={mockRenderContent} 
      />
    );
    
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  it('calls onCopy with correct parameters when clicked', () => {
    const mockOnCopy = vi.fn();
    
    render(
      <MessageButton 
        message={mockMessage} 
        messageId="test-id" 
        isLast={false} 
        onCopy={mockOnCopy} 
        renderContent={mockRenderContent} 
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockOnCopy).toHaveBeenCalledWith('Test message content', 'test-id');
  });

  it('has border bottom when not last message', () => {
    render(
      <MessageButton 
        message={mockMessage} 
        messageId="test-id" 
        isLast={false}
        onCopy={() => {}} 
        renderContent={mockRenderContent} 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('border-b');
  });

  it('does not have border bottom when last message', () => {
    render(
      <MessageButton 
        message={mockMessage} 
        messageId="test-id" 
        isLast={true} 
        onCopy={() => {}} 
        renderContent={mockRenderContent} 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('border-b');
  });
});
