import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// All mocks must be set up BEFORE importing the module under test!
vi.mock('../../config/apiConfig', () => ({
  getApiConfig: vi.fn(() => ({
    azure: {
      apiKey: 'test-key',
      endpoint: 'https://test-azure.openai.azure.com',
      deploymentId: 'gpt-4o',
      apiVersion: '2023-12-01-preview',
      models: ['gpt-4o', 'gpt-4o-mini']
    },
    openai: { apiKey: '', baseUrl: '', model: '', models: [] },
    serper: { apiKey: '', baseUrl: '' }
  })),
  isAzureOpenAIConfigured: vi.fn(() => true),
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

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiSelector retry logic', () => {
  beforeEach(() => {
    vi.resetModules(); // Clear module cache so mocks are picked up
    vi.clearAllMocks();
    mockFetch.mockClear();
  });
  afterEach(() => {
    vi.resetModules();
  });

  it('should try different models on failure', async () => {
    // Import after mocks and resetModules!
    const { submitToLLM } = await import('../apiSelector');
    
    mockFetch
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ error: { message: 'model not found' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ))
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ choices: [{ message: { content: 'success response' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

    const result = await submitToLLM('test prompt');
    expect(result).toBe('success response');
  });

  it('should handle rate limit without retry delay', async () => {
    // Import after mocks and resetModules!
    const { submitToLLM } = await import('../apiSelector');
    
    mockFetch
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ error: { message: 'rate limit exceeded' } }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      ))
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ choices: [{ message: { content: 'success response' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

    const result = await submitToLLM('test prompt');
    expect(result).toBe('success response');
  });

  it('should handle network errors during retry', async () => {
    // Import after mocks and resetModules!
    const { submitToLLM } = await import('../apiSelector');
    
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ choices: [{ message: { content: 'success response' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));

    const result = await submitToLLM('test prompt');
    expect(result).toBe('success response');
  });
}); 