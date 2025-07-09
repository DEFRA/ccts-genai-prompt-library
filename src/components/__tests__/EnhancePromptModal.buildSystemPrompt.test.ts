import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSystemPrompt } from '../EnhancePromptModal.buildSystemPrompt';

describe('buildSystemPrompt', () => {
  beforeEach(() => {
    // Reset mocks between tests
    vi.clearAllMocks();
  });
  
  it('returns a string when called with a prompt', async () => {
    // Arrange
    const prompt = 'Create a testing strategy for a React application';
    
    // Act
    const result = await buildSystemPrompt(prompt);
    
    // Assert
    expect(typeof result).toBe('string');
  });
  
  it('includes the original prompt in the result', async () => {
    // Arrange
    const prompt = 'Create a testing strategy for a React application';
    
    // Act
    const result = await buildSystemPrompt(prompt);
    
    // Assert
    expect(result).toContain(prompt);
  });
  
  it('includes GDS context in the result', async () => {
    // Arrange
    const prompt = 'Create a testing strategy for a React application';
    
    // Act
    const result = await buildSystemPrompt(prompt);
    
    // Assert
    expect(result).toContain('Government Digital Service');
    expect(result).toContain('DDaT Capability framework');
  });
  
  it('includes optimization steps in the result', async () => {
    // Arrange
    const prompt = 'Create a testing strategy for a React application';
    
    // Act
    const result = await buildSystemPrompt(prompt);
    
    // Assert
    expect(result).toContain('Analyze the prompt for clarity');
    expect(result).toContain('Structure using enhanced RACE framework');
  });
  
  it('handles chat mode by adjusting the prompt format', async () => {
    // Arrange
    const prompt = 'Create a testing strategy for a React application';
    
    // Act
    const resultWithChatMode = await buildSystemPrompt(prompt, true);
    const resultWithoutChatMode = await buildSystemPrompt(prompt, false);
    
    // Assert
    expect(resultWithChatMode).not.toBe(resultWithoutChatMode);
  });
});
