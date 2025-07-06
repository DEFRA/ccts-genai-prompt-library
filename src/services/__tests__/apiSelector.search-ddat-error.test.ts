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

// Mock serperSearch to throw errors
vi.mock('../serperSearch', () => ({
  performSerperSearch: vi.fn(() => Promise.reject(new Error('Search error'))),
  fetchDDaTFrameworkInfo: vi.fn(() => Promise.reject(new Error('DDaT error')))
}));

describe('apiSelector search and DDaT error handling', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock fetch to return successful response
    global.fetch = vi.fn()
      .mockImplementation(() => Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: 'Test response'
                }
              }
            ]
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      ));
  });

  it('should handle search and DDaT errors gracefully', async () => {
    const { submitChatMessage } = await import('../apiSelector');
    await expect(submitChatMessage('test message', 'initial content', [])).rejects.toThrow('Search error');
  });
}); 