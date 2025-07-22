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

describe('apiSelector Azure OpenAI policy violation (main)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should handle Azure OpenAI policy violations', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: {
            message: 'The response was filtered due to the prompt triggering Azure OpenAI\'s content filtering system.'
          }
        })
      })
    ) as any;
    const { submitToLLM } = await import('../apiSelector');
    await expect(submitToLLM('test prompt')).rejects.toMatchObject({
      error: {
        message: expect.stringContaining('content filtering system')
      }
    });
  });
}); 