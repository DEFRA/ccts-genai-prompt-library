import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { initializeStores, areStoresReady } from '../store/initializeStores';
import * as ReactDOM from 'react-dom/client';

// Provide a default export with createRoot in the mock.
vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn((root: HTMLElement | null) => {
      if (!root) throw new Error("Root element not found");
      return { render: vi.fn() };
    })
  }
}));

vi.mock('../App', () => ({
  default: vi.fn(() => <div data-testid="app-component">App Component</div>)
}));

vi.mock('../store/initializeStores', () => ({
  initializeStores: vi.fn(),
  areStoresReady: vi.fn()
}));

describe('main.tsx', () => {
  // Setup DOM for tests
  let rootElement: HTMLElement;
  
  beforeEach(() => {
    // Create a root element for our tests
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
    
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Clear any previously added classes to document
    document.documentElement.className = '';
    
    // Clear any console error spies
    vi.restoreAllMocks();
  });
  
  afterEach(() => {
    // Clean up the DOM after tests
    if (document.body.contains(rootElement)) {
      document.body.removeChild(rootElement);
    }
    // Reset modules to start fresh for each test
    vi.resetModules();
  });
  
  it('should add dark-theme class to documentElement', async () => {
    // Import the module to trigger the side effect
    await import('../main');
    
    // Assert that the dark-theme class was added
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });
  
  it('should initialize stores and render the app on success', async () => {
    // Configure mocks for success.
    vi.mocked(initializeStores).mockResolvedValue(undefined);
    vi.mocked(areStoresReady).mockReturnValue(true);
    
    // Spy on getElementById so that it returns our root element.
    const getElementByIdSpy = vi.spyOn(document, 'getElementById');
    getElementByIdSpy.mockReturnValue(rootElement);
    
    // Import the module to trigger initApp.
    await import('../main');
    
    await vi.waitFor(() => {
      // Ensure initializeStores and areStoresReady have been called.
      expect(initializeStores).toHaveBeenCalledTimes(1);
      expect(areStoresReady).toHaveBeenCalledTimes(1);
      expect(getElementByIdSpy).toHaveBeenCalledWith("root");
      
      // Using the mock call history:
      const mockedCreateRoot = (ReactDOM as any).default.createRoot;
      // Assert createRoot was called at least once with our rootElement.
      expect(mockedCreateRoot.mock.calls.length).toBeGreaterThan(0);
      expect(mockedCreateRoot.mock.calls[0][0]).toBe(rootElement);
      
      // Retrieve the instance returned by createRoot.
      const firstInstance = mockedCreateRoot.mock.results[0].value;
      expect(firstInstance.render).toHaveBeenCalled();
    });
  });
  
  it('should handle store initialization failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(initializeStores).mockResolvedValue(undefined);
    vi.mocked(areStoresReady).mockReturnValue(false);
    
    await import('../main');
    
    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize app:',
        expect.any(Error)
      );
    });
  });
  
  it('should handle exceptions during initialization', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(initializeStores).mockRejectedValue(new Error('Test initialization error'));
    
    await import('../main');
    
    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize app:',
        expect.any(Error)
      );
    });
  });
  
  it('should handle missing root element gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Here we force getElementById("root") to return null.
    vi.spyOn(document, 'getElementById').mockReturnValue(null);
    
    vi.mocked(initializeStores).mockResolvedValue(undefined);
    vi.mocked(areStoresReady).mockReturnValue(true);
    
    await import('../main');
    
    await vi.waitFor(() => {
      // Since our createRoot mock now throws if passed null,
      // we expect an error to be caught and logged.
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to initialize app:',
        expect.any(Error)
      );
    });
  });
});