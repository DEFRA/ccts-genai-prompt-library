import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = vi.fn();

describe('apiSelector network error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
    localStorageMock.clear.mockImplementation(() => {});
    localStorageMock.key.mockReturnValue(null);
  });

  it('should handle network errors', async () => {
    // Mock import.meta.env to provide the required environment variables
    vi.stubEnv('VITE_AZURE_OPENAI_KEY', 'test-azure-key');
    vi.stubEnv('VITE_AZURE_OPENAI_ENDPOINT', 'https://test-azure.openai.azure.com');
    vi.stubEnv('VITE_AZURE_OPENAI_DEPLOYMENT_ID', 'test-deployment');
    vi.stubEnv('VITE_OPENAI_API_KEY', 'test-openai-key');
    vi.stubEnv('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1');
    vi.stubEnv('VITE_OPENAI_MODEL', 'gpt-4o');

    // Import after setting environment variables
    const { submitToLLM } = await import('../apiSelector');
    
    // Mock fetch to throw network error for all calls (not just once)
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

    // Test that the function handles network errors gracefully
    // The function catches network errors and throws a fallback error
    await expect(submitToLLM('test prompt')).rejects.toThrow('No API keys configured');
  });
}); 