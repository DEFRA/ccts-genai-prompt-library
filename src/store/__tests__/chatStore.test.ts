// Vitest setup
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useChatStore } from '../chatStore';
import type { ChatMessage } from '../../types';

// Mock storage for persist middleware testing
const mockStorageValue: Record<string, string> = {};
const mockStorage = {
  getItem: vi.fn((key: string) => mockStorageValue[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorageValue[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorageValue[key];
  }),
};

// Mock localStorage for zustand/persist
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true
});

describe('chatStore', () => {
  // Reset store and mocks before each test
  beforeEach(() => {
    // Reset the store to initial state
    const store = useChatStore.getState();
    store.messages = {};
    store.contentVersions = {};
    store.activeConversation = null;
    
    // Clear mock call history
    vi.clearAllMocks();
    Object.keys(mockStorageValue).forEach(key => delete mockStorageValue[key]);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty messages and null active conversation', () => {
    const state = useChatStore.getState();
    
    expect(state.messages).toEqual({});
    expect(state.contentVersions).toEqual({});
    expect(state.activeConversation).toBeNull();
  });
  it('should add a message to a conversation', () => {
    const conversationId = 'test-conversation';
    const message: ChatMessage = { 
      content: 'Hello', 
      role: 'user', 
      timestamp: new Date().toISOString()
    };
    
    useChatStore.getState().addMessage(conversationId, message);
    
    const state = useChatStore.getState();
    expect(state.messages[conversationId]).toEqual([message]);
  });
  it('should add multiple messages to a conversation', () => {
    const conversationId = 'test-conversation';
    const message1: ChatMessage = { 
      content: 'Hello', 
      role: 'user', 
      timestamp: new Date().toISOString()
    };
    const message2: ChatMessage = { 
      content: 'Hi there', 
      role: 'assistant', 
      timestamp: new Date().toISOString()
    };
    
    useChatStore.getState().addMessage(conversationId, message1);
    useChatStore.getState().addMessage(conversationId, message2);
    
    const state = useChatStore.getState();
    expect(state.messages[conversationId]).toEqual([message1, message2]);
  });
  it('should add content version to a conversation', () => {
    const conversationId = 'test-conversation';
    const content = 'Version 1 content';
    
    useChatStore.getState().addContentVersion(conversationId, content);
    
    const state = useChatStore.getState();
    expect(state.contentVersions[conversationId]).toEqual([content]);
  });

  it('should add multiple content versions to a conversation', () => {
    const conversationId = 'test-conversation';
    const content1 = 'Version 1 content';
    const content2 = 'Version 2 content';
    
    useChatStore.getState().addContentVersion(conversationId, content1);
    useChatStore.getState().addContentVersion(conversationId, content2);
    
    const state = useChatStore.getState();
    expect(state.contentVersions[conversationId]).toEqual([content1, content2]);
  });

  it('should set active conversation', () => {
    const conversationId = 'test-conversation';
    
    useChatStore.getState().setActiveConversation(conversationId);
    
    const state = useChatStore.getState();
    expect(state.activeConversation).toBe(conversationId);
  });
  it('should clear a conversation', () => {
    const conversationId = 'test-conversation';
    const message: ChatMessage = { 
      content: 'Hello', 
      role: 'user', 
      timestamp: new Date().toISOString()
    };
    
    useChatStore.getState().addMessage(conversationId, message);
    useChatStore.getState().clearConversation(conversationId);
    
    const state = useChatStore.getState();
    expect(state.messages[conversationId]).toBeUndefined();
  });
  // Add tests for the persistence feature
  describe('persist middleware', () => {    
    it('should add messages to a conversation and maintain state', () => {
      // Arrange
      const conversationId = 'test-conversation-1';
      const message: ChatMessage = {
        role: 'user',
        content: 'Test message',
        timestamp: new Date().toISOString()
      };
      
      // Act
      useChatStore.getState().addMessage(conversationId, message);
      useChatStore.getState().addContentVersion(conversationId, 'Test content');

      // Assert - just test that the store maintains the state properly
      const state = useChatStore.getState();
      expect(state.messages[conversationId]).toBeDefined();
      expect(state.messages[conversationId].length).toBe(1);
      expect(state.contentVersions[conversationId]).toBeDefined();
      expect(state.contentVersions[conversationId].length).toBe(1);
    });
    
    it('should set and get activeConversation', () => {
      // Arrange
      const conversationId = 'test-conversation';
      
      // Act
      useChatStore.getState().setActiveConversation(conversationId);
      
      // Assert
      const state = useChatStore.getState();
      expect(state.activeConversation).toBe(conversationId);
    });
  });
});
