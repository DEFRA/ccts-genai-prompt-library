// Vitest setup
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import { TEST_CONFIG } from '../../config/testConfig';

// Define the AuthResponse type based on the implementation
interface AuthResponse {
  success: boolean;
  user?: {
    username: string;
    role: string;
  };
  token?: string;
}

// Mock dependencies
vi.mock('../../store/useStore', () => ({
  useStore: vi.fn()
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe('LoginPage', () => {
  // Setup mock login function
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    (useStore as any).mockReturnValue({
      login: mockLogin
    });

    // Reset mock login to return success by default
    mockLogin.mockResolvedValue({ success: true });
  });

  it('renders correctly with all elements', () => {
    render(<LoginPage />);
    
    // Check for title
    expect(screen.getByText(new RegExp(TEST_CONFIG.LOGIN.TITLE, 'i'))).toBeInTheDocument();
    
    // Check for form inputs
    expect(screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'))).toBeInTheDocument();
    
    // Check for login button
    expect(screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') })).toBeInTheDocument();
  });

  it('focuses username input on load', () => {
    render(<LoginPage />);
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    expect(document.activeElement).toBe(usernameInput);
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByRole('button', { name: '' }); // The eye button has no accessible name
    fireEvent.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle back
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('updates username and password state on input', () => {
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    
    const testPassword = process.env.TEST_PASSWORD || 'dummy'; // Use environment variable for test password
    
    fireEvent.change(usernameInput, { target: { value: TEST_CONFIG.LOGIN.USERNAME } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    expect(usernameInput).toHaveValue(TEST_CONFIG.LOGIN.USERNAME);
    expect(passwordInput).toHaveValue(testPassword);
  });

  it('shows error toast when submitting empty form', async () => {
    render(<LoginPage />);
    
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    fireEvent.click(loginButton);
    
    expect(toast.error).toHaveBeenCalledWith(TEST_CONFIG.LOGIN.ERROR_EMPTY_FORM);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error toast when submitting with username but no password', async () => {
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    fireEvent.change(usernameInput, { target: { value: TEST_CONFIG.LOGIN.USERNAME } });
    
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    fireEvent.click(loginButton);
    
    expect(toast.error).toHaveBeenCalledWith(TEST_CONFIG.LOGIN.ERROR_EMPTY_FORM);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows error toast when submitting with password but no username', async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    const testPassword = process.env.TEST_PASSWORD || 'dummy'; // Use environment variable for test password
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    fireEvent.click(loginButton);
    
    expect(toast.error).toHaveBeenCalledWith(TEST_CONFIG.LOGIN.ERROR_EMPTY_FORM);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function and shows loading state when submitting valid form', async () => {
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    
    const testPassword = process.env.TEST_PASSWORD || 'dummy'; // Use environment variable for test password
    
    fireEvent.change(usernameInput, { target: { value: TEST_CONFIG.LOGIN.USERNAME } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    fireEvent.click(loginButton);
    
    // Check loading state
    expect(screen.getByText(new RegExp(TEST_CONFIG.LOGIN.LOGGING_IN_TEXT, 'i'))).toBeInTheDocument();
    
    // Check login function was called with correct args
    expect(mockLogin).toHaveBeenCalledWith(TEST_CONFIG.LOGIN.USERNAME, testPassword);
    
    // Wait for loading state to resolve
    await waitFor(() => {
      expect(screen.queryByText(new RegExp(TEST_CONFIG.LOGIN.LOGGING_IN_TEXT, 'i'))).not.toBeInTheDocument();
    });
  });

  it('shows error toast when login is unsuccessful', async () => {
    // Mock login to return unsuccessful response
    mockLogin.mockResolvedValue(TEST_CONFIG.LOGIN.FAILURE_RESPONSE);
    
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    
    const testPassword = process.env.TEST_PASSWORD || 'dummy'; // Use environment variable for test password
    
    fireEvent.change(usernameInput, { target: { value: TEST_CONFIG.LOGIN.USERNAME } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(TEST_CONFIG.LOGIN.ERROR_INVALID_CREDENTIALS);
    });
  });

  it('shows error toast when login throws an exception', async () => {
    // Mock login to throw an error
    mockLogin.mockRejectedValue(new Error(TEST_CONFIG.LOGIN.NETWORK_ERROR));
    
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    
    const testPassword = process.env.TEST_PASSWORD || 'dummy'; // Use environment variable for test password
    
    fireEvent.change(usernameInput, { target: { value: TEST_CONFIG.LOGIN.USERNAME } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(TEST_CONFIG.LOGIN.ERROR_LOGIN_FAILED);
    });
  });

  it('disables form inputs during loading state', async () => {
    // Use a delayed promise to keep loading state active
    mockLogin.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve(TEST_CONFIG.LOGIN.SUCCESS_RESPONSE), 100);
    }));
    
    render(<LoginPage />);
    
    const usernameInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.USERNAME_LABEL, 'i'));
    const passwordInput = screen.getByLabelText(new RegExp(TEST_CONFIG.LOGIN.SECRET_LABEL, 'i'));
    const loginButton = screen.getByRole('button', { name: new RegExp(TEST_CONFIG.LOGIN.LOGIN_BUTTON, 'i') });
    
    const testPassword = process.env.TEST_PASSWORD || 'dummy'; // Use environment variable for test password
    
    fireEvent.change(usernameInput, { target: { value: TEST_CONFIG.LOGIN.USERNAME } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    
    fireEvent.click(loginButton);
    
    // Check that inputs are disabled during loading
    expect(usernameInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(loginButton).toBeDisabled();
    
    // Wait for loading state to resolve
    await waitFor(() => {
      expect(loginButton).not.toBeDisabled();
    });
  });
});
