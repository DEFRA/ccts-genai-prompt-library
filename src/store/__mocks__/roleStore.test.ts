import { describe, it, expect, vi } from 'vitest';
import { useRoleStore } from './roleStore';

describe('roleStore mock', () => {
  it('should export useRoleStore object', () => {
    expect(useRoleStore).toBeDefined();
    expect(typeof useRoleStore).toBe('object');
  });

  it('should have getState function that returns mock state', () => {
    expect(useRoleStore.getState).toBeDefined();
    expect(typeof useRoleStore.getState).toBe('function');
    expect(vi.isMockFunction(useRoleStore.getState)).toBe(true);
  });

  it('should return mock state with all required functions', () => {
    const mockState = useRoleStore.getState();
    
    expect(mockState).toBeDefined();
    expect(typeof mockState).toBe('object');
    
    // Check that all expected functions are present
    expect(mockState.subscribeToRoleChanges).toBeDefined();
    expect(typeof mockState.subscribeToRoleChanges).toBe('function');
    expect(vi.isMockFunction(mockState.subscribeToRoleChanges)).toBe(true);
    
    expect(mockState.addRole).toBeDefined();
    expect(typeof mockState.addRole).toBe('function');
    expect(vi.isMockFunction(mockState.addRole)).toBe(true);
    
    expect(mockState.updateRole).toBeDefined();
    expect(typeof mockState.updateRole).toBe('function');
    expect(vi.isMockFunction(mockState.updateRole)).toBe(true);
    
    expect(mockState.deleteRole).toBeDefined();
    expect(typeof mockState.deleteRole).toBe('function');
    expect(vi.isMockFunction(mockState.deleteRole)).toBe(true);
    
    expect(mockState.getAllRoles).toBeDefined();
    expect(typeof mockState.getAllRoles).toBe('function');
    expect(vi.isMockFunction(mockState.getAllRoles)).toBe(true);
    
    expect(mockState.setSelectedRole).toBeDefined();
    expect(typeof mockState.setSelectedRole).toBe('function');
    expect(vi.isMockFunction(mockState.setSelectedRole)).toBe(true);
  });

  it('should return empty array for getAllRoles by default', () => {
    const mockState = useRoleStore.getState();
    const result = mockState.getAllRoles();
    expect(result).toEqual([]);
  });

  it('should allow calling mock functions', () => {
    const mockState = useRoleStore.getState();
    
    // Test that functions can be called without errors
    expect(() => mockState.subscribeToRoleChanges()).not.toThrow();
    expect(() => mockState.addRole({ id: '1', name: 'Test Role' })).not.toThrow();
    expect(() => mockState.updateRole('1', { name: 'Updated Role' })).not.toThrow();
    expect(() => mockState.deleteRole('1')).not.toThrow();
    expect(() => mockState.setSelectedRole('1')).not.toThrow();
  });
}); 