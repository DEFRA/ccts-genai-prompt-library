// Vitest setup
import { describe, it, expect, vi } from 'vitest';

// Mock the stores
vi.mock('../useStore', () => ({
  useStore: 'mockUseStore'
}));

vi.mock('../templateStore', () => ({
  useTemplateStore: 'mockTemplateStore'
}));

vi.mock('../roleStore', () => ({
  useRoleStore: 'mockRoleStore'
}));

describe('store index', () => {
  it('exports the correct stores', async () => {
    // Import the index file
    const storeIndex = await import('../index');
    
    // Assert that it exports the correct stores
    expect(storeIndex.useStore).toBe('mockUseStore');
    expect(storeIndex.useTemplateStore).toBe('mockTemplateStore');
    expect(storeIndex.useRoleStore).toBe('mockRoleStore');
  });
});
