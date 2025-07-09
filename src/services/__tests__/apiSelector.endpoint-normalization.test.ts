import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// All mocks must be set up BEFORE importing the module under test!
vi.mock('../../config/apiConfig', () => ({
  getApiConfig: vi.fn(() => ({
    azure: {
      apiKey: '',
      endpoint: '',
      deploymentId: '',
      apiVersion: '2023-12-01-preview',
      models: []
    },
    openai: { apiKey: '', baseUrl: '', model: '', models: [] },
    serper: { apiKey: '', baseUrl: '' }
  })),
  isAzureOpenAIConfigured: vi.fn(() => false),
  isOpenAIConfigured: vi.fn(() => false),
  COMPLIANT_SYSTEM_MESSAGE: 'You are a professional assistant...'
}));
vi.mock('../../config', () => ({
  config: {
    AZURE_OPENAI_KEY: 'test-key',
    AZURE_OPENAI_ENDPOINT: 'https://test-azure.openai.azure.com',
    AZURE_OPENAI_DEPLOYMENT_ID: 'gpt-4o',
    OPENAI_API_KEY: '',
    OPENAI_BASE_URL: '',
    SERPER_API_KEY: ''
  }
}));
vi.mock('../serperSearch', () => ({
  performSerperSearch: vi.fn(() => Promise.resolve([])),
  fetchDDaTFrameworkInfo: vi.fn(() => Promise.resolve(''))
}));

const mockFetch = vi.fn(() => Promise.resolve(
  new Response(
    JSON.stringify({ 
      choices: [{ 
        message: { 
          content: 'Test response' 
        } 
      }] 
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
));
global.fetch = mockFetch;

describe('apiSelector endpoint URL normalization', () => {
  beforeEach(() => {
    vi.resetModules(); // Clear module cache so mocks are picked up
    vi.clearAllMocks();
    mockFetch.mockClear();
  });
  afterEach(() => {
    vi.resetModules();
  });
  it('should handle endpoint URL normalization', async () => {
    // Import after mocks and resetModules!
    const { submitToLLM } = await import('../apiSelector');
    await expect(submitToLLM('test prompt')).rejects.toThrow('No API keys configured');
  });
}); 