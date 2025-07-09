// ChatInterface.test.tsx
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from './ChatInterface';
import React from 'react';

const mockClipboard = {
  writeText: vi.fn()
};

beforeAll(() => {
  Object.defineProperty(global.navigator, 'clipboard', {
    value: mockClipboard,
    writable: true
  });
});

describe('ChatInterface', () => {
  const baseProps = {
    conversationId: 'test-convo',
    initialContent: '',
    onUpdateContent: vi.fn(),
    messages: [],
    onMessagesUpdate: vi.fn(),
    className: 'test-class'
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockClipboard.writeText.mockReset();
  });

  it('renders with default props', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    // Find the form by class instead of role
    const form = document.querySelector('form.message-form');
    expect(form).toBeInTheDocument();
  });

  it('renders with custom props and className', () => {
    render(<ChatInterface {...baseProps} />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    // Find the form by class instead of role
    const form = document.querySelector('form.message-form');
    expect(form).toBeInTheDocument();
    expect(screen.getByTestId('message-end')).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<ChatInterface {...baseProps} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });
    expect(textarea).toHaveValue('Hello world');
  });

  it('disables input and send button when submitting', async () => {
    render(<ChatInterface {...baseProps} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    // Find the submit button by class only (avoid getByRole ambiguity)
    const submitButton = Array.from(screen.getAllByRole('button')).find(
      btn => btn.classList.contains('send-button')
    );
    expect(submitButton).toBeDefined();
    fireEvent.click(submitButton!);
    expect(textarea).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('calls onMessagesUpdate and onUpdateContent on submit', async () => {
    const onMessagesUpdate = vi.fn();
    const onUpdateContent = vi.fn();
    render(<ChatInterface {...baseProps} onMessagesUpdate={onMessagesUpdate} onUpdateContent={onUpdateContent} />);
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    // Find the submit button by class only (avoid getByRole ambiguity)
    const submitButton = Array.from(screen.getAllByRole('button')).find(
      btn => btn.classList.contains('send-button')
    );
    expect(submitButton).toBeDefined();
    await act(async () => {
      fireEvent.click(submitButton!);
      await waitFor(() => {
        expect(onMessagesUpdate).toHaveBeenCalled();
        expect(onUpdateContent).toHaveBeenCalled();
      });
    });
  });

  it('shows file info and removes file on click', async () => {
    render(<ChatInterface {...baseProps} />);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 100 });
    const fileInput = screen.getByTestId('file-input');
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    const removeButton = screen.getByLabelText('Remove file');
    fireEvent.click(removeButton);
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
  });

  it('alerts if file is larger than 10MB', () => {
    window.alert = vi.fn();
    render(<ChatInterface {...baseProps} />);
    const file = new File(['a'.repeat(11 * 1024 * 1024)], 'big.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(window.alert).toHaveBeenCalledWith('File size must be less than 10MB');
  });

  it('copies message content to clipboard on message click', async () => {
    const messages = [
      { role: 'user' as const, content: 'Hello', timestamp: '10:00' },
      { role: 'assistant' as const, content: 'Hi there!', timestamp: '10:01' }
    ];
    render(<ChatInterface {...baseProps} messages={messages} />);
    const messageButtons = screen.getAllByRole('button');
    await act(async () => {
      fireEvent.click(messageButtons[0]);
    });
    expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello');
  });

  it('renders grouped messages by role', () => {
    const messages = [
      { role: 'user' as const, content: 'A', timestamp: '1' },
      { role: 'user' as const, content: 'B', timestamp: '2' },
      { role: 'assistant' as const, content: 'C', timestamp: '3' }
    ];
    render(<ChatInterface {...baseProps} messages={messages} />);
    expect(screen.getAllByText('You').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Assistant').length).toBeGreaterThan(0);
  });

  it('renders keyboard shortcuts', () => {
    render(<ChatInterface {...baseProps} />);
    // There are two "Press" elements, so use getAllByText
    const pressElements = screen.getAllByText(/Press/);
    expect(pressElements.length).toBeGreaterThan(1);
    expect(screen.getByText(/Shift/)).toBeInTheDocument();
  });
});
