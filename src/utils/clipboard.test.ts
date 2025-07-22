import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return false if no text is provided', async () => {
    await expect(copyToClipboard('')).resolves.toBe(false);
  });

  it('should use Clipboard API if available', async () => {
    // @ts-ignore
    global.navigator = { clipboard: { writeText: vi.fn().mockImplementation(() => Promise.resolve(undefined)) } };
    await expect(copyToClipboard('hello')).resolves.toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
  });

  it('should return false if all copy methods fail', async () => {
    // @ts-ignore
    global.navigator = { clipboard: { writeText: vi.fn().mockImplementation(() => Promise.reject(new Error('fail'))) } };
    await expect(copyToClipboard('fail')).resolves.toBe(false);
  });

  it('should use VSCode API if available', async () => {
    // Ensure window exists in the test environment
    if (typeof window === 'undefined') {
      (global as any).window = {};
    }
    window.acquireVsCodeApi = vi.fn(() => ({ postMessage: vi.fn() }));
    await expect(copyToClipboard('vscode')).resolves.toBe(true);
    delete window.acquireVsCodeApi;
  });
});
