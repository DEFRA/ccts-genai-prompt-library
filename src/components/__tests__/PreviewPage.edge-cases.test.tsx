import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { act } from '@testing-library/react';
import PreviewPage from '../PreviewPage';
import React from 'react';

// Mock the clipboard utility
vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: vi.fn(),
  __esModule: true
}));

// Mock the API service
vi.mock('../../services/apiSelector', () => ({
  submitToLLM: vi.fn(),
  __esModule: true
}));

// Mock the store
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn().mockReturnValue({ isAdmin: true }),
  __esModule: true
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Import mocks after they're defined
import { copyToClipboard } from '../../utils/clipboard';
import { submitToLLM } from '../../services/apiSelector';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';

describe('PreviewPage edge cases and error handling', () => {
  const onBackMock = vi.fn();
  const onCopyMock = vi.fn();
  const validContent = `
### Role:
Data Scientist

### Action:
Create a machine learning model

### Context:
Using the customer data

### Execute:
Use Python and scikit-learn
`;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    onBackMock.mockReset();
    onCopyMock.mockReset();
    vi.mocked(copyToClipboard).mockClear().mockResolvedValue(true);
    vi.mocked(useStore).mockReturnValue({ isAdmin: true });
    vi.mocked(toast.error).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Clipboard error handling', () => {
    it('should handle clipboard copy failure gracefully', async () => {
      // Arrange
      vi.mocked(copyToClipboard).mockRejectedValue(new Error('Clipboard API not available'));

      // Act
      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Assert - should not crash and should show error in console
      expect(screen.getByText('Preview')).toBeInTheDocument();
      
      // Wait for the clipboard error to be handled
      await waitFor(() => {
        expect(vi.mocked(copyToClipboard)).toHaveBeenCalled();
      });
    });

    it('should handle copy code failure in chat UI', async () => {
      // Arrange
      vi.mocked(copyToClipboard)
        .mockResolvedValueOnce(true) // Initial copy succeeds
        .mockRejectedValueOnce(new Error('Copy failed')); // Code copy fails

      vi.mocked(submitToLLM).mockResolvedValue('Test response');

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Act - submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Try to copy the response - use the copy button in the chat UI
      const copyButtons = screen.getAllByText('Copy');
      const chatCopyButton = copyButtons[1]; // The second copy button is in the chat UI
      fireEvent.click(chatCopyButton);

      // Assert - should handle error gracefully
      await waitFor(() => {
        expect(vi.mocked(copyToClipboard)).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('File handling edge cases', () => {
    it('should handle FileReader error when reading file', async () => {
      // Arrange
      const mockFileReader = {
        readAsText: vi.fn(),
        onerror: null as any,
        onload: null as any,
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - select a file
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
      
      // Simulate FileReader error
      fireEvent.change(fileInput, { target: { files: [file] } });
      if (typeof mockFileReader.onerror === 'function') {
        mockFileReader.onerror(new Error('File read error'));
      }

      // Assert - should handle error gracefully (no crash, UI still present)
      expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
    });

    it('should handle no file selected in file input', async () => {
      // Arrange
      vi.mocked(copyToClipboard).mockResolvedValue(true);
      
      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - trigger file input change with no files
      const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      // Assert - should handle gracefully without crashing
      expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
    });
  });

  describe('Keyboard event handling', () => {
    it('should handle Escape key to close LLM response', async () => {
      // Arrange
      vi.mocked(submitToLLM).mockResolvedValue('Test response');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });

      // Assert - should close LLM response and call onBack
      await waitFor(() => {
        expect(onBackMock).toHaveBeenCalled();
      });
    });

    it('should handle Ctrl+Enter to submit to LLM', async () => {
      // Arrange
      vi.mocked(submitToLLM).mockResolvedValue('Test response');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Act - press Ctrl+Enter
      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });

      // Assert - should submit to LLM
      await waitFor(() => {
        expect(submitToLLM).toHaveBeenCalled();
      });
    });
  });

  describe('Initial state handling', () => {
    it('should handle initial LLM response prop', async () => {
      // Arrange
      const initialResponse = '### Assistant Response (12:00:00)\nInitial response content';
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      // Act
      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
            initialLlmResponse={initialResponse}
          />
        );
      });

      // Assert - should show chat UI with initial response
      expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      // The content is rendered in markdown, so we check for the markdown container
      const markdownElements = screen.getAllByTestId('markdown');
      expect(markdownElements.length).toBeGreaterThan(0);
    });

    it('should handle initial error prop', async () => {
      // Arrange
      const initialError = {
        message: 'Initial error message',
        timestamp: new Date().toISOString(),
        context: 'Test context'
      };
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      // Act
      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
            initialError={initialError}
          />
        );
      });

      // Assert - should show error UI
      expect(screen.getByText('Initial error message')).toBeInTheDocument();
    });
  });

  describe('Content processing edge cases', () => {
    it('should handle invalid content type', async () => {
      // Arrange
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      // Act
      await act(async () => {
        render(
          <PreviewPage
            content={null as any}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      // Assert - should show error toast
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Invalid content provided');
      });
    });

    it('should handle content with missing RACE components', async () => {
      // Arrange
      const invalidContent = `
### Context:
Some context

### Execute:
Some execution steps
`;

      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={invalidContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      // Assert - should show error toast
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Could not extract RACE components from the content');
      });
    });

    it('should handle RACE component extraction failure', async () => {
      // Arrange
      const malformedContent = 'This is not a valid RACE format at all';

      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={malformedContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      // Assert - should show error toast
      await waitFor(() => {
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith('Could not extract RACE components from the content');
      });
    });
  });

  describe('Chat input edge cases', () => {
    it('should handle empty chat input submission', async () => {
      // Arrange
      vi.mocked(submitToLLM).mockResolvedValue('Test response');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - try to submit empty chat input
      const submitButtons = screen.getAllByRole('button');
      const sendButton = submitButtons.find(button => button.getAttribute('type') === 'submit');
      if (sendButton) {
        fireEvent.click(sendButton);
      }

      // Assert - should not submit empty input
      expect(submitToLLM).toHaveBeenCalledTimes(1); // Only the initial submission
    });

    it('should handle chat input with only whitespace', async () => {
      // Arrange
      vi.mocked(submitToLLM).mockResolvedValue('Test response');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - try to submit whitespace-only input
      const chatInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(chatInput, { target: { value: '   ' } });

      const submitButtonsWhitespace = screen.getAllByRole('button');
      const sendButtonWhitespace = submitButtonsWhitespace.find(button => button.getAttribute('type') === 'submit');
      if (sendButtonWhitespace) {
        fireEvent.click(sendButtonWhitespace);
      }

      // Assert - should not submit whitespace-only input
      expect(submitToLLM).toHaveBeenCalledTimes(1); // Only the initial submission
    });
  });

  describe('Keyboard event handling', () => {
    it('should handle Escape key to close LLM response', async () => {
      // Arrange
      vi.mocked(submitToLLM).mockResolvedValue('Test response');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - press Escape key on the input
      const chatInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.keyDown(chatInput, { key: 'Escape', code: 'Escape' });

      // Assert - should close the LLM response
      expect(screen.queryByText('AI Response & Chat')).not.toBeInTheDocument();
    });

    it('should handle Ctrl+Enter to submit to LLM', async () => {
      // Arrange
      vi.mocked(submitToLLM).mockResolvedValue('Test response');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - press Ctrl+Enter on the input
      const chatInput = screen.getByPlaceholderText('Type your message...');
      fireEvent.change(chatInput, { target: { value: 'Test message' } });
      fireEvent.keyDown(chatInput, { key: 'Enter', code: 'Enter', ctrlKey: true });

      // Wait for the submission to complete
      await waitFor(() => {
        expect(submitToLLM).toHaveBeenCalledTimes(2); // Initial + chat submission
      });

      // Assert - should submit the message (already checked above)
    });
  });

  describe('File handling edge cases', () => {
    it('should handle FileReader error when reading file', async () => {
      // Arrange
      const mockFileReader = {
        readAsText: vi.fn(),
        onerror: null as any,
        onload: null as any,
      };
      
      global.FileReader = vi.fn(() => mockFileReader) as any;
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - try to attach a file
      const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      // Simulate FileReader error
      fireEvent.change(fileInput, { target: { files: [file] } });
      if (mockFileReader.onerror) {
        mockFileReader.onerror(new Error('File read error'));
      }

      // Assert - should handle error gracefully
      expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
    });

    it('should handle no file selected in file input', async () => {
      // Arrange
      vi.mocked(copyToClipboard).mockResolvedValue(true);
      
      await act(async () => {
        render(
          <PreviewPage
            content={validContent}
            onBack={onBackMock}
            onCopy={onCopyMock}
            isOpen={true}
          />
        );
      });

      // Submit to LLM to show chat UI
      const submitButton = screen.getByText('Submit');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
      });

      // Act - try to attach a file but no file selected
      const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [] } });

      // Assert - should handle gracefully
      expect(screen.getByText('AI Response & Chat')).toBeInTheDocument();
    });
  });

  describe('Component cleanup', () => {
    it('should cleanup timeouts on unmount', async () => {
      // Arrange
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      vi.mocked(copyToClipboard).mockResolvedValue(true);

      const { unmount } = render(
        <PreviewPage
          content={validContent}
          onBack={onBackMock}
          onCopy={onCopyMock}
          isOpen={true}
        />
      );

      // Wait for the component to mount and set up timeouts
      await waitFor(() => {
        expect(vi.mocked(copyToClipboard)).toHaveBeenCalled();
      });

      // Act
      unmount();

      // Assert - should cleanup timeouts
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });
}); 