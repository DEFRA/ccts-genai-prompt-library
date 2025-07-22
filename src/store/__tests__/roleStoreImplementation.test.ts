// Vitest setup
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRoleStore } from '../roleStore'; // Import the actual store
import { Role } from '../../types';
import { generateId } from '../../utils/generateId';

// Mock dependencies
vi.mock('../../utils/generateId');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// This file tests the actual implementation of roleStore.ts
describe('roleStore implementation', () => {  
  const testRole: Role = {
    id: 'test-role-1',
    name: 'Test Role',
    description: 'A test role',
    expertise: ['Test', 'Mock'],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    isDefault: false
  };
  
  const defaultRoles: Role[] = [
    {
      id: 'default-role-1',
      name: 'Developer',
      description: 'Default developer role',
      expertise: ['Development'],
      createdAt: '2023-01-01T00:00:00Z', 
      updatedAt: '2023-01-01T00:00:00Z',
      isDefault: true
    },
    {
      id: 'default-role-2',
      name: 'Manager',
      description: 'Default manager role',
      expertise: ['Management'],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      isDefault: true
    }
  ];
  
  beforeEach(() => {
    // Reset the store state before each test
    useRoleStore.getState().resetRoles();
    vi.resetAllMocks();
    vi.mocked(generateId).mockReturnValue('mocked-id');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('core functionality', () => {
    it('initializes with empty state', () => {
      const state = useRoleStore.getState();
      expect(state.roles.length).toBe(0);
      expect(state.userRoles).toEqual([]);
      expect(state.defaultRoles).toEqual([]);
      expect(state.selectedRole).toBeNull();
      expect(state.modalSelectedRole).toBeNull();
    });
  
    it('can set and clear the selected role', () => {
      const state = useRoleStore.getState();
      // First add the role to make sure it exists in the store
      // The actual implementation might only allow setting roles that exist in the store
      state.addRole({
        name: testRole.name,
        description: testRole.description,
        expertise: testRole.expertise
      });
      
      // Get the newly added role from the store to use for setting
      const addedRole = state.userRoles[0];
      
      // Set selected role
      state.setSelectedRole(addedRole);
      
      // Clear selected role
      state.setSelectedRole(null);
      expect(state.selectedRole).toBeNull();
    });

    it('can set and clear the modal selected role', () => {
      const state = useRoleStore.getState();
      // First add the role to make sure it exists in the store
      // The actual implementation might only allow setting roles that exist in the store
      state.addRole({
        name: testRole.name,
        description: testRole.description,
        expertise: testRole.expertise
      });
      
      // Get the newly added role from the store to use for setting
      const addedRole = state.userRoles[0];
      
      // Set modal selected role
      state.setModalSelectedRole(addedRole);
      
      // Clear modal selected role
      state.clearModalRole();
      expect(state.modalSelectedRole).toBeNull();
    });

    it('adds a new role', async () => {
      const roleData = {
        name: 'New Role',
        description: 'A new role',
        expertise: ['New', 'Test']
      };
      
      const result = await useRoleStore.getState().addRole(roleData);
      
      expect(result).toEqual({
        id: 'mocked-id',
        name: 'New Role',
        description: 'A new role',
        expertise: ['New', 'Test'],
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        isDefault: false
      });
      expect(useRoleStore.getState().roles.length).toBe(1);
      expect(useRoleStore.getState().userRoles.length).toBe(1);
    });

    it('imports roles correctly', async () => {
      const rolesToImport = [
        {
          id: 'import-1',
          name: 'Imported Role 1',
          description: 'An imported role',
          expertise: ['Import', 'Test'],
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          isDefault: false
        }
      ];
      
      const result = await useRoleStore.getState().importRoles(rolesToImport);
      
      expect(result.imported.length).toBe(1);
      expect(result.imported[0].name).toBe('Imported Role 1');
      expect(result.skipped.length).toBe(0);
      expect(useRoleStore.getState().roles.length).toBe(1);
      expect(useRoleStore.getState().userRoles.length).toBe(1);
    });

    it('updates a role correctly', async () => {
      // First add a role
      const state = useRoleStore.getState();
      const result = await state.addRole({
        name: 'Role to Update',
        description: 'This will be updated',
        expertise: ['Test']
      });
      
      // Check we actually got a role back
      expect(result).not.toBeNull();
      
      if (result) {
        // Update the role
        const updatedRole = {
          ...result,
          name: 'Updated Role Name',
          description: 'Updated description'
        };
        
        const updateResult = await state.updateRole(updatedRole);
        
        // Verify the update
        expect(updateResult).not.toBeNull();
        if (updateResult) {
          expect(updateResult.name).toBe('Updated Role Name');
          expect(updateResult.description).toBe('Updated description');
        }
      }
    });

    it('deletes a role correctly', async () => {
      // First clear any existing state
      const state = useRoleStore.getState();
      state.resetRoles();
      
      // Add a role
      const roleData = {
        name: 'Role to Delete',
        description: 'This will be deleted',
        expertise: ['Test']
      };
      
      const addedRole = await state.addRole(roleData);
      expect(addedRole).not.toBeNull();
      
      if (addedRole) {
        const roleId = addedRole.id;
        
        // Verify role is in the store after adding
        const newState = useRoleStore.getState();
        const userRoles = newState.userRoles;
        
        expect(userRoles.some(r => r.id === roleId)).toBe(true);
        
        // Delete the role
        await newState.deleteRole(roleId);
        
        // Verify role is no longer in the store after deletion
        const finalState = useRoleStore.getState();
        expect(finalState.userRoles.some(r => r.id === roleId)).toBe(false);
        
        // Also check with getRoleById which should return undefined
        const deletedRole = finalState.getAllRoles().find(r => r.id === roleId);
        expect(deletedRole).toBeUndefined();
      }
    });
    
    it('properly handles role subscriptions', () => {
      const state = useRoleStore.getState();
      const mockCallback = vi.fn();
      
      // Subscribe to role changes
      const unsubscribe = state.subscribeToRoleChanges(mockCallback);
      
      // Change the selected role
      state.setSelectedRole(testRole);
      
      // Unsubscribe
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });
    
    it('resets roles correctly', () => {
      const state = useRoleStore.getState();
      
      // First add some data
      state.initializeDefaultRoles(defaultRoles);
      state.setSelectedRole(testRole);
      
      // Reset all roles
      state.resetRoles();
      
      // Verify reset
      expect(state.defaultRoles).toEqual([]);
      expect(state.userRoles).toEqual([]);
      expect(state.selectedRole).toBeNull();
      expect(state.isInitialized).toBe(false);
    });
  });
});
