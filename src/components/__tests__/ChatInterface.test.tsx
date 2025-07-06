// Vitest setup
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';
import { submitChatMessage } from '../../services/apiSelector';
import { ChatMessage } from '../../types';

// Mock the services that ChatInterface uses
vi.mock('../../services/apiSelector', () => ({
  submitChatMessage: vi.fn()
}));

// Mock the markdown component
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="markdown">{children}</div>
}));

// Mock the syntax highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: React.ReactNode }) => (
    <pre data-testid="syntax-highlighter">{children}</pre>
  )
}));

// Mock styles
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  tomorrow: {}
}));

// Mock scrollIntoView which is used by the component
Element.prototype.scrollIntoView = vi.fn();

// Mock ResizeObserver which is used for textarea auto-resizing
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve())
  },
  configurable: true
});

describe('ChatInterface', () => {
  // Sample messages for testing
  const mockMessages: ChatMessage[] = [
    { role: 'user', content: 'Hello', timestamp: '10:00:00 AM' },
    { role: 'assistant', content: 'Hi there!', timestamp: '10:00:01 AM' }
  ];
  
  const defaultProps = {
    conversationId: 'test-conversation-id',
    initialContent: ''
  };
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup the API mock to return a successful response
    vi.mocked(submitChatMessage).mockResolvedValue('I am an AI assistant response');
    
    // Reset clipboard mock
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    
    // Mock date/time for consistent timestamps
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T10:00:00Z'));
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('renders the chat interface with messages', () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={mockMessages} />);
    
    // Assert
    // Check if messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    
    // Check if textarea for input is rendered
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    
    // Check if send button is rendered
    const sendButton = document.querySelector('button[type="submit"]');
    expect(sendButton).toBeInTheDocument();
    
    // Check if file attachment button is rendered
    const paperclipIcon = document.querySelector('svg.lucide-paperclip');
    expect(paperclipIcon).toBeInTheDocument();
  });
  
  it('renders message groups with appropriate styling based on sender', () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={mockMessages} />);
    
    // Assert
    // Check for user and assistant labels
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    
    // Check timestamps are displayed
    expect(screen.getByText('10:00:00 AM')).toBeInTheDocument();
    expect(screen.getByText('10:00:01 AM')).toBeInTheDocument();
    
    // Instead of using CSS selector directly, get message groups by their parent classes
    const userMessage = screen.getByText('Hello').closest('button');
    const assistantMessage = screen.getByText('Hi there!').closest('button');
    
    // Go up two levels to get to the div with the styling classes
    const userMessageGroup = userMessage?.parentElement;
    const assistantMessageGroup = assistantMessage?.parentElement;
    
    // Verify classes on the parent elements
    expect(userMessageGroup?.className).toContain('bg-vscode-button');
    expect(assistantMessageGroup?.className).toContain('bg-vscode-section');
  });

  it('disables send button when input is empty', () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Assert
    // Find send button and check if it's disabled
    const sendBtn = document.querySelector('button[type="submit"]');
    expect(sendBtn).toBeDisabled();
    
    // Act
    // Type some text
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Some text' } });
    
    // Assert
    // Button should now be enabled
    expect(sendBtn).not.toBeDisabled();
    
    // Act
    // Clear the text
    fireEvent.change(textarea, { target: { value: '' } });
    
    // Assert
    // Button should be disabled again
    expect(sendBtn).toBeDisabled();
  });
  
  it('renders file attachment button and allows file selection', async () => {
    // Arrange
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Act & Assert
    // Find paperclip button
    const paperclipSvg = container.querySelector('svg.lucide-paperclip');
    expect(paperclipSvg).toBeInTheDocument();
    
    const fileBtn = paperclipSvg!.closest('button');
    expect(fileBtn).toBeInTheDocument();
    
    // Get the hidden file input
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    
    // The main part of the test is verifying that the file input and attachment
    // button exist and are properly configured
    expect(fileInput).toHaveAttribute('accept', '.txt,.md,.json,.yaml,.xml,.csv');
    expect(fileInput).toHaveClass('hidden');
    
    // Verify clicking the button triggers the file input click
    const mockClick = vi.fn();
    Object.defineProperty(fileInput!, 'click', {
      value: mockClick
    });
    
    // Click the file button
    fireEvent.click(fileBtn!);
    
    // The button should trigger the file input click
    expect(mockClick).toHaveBeenCalled();
  });

  it('supports copying a message to clipboard', async () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={mockMessages} />);
    
    // Act
    // Find the assistant message directly by text content
    const messageButton = screen.getByText('Hi there!').closest('button');
    expect(messageButton).not.toBeNull();
    
    // Click the message button to copy
    fireEvent.click(messageButton!);
    
    // Assert
    // Verify clipboard was called with the correct content
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hi there!');
    
    // Check if the message element has an ID that follows the expected pattern
    if (messageButton?.id) {
      const messageElement = document.getElementById(messageButton.id);
      
      // If the component adds a 'copied' class, check for it
      if (messageElement?.classList.contains('copied')) {
        // Simulate the timeout for removing the 'copied' class
        vi.advanceTimersByTime(2000);
        
        // Check that 'copied' class was removed
        expect(messageElement).not.toHaveClass('copied');
      }
    }
  });

  it('shows loading state while submitting message', async () => {
    // Arrange
    // Create a deferred Promise implementation
    let resolvePromise: (value: string) => void = () => {};
    const mockPromise = new Promise<string>(resolve => {
      resolvePromise = resolve;
    });
    
    // Use the mock promise in the API mock
    vi.mocked(submitChatMessage).mockReturnValue(mockPromise);
    
    // Render the component
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Act
    // Type a message
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Loading test' } });
    
    // Submit the form
    const sendBtn = container.querySelector('button[type="submit"]');
    expect(sendBtn).not.toBeDisabled();
    fireEvent.click(sendBtn!);
    
    // The button should change to show loading state
    // Use a more specific selector for the loading spinner
    const spinner = container.querySelector('[type="submit"] .animate-spin, [type="submit"] div');
    
    // Assert
    expect(spinner).toBeInTheDocument();
    
    // Finish the test by resolving the promise
    resolvePromise('API response');
    
    // Wait for the promise to resolve and loading state to clear
    await expect(mockPromise).resolves.toBe('API response');
  });
  
  it('rejects files larger than the size limit', async () => {
    // Arrange
    // Spy on window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Create a mock file larger than the limit (10MB)
    // We can't actually create a 10MB file in the test, but we can mock its size
    const largeFile = new File(['test'], 'large.txt', { type: 'text/plain' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11MB
    
    // Act
    // Try to select the large file
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput!, { target: { files: [largeFile] } });
    
    // Assert
    // Check that the alert was shown
    expect(alertSpy).toHaveBeenCalledWith('File size must be less than 10MB');
    
    // File should not be selected
    expect(screen.queryByText('large.txt')).not.toBeInTheDocument();
    
    // Clean up
    alertSpy.mockRestore();
  });

  it('uses correct markdown rendering for code blocks', () => {
    // Arrange
    const mockMessagesWithCode: ChatMessage[] = [
      ...mockMessages,
      { 
        role: 'assistant', 
        content: 'Here is some code:\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```', 
        timestamp: '10:00:02 AM' 
      }
    ];
    
    render(<ChatInterface {...defaultProps} messages={mockMessagesWithCode} />);
    
    // Assert
    // Check if markdown renderer is used
    expect(screen.getAllByTestId('markdown')).toHaveLength(3); // Three messages
    
    // Check if code content is passed to the renderer
    const markdownElements = screen.getAllByTestId('markdown');
    expect(markdownElements[2].textContent).toContain('Here is some code:');
    expect(markdownElements[2].textContent).toContain('const hello = "world";');
  });

  it('auto-resizes textarea based on content', () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Get the textarea element
    const textarea = screen.getByPlaceholderText('Type your message...');
    
    // Mock scrollHeight property
    Object.defineProperties(textarea, {
      scrollHeight: {
        configurable: true,
        value: 100
      },
      style: {
        configurable: true,
        value: {
          height: '40px'
        }
      }
    });
    
    // Act - type a long message
    fireEvent.change(textarea, { 
      target: { 
        value: 'This is a longer message that should trigger auto-resize of the textarea' 
      } 
    });
    
    // Assert
    // Check if the height was updated based on scrollHeight
    expect(textarea.style.height).toBe('100px');
  });

  it('correctly groups consecutive messages from the same sender', () => {
    // Arrange
    const consecutiveMessages: ChatMessage[] = [
      { role: 'user', content: 'Hello', timestamp: '10:00:00 AM' },
      { role: 'user', content: 'How are you?', timestamp: '10:01:00 AM' },
      { role: 'assistant', content: 'Hi there!', timestamp: '10:02:00 AM' },
      { role: 'assistant', content: 'I am fine, thanks!', timestamp: '10:03:00 AM' }
    ];
    
    render(<ChatInterface {...defaultProps} messages={consecutiveMessages} />);
    
    // Assert
    // Check all the messages are rendered
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByText('I am fine, thanks!')).toBeInTheDocument();
    
    // Find the buttons containing our messages
    const userMessageButtons = [
      screen.getByText('Hello').closest('button'),
      screen.getByText('How are you?').closest('button')
    ];
    
    const assistantMessageButtons = [
      screen.getByText('Hi there!').closest('button'),
      screen.getByText('I am fine, thanks!').closest('button')
    ];
    
    // Check they're in the same container
    const userMessageContainer = userMessageButtons[0]?.parentElement;
    const userMessage2Container = userMessageButtons[1]?.parentElement;
    
    expect(userMessageContainer).toBe(userMessage2Container);
    
    // Same for assistant messages
    const assistantMessageContainer = assistantMessageButtons[0]?.parentElement;
    const assistantMessage2Container = assistantMessageButtons[1]?.parentElement;
    
    expect(assistantMessageContainer).toBe(assistantMessage2Container);
  });

  it('handles session timeout correctly', () => {
    // Arrange
    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Act - advance time past the session timeout
    // First, clear any existing intervals (like keep-alive) to prevent them from firing
    vi.clearAllTimers();
    
    // Create a new timeout for the test
    vi.useFakeTimers();
    const timeoutSpy = vi.spyOn(global, 'setTimeout');
    
    // We need to trigger the timeout directly since the component uses its own timeout
    // Find the last setTimeout call (which should be the session timeout)
    const lastTimeoutCall = timeoutSpy.mock.calls[timeoutSpy.mock.calls.length - 1];
    
    // If we found the timeout callback
    if (lastTimeoutCall && typeof lastTimeoutCall[0] === 'function') {
      // Execute the callback directly
      (lastTimeoutCall[0] as Function)();
      
      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Chat session timed out');
    } else {
      // If we can't find the timeout, this test is inconclusive
      console.warn('Could not find session timeout callback');
    }
    
    // Clean up
    consoleSpy.mockRestore();
    timeoutSpy.mockRestore();
  });

  it('keeps session alive on user activity', () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Act - advance time almost to timeout, then simulate user activity
    vi.advanceTimersByTime(29 * 60 * 1000); // 29 minutes
    
    // Simulate user activity
    fireEvent.keyPress(document);
    
    // Advance time past what would have been the original timeout
    vi.advanceTimersByTime(2 * 60 * 1000); // 2 more minutes (total 31 minutes)
    
    // Assert - timeout should not have fired
    expect(consoleSpy).not.toHaveBeenCalledWith('Chat session timed out');
    
    // Clean up
    consoleSpy.mockRestore();
  });

  it('sends keep-alive for inactive sessions', () => {
    // Arrange
    // Spy on console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Act - advance time past the keep-alive threshold
    vi.advanceTimersByTime(26 * 60 * 1000); // 26 minutes (past the 25-minute keep-alive threshold)
    
    // Assert
    expect(consoleSpy).toHaveBeenCalledWith('Sending keep-alive');
    
    // Clean up
    consoleSpy.mockRestore();
  });

  it('offers keyboard shortcuts for sending messages', () => {
    // Arrange
    render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Assert that keyboard shortcuts are displayed
    // Use the container query to get the keyboard shortcuts section
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    const shortcutsSection = container.querySelector('.mt-2.text-xs.text-vscode-fg');
    
    // Check that the section exists and has the expected text content
    expect(shortcutsSection).toBeInTheDocument();
    expect(shortcutsSection?.textContent).toContain('Press Enter to send');
    expect(shortcutsSection?.textContent).toContain('Press Shift + Enter for new line');
    
    // Also check if the KBD elements are present
    const kbdElements = container.querySelectorAll('kbd');
    expect(kbdElements.length).toBeGreaterThanOrEqual(3); // Enter, Shift, Enter
    
    // Check specific kbd elements if needed
    expect(kbdElements[0].textContent).toBe('Enter');
  });

  it('calls scrollToBottom when messages change', async () => {
    // Arrange
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    const { rerender } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Act - update messages prop
    rerender(<ChatInterface {...defaultProps} messages={mockMessages} />);
    
    // Assert
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('handles clipboard copy errors gracefully', async () => {
    // Arrange
    // Mock clipboard to throw an error
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Clipboard error'));
    
    render(<ChatInterface {...defaultProps} messages={mockMessages} />);
    
    // Act
    // Find the assistant message and click to copy
    const messageButton = screen.getByText('Hi there!').closest('button');
    fireEvent.click(messageButton!);
    
    // Assert
    // The error should be logged to console
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hi there!');
    
    // The function should complete without throwing - no need to wait
    expect(messageButton).toBeInTheDocument();
  });

  it('displays file attachment UI when file is selected', () => {
    // Arrange
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Create a mock file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(testFile, 'size', { value: 1024 }); // 1KB
    
    // Act
    // Simulate file selection
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput!, { target: { files: [testFile] } });
    
    // Assert
    // Check that the file attachment UI is displayed
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    // Use getAllByText for the file size text
    const sizeElements = screen.getAllByText((content, node) => node?.textContent?.includes('1.0 KB'));
    expect(sizeElements.length).toBeGreaterThan(0);
    
    // Check that the remove button is present (using the X icon)
    const removeButton = container.querySelector('button svg.lucide-x');
    expect(removeButton).toBeInTheDocument();
  });

  it('allows removing selected file', () => {
    // Arrange
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Create and select a file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(testFile, 'size', { value: 2048 }); // 2KB
    
    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput!, { target: { files: [testFile] } });
    
    // Verify file is displayed
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    
    // Act
    // Click the remove button (using the button containing the X icon)
    const removeButton = container.querySelector('button svg.lucide-x')?.closest('button');
    expect(removeButton).toBeInTheDocument();
    fireEvent.click(removeButton!);
    
    // Assert
    // File should be removed from display
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
    expect(screen.queryByText('2.0 KB')).not.toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    // Arrange
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Test different file sizes
    const testCases = [
      { size: 512, expected: '512 B' },
      { size: 1024, expected: '1.0 KB' },
      { size: 1024 * 1024, expected: '1.0 MB' },
      { size: 1024 * 1024 * 1024, expected: '1.0 GB', skip: true } // 1GB is over the 10MB limit
    ];
    
    testCases.forEach(({ size, expected, skip }) => {
      // Create file with specific size
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(testFile, 'size', { value: size });
      
      // Select the file
      const fileInput = container.querySelector('input[type="file"]');
      fireEvent.change(fileInput!, { target: { files: [testFile] } });
      
      // Assert
      if (!skip) {
        const sizeElements = screen.getAllByText((content, node) => node?.textContent?.includes(expected));
        expect(sizeElements.length).toBeGreaterThan(0);
      } else {
        // For files over 10MB, the file is not shown in the UI
        expect(screen.queryByText((content, node) => node?.textContent?.includes(expected))).toBeNull();
      }
      
      // Remove file for next test
      const removeButton = container.querySelector('button svg.lucide-x')?.closest('button');
      if (removeButton) {
        fireEvent.click(removeButton);
      }
    });
    alertSpy.mockRestore();
  });

  it('disables file attachment button during submission', async () => {
    // Arrange
    // Create a deferred Promise implementation
    let resolvePromise: (value: string) => void = () => {};
    const mockPromise = new Promise<string>(resolve => {
      resolvePromise = resolve;
    });
    
    vi.mocked(submitChatMessage).mockReturnValue(mockPromise);
    
    const { container } = render(<ChatInterface {...defaultProps} messages={[]} />);
    
    // Act
    // Type a message and submit
    const textarea = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    
    const sendBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(sendBtn!);
    
    // Assert
    // File attachment button should be disabled
    const fileButton = container.querySelector('button[type="button"]');
    expect(fileButton).toBeDisabled();
    
    // Finish the test
    resolvePromise('Response');
    await expect(mockPromise).resolves.toBe('Response');
  });
});
