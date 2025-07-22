// Temporary debug file to test environment variable loading
import { getEnvVar } from './config';

// Test the getEnvVar function
console.log('Testing getEnvVar function:');

// Setup test environment
(window as any).__ENV__ = {
  VITE_DEFAULT_API: 'window-api'
};

(import.meta as any).env = {
  VITE_OPENAI_MODEL: 'vite-model',
  VITE_DEFAULT_API: 'vite-api'
};

// Test cases
console.log('Window env var:', (window as any).__ENV__.VITE_DEFAULT_API);
console.log('Meta env var:', import.meta.env.VITE_OPENAI_MODEL);
console.log('Get DEFAULT_API:', getEnvVar('VITE_DEFAULT_API', 'default-api'));
console.log('Get OPENAI_MODEL:', getEnvVar('VITE_OPENAI_MODEL', 'default-model'));
