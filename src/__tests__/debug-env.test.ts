import { getEnvVar } from '../config';

describe('Debug Environment Variable Loading', () => {
  beforeEach(() => {
    // Setup test environment
    (window as any).__ENV__ = {
      VITE_DEFAULT_API: 'window-api',
    };
  });

  afterEach(() => {
    // Clean up test environment
    delete (window as any).__ENV__;
  });

  test('getEnvVar should return the correct value for VITE_DEFAULT_API', () => {
    // Arrange
    const expectedValue = 'window-api';

    // Act
    const result = getEnvVar('VITE_DEFAULT_API');

    // Assert
    expect(result).toBe(expectedValue);
  });

  test('getEnvVar should return an empty string for a non-existent environment variable', () => {
    // Arrange
    const nonExistentVar = 'NON_EXISTENT_VAR';

    // Act
    const result = getEnvVar(nonExistentVar);

    // Assert
    expect(result).toBe('');
  });

  test('getEnvVar should return an empty string when __ENV__ is missing', () => {
    // Arrange
    delete (window as any).__ENV__;

    // Act
    const result = getEnvVar('VITE_DEFAULT_API');

    // Assert assert
    expect(result).toBe('');
  });
});