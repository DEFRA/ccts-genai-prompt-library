export const useRoleStore = {
  getState: jest.fn().mockReturnValue({
    roles: [],
    userRoles: [],
    defaultRoles: [],
    selectedRole: null,
    modalSelectedRole: null,
    isInitialized: true,
    initializeDefaultRoles: jest.fn(),
    setSelectedRole: jest.fn(),
    addRole: jest.fn().mockResolvedValue(null),
    getAllRoles: jest.fn().mockReturnValue([]),
    setModalSelectedRole: jest.fn(),
    clearModalRole: jest.fn(),
    resetDefaultRoles: jest.fn(),
    importRoles: jest.fn().mockResolvedValue({ imported: [], skipped: [] }),
    deleteRole: jest.fn().mockResolvedValue(true),
    updateRole: jest.fn().mockResolvedValue(null),
    resetRoles: jest.fn(),
    subscribeToRoleChanges: jest.fn().mockImplementation((callback) => {
      callback(null);
      return () => {};
    }),
  }),
};
