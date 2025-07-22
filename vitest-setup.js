// vitest-setup.js
import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import './browser-setup';
import React from 'react';
import './src/test-mocks';

// Configure React testing correctly for React 18
vi.mock('react-dom/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createRoot: (container) => ({
      render: (element) => {
        // This mimics what createRoot does but in a way that works in tests
        Object.defineProperty(container, 'firstChild', { 
          get: () => element 
        });
        return {
          unmount: vi.fn()
        };
      }
    })
  };
});

// Add missing browser globals
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollIntoView since it's not available in JSDOM
Element.prototype.scrollIntoView = vi.fn();

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
};

// Add IntersectionObserver mock
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  
  // Helper for tests to trigger intersection
  triggerIntersection(entries) {
    this.callback(entries, this);
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(callback => {
  setTimeout(callback, 0);
  return 0;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn();

// No need to extend with matchers as @testing-library/jest-dom now auto-registers
