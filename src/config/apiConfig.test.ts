import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { formatAzureEndpoint, formatAzureEndpointInternal, getApiConfig, isAzureOpenAIConfigured, isOpenAIConfigured, COMPLIANT_SYSTEM_MESSAGE } from './apiConfig';

function resetEnv() {
  (window as any).__ENV__ = {};
  (import.meta as any).env = {};
}

describe('apiConfig.ts', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetEnv();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.resetModules();
    // Also clear process.env for full isolation
    delete process.env.VITE_AZURE_OPENAI_ENDPOINT;
    delete process.env.VITE_AZURE_OPENAI_KEY;
    delete process.env.VITE_AZURE_OPENAI_DEPLOYMENT_ID;
    delete process.env.VITE_OPENAI_API_KEY;
    delete process.env.VITE_SERPER_API_KEY;
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    resetEnv();
  });

  describe('formatAzureEndpointInternal (testable version)', () => {
    it('returns empty string for empty input', () => {
      expect(formatAzureEndpointInternal('', {})).toBe('');
    });
    it('returns vite endpoint for placeholder value', () => {
      const testEnv = { VITE_AZURE_OPENAI_ENDPOINT: 'https://vite-endpoint.com' };
      expect(formatAzureEndpointInternal('%%VITE_AZURE_OPENAI_ENDPOINT%%', testEnv)).toBe('https://vite-endpoint.com');
    });
    it('warns and returns empty string for placeholder with no vite env', () => {
      expect(formatAzureEndpointInternal('%%VITE_AZURE_OPENAI_ENDPOINT%%', {})).toBe('');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Azure OpenAI endpoint contains placeholder value');
    });
    it('removes trailing slashes', () => {
      expect(formatAzureEndpointInternal('https://test.com/', {})).toBe('https://test.com');
      expect(formatAzureEndpointInternal('https://test.com////', {})).toBe('https://test.com');
    });
    it('adds https:// if missing', () => {
      expect(formatAzureEndpointInternal('test.com', {})).toBe('https://test.com');
    });
    it('throws and logs error for invalid URL', () => {
      expect(() => formatAzureEndpointInternal('not a url!@#', {})).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid endpoint URL format:',
        'https://not a url!@#',
        expect.any(Error)
      );
    });
  });

  describe('formatAzureEndpoint (public wrapper)', () => {
    it('calls internal function with current environment', () => {
      // Test that the wrapper works with the current environment
      expect(formatAzureEndpoint('https://test.com')).toBe('https://test.com');
    });
  });

  describe('apiConfig function', () => {
    it('returns fallback config and logs error if required env vars are missing', async () => {
      vi.resetModules();
      // Remove env vars and clear all possible real env
      resetEnv();
      delete process.env.VITE_AZURE_OPENAI_KEY;
      delete process.env.VITE_AZURE_OPENAI_ENDPOINT;
      delete process.env.VITE_AZURE_OPENAI_DEPLOYMENT_ID;
      delete process.env.VITE_OPENAI_API_KEY;
      delete process.env.VITE_SERPER_API_KEY;
      // Re-import to re-run config
      const { getApiConfig } = await import('./apiConfig');
      const config = getApiConfig();
      expect(config.azure.apiKey).toBe('');
      expect(config.azure.endpoint).toBe('');
      expect(config.azure.deploymentId).toBe('gpt-4');
      expect(config.openai.apiKey).toBe('');
      expect(config.serper.apiKey).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'API Configuration Error:',
        expect.any(Error)
      );
    });
    it('returns valid config when all env vars are present', async () => {
      vi.resetModules();
      (window as any).__ENV__ = {
        VITE_AZURE_OPENAI_KEY: 'azure-key',
        VITE_AZURE_OPENAI_ENDPOINT: 'https://azure-endpoint.com',
        VITE_AZURE_OPENAI_DEPLOYMENT_ID: 'deployment-id',
        VITE_AZURE_OPENAI_MODELS: 'gpt-4,gpt-4o',
        VITE_OPENAI_API_KEY: 'openai-key',
        VITE_OPENAI_MODELS: 'gpt-4o-mini',
        VITE_SERPER_API_KEY: 'serper-key',
      };
      (import.meta as any).env = {
        VITE_AZURE_OPENAI_KEY: 'azure-key',
        VITE_AZURE_OPENAI_ENDPOINT: 'https://azure-endpoint.com',
        VITE_AZURE_OPENAI_DEPLOYMENT_ID: 'deployment-id',
        VITE_OPENAI_API_KEY: 'openai-key',
        VITE_OPENAI_MODELS: 'gpt-4o-mini',
        VITE_SERPER_API_KEY: 'serper-key',
      };
      const { getApiConfig } = await import('./apiConfig');
      const config = getApiConfig();
      expect(config.azure.apiKey).toBe('azure-key');
      expect(config.azure.endpoint).toBe('https://azure-endpoint.com');
      expect(config.azure.deploymentId).toBe('deployment-id');
      expect(config.azure.models).toContain('gpt-4');
      expect(config.openai.apiKey).toBe('openai-key');
      expect(config.openai.models).toContain('gpt-4o-mini');
      expect(config.serper.apiKey).toBe('serper-key');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'API Configuration Status:',
        expect.objectContaining({
          azure: expect.objectContaining({ hasKey: true, hasEndpoint: true })
        })
      );
    });
  });

  describe('utility exports', () => {
    it('azure.apiVersion is accessible via getApiConfig', () => {
      expect(getApiConfig().azure.apiVersion).toBeDefined();
      expect(typeof getApiConfig().azure.apiVersion).toBe('string');
    });
    it('isAzureOpenAIConfigured returns true if config is present', () => {
      const config = getApiConfig();
      (config.azure.apiKey as any) = 'key';
      (config.azure.endpoint as any) = 'endpoint';
      expect(isAzureOpenAIConfigured(config)).toBe(true);
    });
    it('isAzureOpenAIConfigured returns false if config is missing', () => {
      const config = getApiConfig();
      (config.azure.apiKey as any) = '';
      (config.azure.endpoint as any) = '';
      expect(isAzureOpenAIConfigured(config)).toBe(false);
    });
    it('isOpenAIConfigured returns true if openai.apiKey is present', () => {
      const config = getApiConfig();
      (config.openai.apiKey as any) = 'key';
      expect(isOpenAIConfigured(config)).toBe(true);
    });
    it('isOpenAIConfigured returns false if openai.apiKey is missing', () => {
      const config = getApiConfig();
      (config.openai.apiKey as any) = '';
      expect(isOpenAIConfigured(config)).toBe(false);
    });
    it('COMPLIANT_SYSTEM_MESSAGE is a non-empty string', () => {
      expect(typeof COMPLIANT_SYSTEM_MESSAGE).toBe('string');
      expect(COMPLIANT_SYSTEM_MESSAGE.length).toBeGreaterThan(10);
    });
  });
}); 