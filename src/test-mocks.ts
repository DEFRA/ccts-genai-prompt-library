import { vi } from 'vitest';
import React from 'react';

// Mock for react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
}));

// Mock for react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }) => {
    return React.createElement('div', { 'data-testid': 'markdown' }, children);
  },
}));

// Mock for react-syntax-highlighter
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => {
    return React.createElement('pre', { 'data-testid': 'syntax-highlighter' }, children);
  },
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  tomorrow: {},
}));

// Mock for textarea-autosize
vi.mock('react-textarea-autosize', () => ({
  default: (props) => React.createElement('textarea', { ...props, 'data-testid': 'textarea-autosize' }),
}));

// Mock for react-beautiful-dnd if used
vi.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({ innerRef: vi.fn(), droppableProps: {} }),
  Draggable: ({ children }) => children({ innerRef: vi.fn(), draggableProps: {} }),
}));

// Add more component mocks as needed
