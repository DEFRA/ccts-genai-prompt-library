import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import { RealTimePreview } from '../RealTimePreview';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children, components }: any) => {
    const CodeBlock = components?.code;
    return (
      <div data-testid="react-markdown">
        {children}
        {CodeBlock && (
          <CodeBlock 
            node={{ type: 'code' }}
            inline={false}
            className="language-javascript"
          >
            console.log('test');
          </CodeBlock>
        )}
        {CodeBlock && (
          <CodeBlock 
            node={{ type: 'code' }}
            inline={true}
            className="language-text"
          >
            inline code
          </CodeBlock>
        )}
      </div>
    );
  }
}));

// Mock react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language, style, ...props }: any) => (
    <pre data-testid="syntax-highlighter" data-language={language} {...props}>
      {children}
    </pre>
  )
}));

// Mock react-syntax-highlighter styles
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: { backgroundColor: '#1e1e1e' }
}));

describe('RealTimePreview', () => {
  it('should render with content', () => {
    // Arrange
    const content = '# Test Content\n\nThis is a test.';

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render empty content', () => {
    // Arrange
    const content = '';

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with markdown content', () => {
    // Arrange
    const content = `
# Heading 1
## Heading 2

**Bold text**
*Italic text*

\`\`\`javascript
console.log('Hello World');
\`\`\`

\`inline code\`
    `;

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with code blocks', () => {
    // Arrange
    const content = `
\`\`\`javascript
function test() {
  return 'test';
}
\`\`\`
    `;

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with inline code', () => {
    // Arrange
    const content = 'This is `inline code` in a sentence.';

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with different programming languages', () => {
    // Arrange
    const content = `
\`\`\`python
def hello():
    print("Hello World")
\`\`\`

\`\`\`typescript
const greeting: string = "Hello World";
console.log(greeting);
\`\`\`
    `;

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with complex markdown', () => {
    // Arrange
    const content = `
# Main Title

## Section 1

This is a paragraph with **bold** and *italic* text.

### Subsection

- List item 1
- List item 2
  - Nested item
- List item 3

1. Numbered item 1
2. Numbered item 2

> This is a blockquote

\`\`\`javascript
// JavaScript code block
function example() {
  const message = "Hello World";
  console.log(message);
  return message;
}
\`\`\`

\`inline code example\`

[Link text](https://example.com)

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
    `;

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should handle special characters in content', () => {
    // Arrange
    const content = `
# Test with Special Characters

- & < > " '
- \` \` \` \` \`
- { } [ ] ( )
- @ # $ % ^ & *
    `;

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with very long content', () => {
    // Arrange
    const content = '# Long Content\n\n'.repeat(1000);

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });

  it('should render with unicode characters', () => {
    // Arrange
    const content = `
# Unicode Test

- 🚀 Rocket
- 🌟 Star
- 💻 Computer
- 🎉 Party

\`\`\`javascript
// Unicode in comments
const emoji = "🚀"; // rocket
const message = "Hello 世界"; // hello world in Chinese
\`\`\`
    `;

    // Act
    render(<RealTimePreview content={content} />);

    // Assert
    expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
  });
});
