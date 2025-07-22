import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CodeBlockCard } from '../EnhancePromptModal.CodeBlockCard';

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon" />,
  Download: () => <div data-testid="download-icon" />
}));

// Mock the SyntaxHighlighter component
vi.mock('react-syntax-highlighter', () => ({
  Prism: vi.fn(({ children, ...props }) => (
    <pre data-testid="syntax-highlighter">{children}</pre>
  ))
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  tomorrow: {}
}));

describe('CodeBlockCard', () => {
  const mockBlock = {
    language: 'javascript',
    content: 'const x = 42;',
    fileName: 'example.js',
    extension: '.js'
  };
  
  const mockOnCopy = vi.fn();
  const mockOnDownload = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with the correct content', () => {
    // Act
    render(
      <CodeBlockCard 
        block={mockBlock} 
        onCopy={mockOnCopy} 
        onDownload={mockOnDownload} 
      />
    );
    
    // Assert
    expect(screen.getByText('const x = 42;')).toBeInTheDocument();
    expect(screen.getByText('example.js')).toBeInTheDocument();
  });
  
  it('calls onCopy when copy button is clicked', () => {
    // Arrange
    render(
      <CodeBlockCard 
        block={mockBlock} 
        onCopy={mockOnCopy} 
        onDownload={mockOnDownload} 
      />
    );
    
    // Act
    const copyButton = screen.getByLabelText(/copy code/i);
    fireEvent.click(copyButton);
    
    // Assert
    expect(mockOnCopy).toHaveBeenCalledWith('const x = 42;');
  });
  
  it('calls onDownload when download button is clicked', () => {
    // Arrange
    render(
      <CodeBlockCard 
        block={mockBlock} 
        onCopy={mockOnCopy} 
        onDownload={mockOnDownload} 
      />
    );
    
    // Act
    const downloadButton = screen.getByLabelText(/download code/i);
    fireEvent.click(downloadButton);
    
    // Assert
    expect(mockOnDownload).toHaveBeenCalledWith('const x = 42;', 'example.js');
  });
});
