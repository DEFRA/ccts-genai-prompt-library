// Vitest setup
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '../../test-utils';
import MarkdownCodeBlockRenderer from '../MarkdownCodeBlockRenderer';

// Mock the CodeBlock component since we're only testing the renderer
vi.mock('../CodeBlock', () => ({
  default: (props) => {
    // Extract children for proper testing
    const { children, ...otherProps } = props;
    
    // Store props as data attributes for testing
    const dataProps = Object.entries(otherProps).reduce((acc, [key, value]) => {
      // Convert to kebab case for DOM compatibility
      const dataKey = `data-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      acc[dataKey] = typeof value === 'boolean' ? String(value) : value;
      return acc;
    }, {});
    
    return (
      <div 
        data-testid="code-block" 
        className={props.className} 
        {...dataProps}
      >
        {children}
      </div>
    );
  }
}));

describe('MarkdownCodeBlockRenderer', () => {  it('renders CodeBlock with passed props', () => {
    const testProps = {
      inline: false,
      className: 'language-javascript',
      children: 'const test = "Hello World";'
    };

    render(<MarkdownCodeBlockRenderer {...testProps} />);
    
    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toBeInTheDocument();
    // Check content is rendered
    expect(codeBlock).toHaveTextContent('const test = "Hello World"');
    // Check inline prop is passed through
    expect(codeBlock).toHaveAttribute('data-inline', 'false');
    expect(codeBlock).toHaveClass('language-javascript');
  });
  it('passes all props to CodeBlock', () => {
    const testProps = {
      inline: true,
      className: 'language-typescript',
      children: 'const x: number = 42;',
      customProp: 'test-value'
    };

    render(<MarkdownCodeBlockRenderer {...testProps} />);
    
    const codeBlock = screen.getByTestId('code-block');
    // Check content is rendered
    expect(codeBlock.textContent).toBe('const x: number = 42;');
    expect(codeBlock).toHaveClass('language-typescript');
    
    // Check custom prop is passed through as a data attribute
    expect(codeBlock).toHaveAttribute('data-custom-prop', 'test-value');
    expect(codeBlock).toHaveAttribute('data-inline', 'true');
  });
});
