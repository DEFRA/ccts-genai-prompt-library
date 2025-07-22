import { vi } from 'vitest';

// Mock URL functions if they don't exist
if (typeof URL.createObjectURL === 'undefined') {
  Object.defineProperty(URL, 'createObjectURL', {
    value: vi.fn(() => 'mock-url'),
    writable: true,
  });
}

if (typeof URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
  });
}

// Mock Blob
if (typeof Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(content, options) {
      this.content = content;
      this.options = options;
    }
    
    text() {
      return Promise.resolve(
        this.content && this.content[0] ? String(this.content[0]) : ''
      );
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
  };
}

// Set up File API if needed
if (typeof File === 'undefined') {
  global.File = class File extends Blob {
    constructor(content, name, options = {}) {
      super(content, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

// Setup document body and element methods for tests
if (typeof document !== 'undefined') {
  // Ensure we have a proper document.body for React 18 createRoot
  if (!document.body) {
    const div = document.createElement('div');
    div.id = 'root';
    
    // Create proper mocks for DOM methods
    div.appendChild = vi.fn();
    div.removeChild = vi.fn();
    div.innerHTML = '';
    div.getBoundingClientRect = vi.fn(() => ({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 800,
      height: 600
    }));
    
    Object.defineProperty(document, 'body', {
      get: () => div,
      configurable: true
    });
  }

  // Make sure document has an appropriate head
  if (!document.head) {
    const head = document.createElement('head');
    Object.defineProperty(document, 'head', {
      get: () => head,
      configurable: true
    });
  }

  // Create a safe mock for document.getElementById
  const originalGetElementById = document.getElementById;
  document.getElementById = function(id) {
    if (id === 'root' && (!originalGetElementById || !originalGetElementById.call(document, id))) {
      // Create a root element if it doesn't exist
      const rootElement = document.createElement('div');
      rootElement.id = 'root';
      return rootElement;
    }
    
    if (typeof originalGetElementById === 'function') {
      return originalGetElementById.call(document, id);
    }
    
    return null;
  };

  // Mock scrollHeight for textarea elements (needed for useAutoHeight)
  Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
    configurable: true,
    get: function() {
      return this.value ? this.value.split('\n').length * 20 : 20; // Simple calculation based on line count
    }
  });

  // Ensure createElement works properly for tests
  const originalCreateElement = document.createElement;
  document.createElement = function(tag) {
    if (typeof originalCreateElement === 'function') {
      const element = originalCreateElement.call(document, tag);
      
      // Add any missing methods that React might expect
      if (tag.toLowerCase() === 'a' && !element.setAttribute) {
        element.setAttribute = vi.fn((attr, value) => {
          element[attr] = value;
        });
      }
      
      // Ensure div elements have proper properties for React createRoot
      if (tag.toLowerCase() === 'div') {
        if (!element.appendChild) {
          element.appendChild = vi.fn();
        }
        if (!element.removeChild) {
          element.removeChild = vi.fn();
        }
      }
      
      return element;
    }
    
    // Fallback mock implementation
    const mockElement = {
      href: '',
      download: '',
      id: '',
      style: {},
      className: '',
      click: vi.fn(),
      setAttribute: vi.fn((attr, value) => {
        mockElement[attr] = value;
      }),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      childNodes: [],
      children: [],
      nodeType: 1,
      getAttribute: vi.fn(),
      hasAttribute: vi.fn(() => false),
      getBoundingClientRect: vi.fn(() => ({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 100,
        height: 100
      })),
    };
    
    return mockElement;
  };
}
