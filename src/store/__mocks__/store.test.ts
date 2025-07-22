import { apiSelector, useStore } from './store';
import { describe, it, expect, vi } from 'vitest';

describe('store mocks', () => {
  describe('apiSelector mock', () => {
    it('should have submitToLLM function that returns success response', async () => {
      // Act
      const result = await apiSelector.submitToLLM();

      // Assert
      expect(apiSelector.submitToLLM).toBeDefined();
      expect(typeof apiSelector.submitToLLM).toBe('function');
      expect(result).toEqual({ success: true, content: 'Enhanced prompt content' });
      expect(vi.isMockFunction(apiSelector.submitToLLM)).toBe(true);
    });
  });

  describe('useStore mock', () => {
    it('should return mock store implementation', () => {
      // Act
      const store = useStore();

      // Assert
      expect(store).toBeDefined();
      expect(store.isEnhanceModalOpen).toBe(true);
      expect(store.enhanceModalContent).toBe('');
      expect(typeof store.openEnhanceModal).toBe('function');
      expect(typeof store.closeEnhanceModal).toBe('function');
      expect(typeof store.setEnhanceModalContent).toBe('function');
    });

    it('should be a mock function', () => {
      // Assert
      expect(vi.isMockFunction(useStore)).toBe(true);
    });

    it('should return consistent mock implementation on multiple calls', () => {
      // Act
      const store1 = useStore();
      const store2 = useStore();

      // Assert
      expect(store1).toMatchObject({
        isEnhanceModalOpen: true,
        enhanceModalContent: '',
        openEnhanceModal: expect.any(Function),
        closeEnhanceModal: expect.any(Function),
        setEnhanceModalContent: expect.any(Function)
      });
      expect(store2).toMatchObject({
        isEnhanceModalOpen: true,
        enhanceModalContent: '',
        openEnhanceModal: expect.any(Function),
        closeEnhanceModal: expect.any(Function),
        setEnhanceModalContent: expect.any(Function)
      });
    });

    it('should have mock functions that can be called', () => {
      // Act
      const store = useStore();
      store.openEnhanceModal();
      store.closeEnhanceModal();
      store.setEnhanceModalContent('test content');

      // Assert
      expect(store.openEnhanceModal).toHaveBeenCalledTimes(1);
      expect(store.closeEnhanceModal).toHaveBeenCalledTimes(1);
      expect(store.setEnhanceModalContent).toHaveBeenCalledWith('test content');
    });
  });
}); 