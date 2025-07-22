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
  isAzureOpenAIConfigured: vi.fn(() => true),
  COMPLIANT_SYSTEM_MESSAGE: 'You are a professional assistant...'
}));

// Mock serperSearch
vi.mock('../serperSearch', () => ({
  performSerperSearch: vi.fn(() => Promise.resolve([])),
  fetchDDaTFrameworkInfo: vi.fn(() => Promise.resolve(''))
}));

describe('apiSelector missing message content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should handle missing message content', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ choices: [{}] })
      })
    ) as any;
    const { submitToLLM } = await import('../apiSelector');
    await expect(submitToLLM('test prompt')).rejects.toThrow('No API keys configured. Please configure either Azure OpenAI key.');
  });
}); 