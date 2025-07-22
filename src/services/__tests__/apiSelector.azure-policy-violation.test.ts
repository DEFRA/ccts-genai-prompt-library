import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the config BEFORE any imports
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
  AZURE_API_VERSION: '2023-12-01-preview',
  COMPLIANT_SYSTEM_MESSAGE: 'You are a professional assistant...'
}));

describe('apiSelector Azure OpenAI policy violation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to ensure fresh imports
    vi.resetModules();
  });

  it('should handle Azure OpenAI policy violations', async () => {
    // Mock fetch to return a policy violation error
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

    // Import after mocks are set up
    const { submitToLLM } = await import('../apiSelector');
    await expect(submitToLLM('test prompt')).rejects.toMatchObject({
      error: {
        message: expect.stringContaining('content filtering system')
      }
    });
  });
}); 