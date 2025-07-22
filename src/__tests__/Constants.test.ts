import { RATE_LIMIT, QUEUE_PROCESS_INTERVAL } from '../constants';

describe('Constants', () => {
  test('RATE_LIMIT should be defined and have the correct value', () => {
    // Arrange
    const expectedRateLimit = 10;

    // Act & Assert
    expect(RATE_LIMIT).toBeDefined();
    expect(RATE_LIMIT).toBe(expectedRateLimit);
  });

  test('QUEUE_PROCESS_INTERVAL should be defined and have the correct value', () => {
    // Arrange
    const expectedQueueProcessInterval = 1000;

    // Act & Assert
    expect(QUEUE_PROCESS_INTERVAL).toBeDefined();
    expect(QUEUE_PROCESS_INTERVAL).toBe(expectedQueueProcessInterval);
  });
});