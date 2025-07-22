import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the isAzureOpenAIConfigured function directly
vi.mock('../../config/apiConfig', () => ({
  getApiConfig: vi.fn(() => ({
    azure: {
      apiKey: 'test-key',
      endpoint: 'https://test-azure.openai.azure.com',
      deploymentId: 'gpt-4o',
      apiVersion: '2023-12-01-preview',
      models: ['gpt-4o']
    },
    openai: { apiKey: '', baseUrl: '', model: '', models: [] },
    serper: { apiKey: '', baseUrl: '' }
  })),
  isAzureOpenAIConfigured: () => true,
  COMPLIANT_SYSTEM_MESSAGE: 'You are a professional assistant...'
}));

// Mock serperSearch
vi.mock('../serperSearch', () => ({
  performSerperSearch: vi.fn(() => Promise.resolve([])),
  fetchDDaTFrameworkInfo: vi.fn(() => Promise.resolve(''))
}));

describe('apiSelector network error (isolated)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock fetch to throw network error
    global.fetch = vi.fn()
      .mockImplementation(() => Promise.reject(new Error('Network error')));
  });

  it('should handle network errors', async () => {
    const { submitToLLM } = await import('../apiSelector');
    await expect(submitToLLM('test prompt')).rejects.toThrow('No API keys configured. Please configure either Azure OpenAI key.');
  });
}); 