import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('defaultRoles', () => {
  let originalConsoleLog: any;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = vi.fn();
    vi.resetModules();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('loads valid roles from files (happy path)', async () => {
    const mockRoleModules = () => ({
      './Roles/test.json': { roles: [
        { id: 'a', name: 'A', description: 'desc', expertise: [] },
        { id: 'b', name: 'B', description: 'desc', expertise: [] }
      ] }
    });
    const { getDefaultRoles } = await import('./defaultRoles');
    const roles = getDefaultRoles(mockRoleModules);
    expect(roles).toHaveLength(2);
    expect(roles[0]).toMatchObject({ id: 'a', name: 'A', isDefault: true });
    expect(roles[1]).toMatchObject({ id: 'b', name: 'B', isDefault: true });
  });

  it('returns [] for invalid module format (not an object)', async () => {
    const mockRoleModules = () => ({ './Roles/invalid.json': null });
    const { getDefaultRoles } = await import('./defaultRoles');
    const roles = getDefaultRoles(mockRoleModules);
    expect(roles).toEqual([]);
  });

  it('returns [] for missing/invalid roles array', async () => {
    const mockRoleModules = () => ({ './Roles/invalid.json': { notRoles: [] } });
    const { getDefaultRoles } = await import('./defaultRoles');
    const roles = getDefaultRoles(mockRoleModules);
    expect(roles).toEqual([]);
  });

  it('filters out invalid role objects (missing id or name)', async () => {
    const mockRoleModules = () => ({
      './Roles/invalid.json': { roles: [
        { id: 'a', name: 'A', description: 'desc', expertise: [] },
        { id: 'b', description: 'desc', expertise: [] }, // missing name
        { name: 'C', description: 'desc', expertise: [] } // missing id
      ] }
    });
    const { getDefaultRoles } = await import('./defaultRoles');
    const roles = getDefaultRoles(mockRoleModules);
    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({ id: 'a', name: 'A' });
  });

  it('returns [] if processRoleFile throws', async () => {
    const throwingModule = {};
    Object.defineProperty(throwingModule, 'roles', {
      get() { throw new Error('test error'); }
    });
    const mockRoleModules = () => ({ './Roles/throws.json': throwingModule });
    const { getDefaultRoles } = await import('./defaultRoles');
    const roles = getDefaultRoles(mockRoleModules);
    expect(roles).toEqual([]);
  });
}); 