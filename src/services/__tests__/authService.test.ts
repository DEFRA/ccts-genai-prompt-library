import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Arrange: Define test credentials
const ADMIN_USERNAME = 'adminUser';
const ADMIN_PASSWORD = 'adminPass';
const USER_USERNAME = 'standardUser';
const USER_PASSWORD = 'userPass';

// Setup localStorage mock before importing any modules
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Import the service before enabling test mode
import authService, { AuthService, enableTestingMode } from '../authService';

// Enable testing mode with our test credentials
enableTestingMode({
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  USER_USERNAME,
  USER_PASSWORD,
});

// Mock config
vi.mock('../../config.ts', () => ({
  default: {
    server: {
      port: 3000,
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Clear all mocks and reset the singleton instance before each test
    vi.clearAllMocks();
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
    localStorageMock.clear.mockReset();
    
    // Reset the AuthService instance
    AuthService.resetInstance();
    
    // Make sure testing mode is enabled with our test credentials
    enableTestingMode({
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      USER_USERNAME,
      USER_PASSWORD,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });  it('should login as admin with correct credentials', async () => {
    // Act
    const response = await authService.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    
    // Assert
    expect(response.token).toBe('admin-token');
    expect(response.user.username).toBe(ADMIN_USERNAME);
    expect(response.user.role).toBe('admin');
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.isAdmin()).toBe(true);
    expect(authService.getUser()).toMatchObject({
      username: ADMIN_USERNAME,
      isAuthenticated: true,
      role: 'admin',
    });
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(JSON.stringify(authService.getUser())).toContain(ADMIN_USERNAME);
  });

  it('should login as standard user with correct credentials', async () => {
    // Act
    const response = await authService.login(USER_USERNAME, USER_PASSWORD);
    
    // Assert
    expect(response.token).toBe('standard-token');
    expect(response.user.username).toBe(USER_USERNAME);
    expect(response.user.role).toBe('standard');
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.isAdmin()).toBe(false);
    expect(authService.getUser()).toMatchObject({
      username: USER_USERNAME,
      isAuthenticated: true,
      role: 'standard',
    });
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(JSON.stringify(authService.getUser())).toContain(USER_USERNAME);
  });

  it('should throw error for invalid credentials', async () => {
    // Act & Assert
    await expect(authService.login('wrong', 'wrong')).rejects.toThrow('Invalid username or password');
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getUser()).toBeNull();
  });

  it('should logout and clear user state', async () => {
    // Arrange
    await authService.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    
    // Act
    authService.logout();
    
    // Assert
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getUser()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });  it('should restore user from localStorage on reload', async () => {
    // Arrange - Set up localStorage with user data
    const userData = {
      username: USER_USERNAME,
      isAuthenticated: true,
      role: 'standard',
    };
    
    // Mock localStorage.getItem to return our user data
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'user') {
        return JSON.stringify(userData);
      }
      return null;
    });
    
    // Reset the instance to simulate an app reload
    AuthService.resetInstance();
    
    // Get a new instance (should restore from localStorage)
    const reloadedService = AuthService.getInstance();
    
    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
    expect(reloadedService.isAuthenticated()).toBe(true);
    expect(reloadedService.getUser()).toMatchObject({
      username: USER_USERNAME,
      isAuthenticated: true,
      role: 'standard',
    });
  });
});
