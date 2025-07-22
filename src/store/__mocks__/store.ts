import { vi } from 'vitest';

// Create a mock API selector with proper implementation
export const apiSelector = {
  submitToLLM: vi.fn().mockResolvedValue({ success: true, content: 'Enhanced prompt content' })
};

// Add other store functionality that needs to be mocked
export const useStore = vi.fn().mockImplementation(() => ({
  isEnhanceModalOpen: true,
  enhanceModalContent: '',
  openEnhanceModal: vi.fn(),
  closeEnhanceModal: vi.fn(),
  setEnhanceModalContent: vi.fn()
}));
