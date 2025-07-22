interface User {
  username: string;
  isAuthenticated: boolean;
  role: "admin" | "standard";
}

/**
 * Gets users credentials from environment variables.
 * Extracted as a function to make testing easier.
 */
/**
 * Testing mode flag - set to true in tests to use test credentials
 */
let _testingMode = false;
let _testCredentials = {
  ADMIN_USERNAME: '',
  ADMIN_PASSWORD: '',
  USER_USERNAME: '',
  USER_PASSWORD: '',
};

/**
 * Enable testing mode with test credentials
 */
export const enableTestingMode = (testCredentials: {
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  USER_USERNAME: string;
  USER_PASSWORD: string;
}) => {
  _testingMode = true;
  _testCredentials = testCredentials;
};

/**
 * Gets environment variables with test support.
 */
export const getEnv = () => {
  // If in testing mode, return test credentials
  if (_testingMode) {
    return _testCredentials;
  }
  
  // Otherwise, return actual env variables
  return {
    ADMIN_USERNAME: import.meta.env.VITE_ADMIN_USERNAME || '',
    ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || '',
    USER_USERNAME: import.meta.env.VITE_USER_USERNAME || '',
    USER_PASSWORD: import.meta.env.VITE_USER_PASSWORD || '',
  };
};

const getUsers = () => {
  const env = getEnv();
  return {
    admin: {
      username: env.ADMIN_USERNAME,
      password: env.ADMIN_PASSWORD,
      role: "admin" as const,
    },
    standard: {
      username: env.USER_USERNAME,
      password: env.USER_PASSWORD,
      role: "standard" as const,
    }
  };
};

interface AuthResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
}

class AuthService {
  private static instance: AuthService | null = null;
  private user: User | null = null;
  constructor() {
    // Load stored user data in constructor
    this.loadUserFromStorage();
  }

  // Method to reset the singleton instance (useful for testing)
  public static resetInstance(): void {
    AuthService.instance = null;
  }
  // Load user data from localStorage
  private loadUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  public async login(
    username: string,
    password: string
  ): Promise<AuthResponse> {
    // Get the latest users data from environment variables
    const USERS = getUsers();

    // Check admin credentials
    if (
      USERS.admin.username && 
      USERS.admin.password &&
      username === USERS.admin.username &&
      password === USERS.admin.password
    ) {
      this.user = {
        username,
        isAuthenticated: true,
        role: "admin",
      };
      localStorage.setItem("user", JSON.stringify(this.user));
      return {
        token: "admin-token",
        user: {
          username,
          role: "admin",
        },
      };
    }

    // Check standard user credentials
    if (
      USERS.standard.username &&
      USERS.standard.password &&
      username === USERS.standard.username &&
      password === USERS.standard.password
    ) {
      this.user = {
        username,
        isAuthenticated: true,
        role: "standard",
      };
      localStorage.setItem("user", JSON.stringify(this.user));
      return {
        token: "standard-token",
        user: {
          username,
          role: "standard",
        },
      };
    }

    // Clear user state on failed login
    this.user = null;
    localStorage.removeItem("user");
    throw new Error("Invalid username or password");
  }

  public logout(): void {
    this.user = null;
    localStorage.removeItem("user");
  }

  public isAuthenticated(): boolean {
    return !!this.user?.isAuthenticated;
  }

  public getUser(): User | null {
    return this.user;
  }
  public isAdmin(): boolean {
    return this.user?.role === "admin";
  }
  
  // Debug method for testing
  public debugGetEnv() {
    return getEnv();
  }
}

// Export both the singleton instance and the class for testing
const authServiceInstance = AuthService.getInstance();
export default authServiceInstance;
export { AuthService };
