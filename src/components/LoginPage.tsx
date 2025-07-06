import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const usernameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(username, password);
      if (!response.success) {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vscode-panel flex items-center justify-center p-4 font-vscode">
      <div className="w-full max-w-md">
        <div className="bg-vscode-section border border-vscode-border rounded-sm p-2 space-y-6">
          {/* Logo and Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
            <img src="/Logo2.svg" alt="Logo" style={{ width: '20%', height: 'auto' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-vscode-fg">
                Login to Prompt L<span className="text-purple-500 font-extrabold text-xl animate-pulse">ai</span>brary
              </h1>
              <p className="mt-1 text-xs text-vscode-fg">
                Please enter your credentials to continue.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-vscode-fg">
                Username
              </label>
              <div className="relative">
                <input
                  ref={usernameInputRef}
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm
                    placeholder-vscode-input-fg/50 focus:outline-none bg-gray-800"
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-vscode-fg">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
           className="w-full px-3 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm
                    placeholder-vscode-input-fg/50 focus:outline-none bg-gray-800"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-2 flex items-center text-vscode-fg/50 hover:text-vscode-fg"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full px-4 py-2 text-sm bg-vscode-button text-vscode-button-fg rounded-sm
                hover:bg-vscode-button-hover focus:outline-none focus:ring-1 focus:ring-vscode-active
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-r-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 