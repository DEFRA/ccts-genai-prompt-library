interface User {
  username: string;
  isAuthenticated: boolean;
  role: "admin" | "standard";
}

const USERS = {
  admin: {
    username: import.meta.env.VITE_ADMIN_USERNAME,
    password: import.meta.env.VITE_ADMIN_PASSWORD,
    role: "admin" as const,
  },
  standard: {
    username: import.meta.env.VITE_USER_USERNAME,
    password: import.meta.env.VITE_USER_PASSWORD,
    role: "standard" as const,
  },
};

interface AuthResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private user: User | null = null;

  private constructor() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      this.user = JSON.parse(storedUser);
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
    if (
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

    if (
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
}

export default AuthService.getInstance();
