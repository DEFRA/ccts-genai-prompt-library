import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectFileDetails } from './codeUtils';
import { downloadCode } from './codeUtils';

describe('detectFileDetails', () => {
  it('should extract filename and extension from first line', () => {
    const code = 'filename=example.js\nconsole.log(1);';
    const result = detectFileDetails(code);
    expect(result.fileName).toBe('example.js');
    expect(result.extension).toBe('js');
  });

  it('should use default filename if not present', () => {
    const code = 'console.log(1);';
    const result = detectFileDetails(code);
    expect(result.fileName).toBe('code');
    expect(result.extension).toBe('code');
  });

  it('should extract extension from language if filename has no extension', () => {
    const code = 'filename=example\nlanguage-js\nconsole.log(1);';
    const result = detectFileDetails(code);
    expect(result.fileName).toBe('example.js');
    expect(result.extension).toBe('js');
  });

  it('should handle missing extension and language', () => {
    const code = 'filename=foo\nconsole.log(1);';
    const result = detectFileDetails(code);
    expect(result.fileName).toBe('foo');
    expect(result.extension).toBe('foo');
  });
});

describe('downloadCode', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(() => {
      return {
        href: '',
        download: '',
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;
    });
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => node);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => node);
    createObjectURLSpy = vi.spyOn(window.URL, 'createObjectURL').mockImplementation(() => 'mock-url');
    revokeObjectURLSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a blob and trigger download with correct filename', () => {
    const code = 'console.log(1);';
    const fileName = 'example.js';

    downloadCode(code, fileName);

    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('mock-url');
  });

  it('should set the correct href and download attributes on the anchor element', () => {
    const code = 'console.log(1);';
    const fileName = 'example.js';

    const mockAnchorElement = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    createElementSpy.mockReturnValue(mockAnchorElement);

    downloadCode(code, fileName);

    expect(mockAnchorElement.href).toBe('mock-url');
    expect(mockAnchorElement.download).toBe(fileName);
    expect(mockAnchorElement.click).toHaveBeenCalled();
  });
});