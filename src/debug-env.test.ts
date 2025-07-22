import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnvVar } from './config';

// Mock console.log to capture output
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('debug-env', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup test environment variables
    (window as any).__ENV__ = {
      VITE_DEFAULT_API: 'window-api'
    };
    (import.meta as any).env = {
      VITE_OPENAI_MODEL: 'vite-model',
      VITE_DEFAULT_API: 'vite-api'
    };
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    delete (window as any).__ENV__;
    delete (import.meta as any).env;
  });

  it('should execute debug-env.ts file and test all console.log outputs', async () => {
    vi.resetModules();
    await import('./debug-env');
    expect(consoleLogSpy).toHaveBeenCalledWith('Testing getEnvVar function:');
    expect(consoleLogSpy).toHaveBeenCalledWith('Window env var:', 'window-api');
    expect(consoleLogSpy).toHaveBeenCalledWith('Meta env var:', 'vite-model');
    expect(consoleLogSpy).toHaveBeenCalledWith('Get DEFAULT_API:', 'window-api');
    expect(consoleLogSpy).toHaveBeenCalledWith('Get OPENAI_MODEL:', 'default-model');
    expect(consoleLogSpy).toHaveBeenCalledTimes(5);
  });

  it('should test environment variable loading and getEnvVar function', () => {
    expect((window as any).__ENV__.VITE_DEFAULT_API).toBe('window-api');
    expect((import.meta as any).env.VITE_OPENAI_MODEL).toBe('vite-model');
    expect((import.meta as any).env.VITE_DEFAULT_API).toBe('vite-api');
    expect(getEnvVar('VITE_DEFAULT_API', 'default-api')).toBe('window-api');
    expect(getEnvVar('VITE_OPENAI_MODEL', 'default-model')).toBe('default-model');
  });

  it('should test getEnvVar function with window environment variables', () => {
    expect(getEnvVar('VITE_DEFAULT_API', 'default-api')).toBe('window-api');
  });

  it('should test getEnvVar function with import.meta environment variables', () => {
    expect(getEnvVar('VITE_OPENAI_MODEL', 'default-model')).toBe('default-model');
  });

  it('should test getEnvVar function with fallback values', () => {
    expect(getEnvVar('NON_EXISTENT_VAR', 'fallback-value')).toBe('fallback-value');
  });

  it('should verify window environment setup', () => {
    expect((window as any).__ENV__).toEqual({
      VITE_DEFAULT_API: 'window-api'
    });
  });

  it('should verify import.meta environment setup', () => {
    expect((import.meta as any).env).toEqual({
      VITE_OPENAI_MODEL: 'vite-model',
      VITE_DEFAULT_API: 'vite-api'
    });
  });
}); 