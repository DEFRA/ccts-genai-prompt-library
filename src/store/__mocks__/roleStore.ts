import { vi } from 'vitest';

// Mock the useRoleStore
export const useRoleStore = {
  getState: vi.fn(() => ({
    subscribeToRoleChanges: vi.fn(),
    addRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
    getAllRoles: vi.fn(() => []),
    setSelectedRole: vi.fn(),
  })),
};
