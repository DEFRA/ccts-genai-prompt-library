import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { generateId, generateTemplateId, generateSectionId, generateUniqueId, generateUniqueTemplateId, generateUniqueSectionId, clearUsedIds } from './generateId';

describe('generateId utilities', () => {
  afterEach(() => {
    clearUsedIds();
  });

  it('generateId should return a unique uuid string', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it('generateTemplateId should return a string starting with template-', () => {
    const id = generateTemplateId();
    expect(id.startsWith('template-')).toBe(true);
    expect(id.length).toBeGreaterThan('template-'.length);
  });

  it('generateSectionId should return a string starting with section-', () => {
    const id = generateSectionId();
    expect(id.startsWith('section-')).toBe(true);
    expect(id.length).toBeGreaterThan('section-'.length);
  });

  it('generateUniqueId should return unique ids with prefix', () => {
    const id1 = generateUniqueId('test');
    const id2 = generateUniqueId('test');
    expect(id1.startsWith('test-')).toBe(true);
    expect(id2.startsWith('test-')).toBe(true);
    expect(id1).not.toBe(id2);
  });

  it('generateUniqueTemplateId should return unique template ids', () => {
    const id1 = generateUniqueTemplateId();
    const id2 = generateUniqueTemplateId();
    expect(id1.startsWith('template-')).toBe(true);
    expect(id2.startsWith('template-')).toBe(true);
    expect(id1).not.toBe(id2);
  });

  it('generateUniqueSectionId should return unique section ids', () => {
    const id1 = generateUniqueSectionId();
    const id2 = generateUniqueSectionId();
    expect(id1.startsWith('section-')).toBe(true);
    expect(id2.startsWith('section-')).toBe(true);
    expect(id1).not.toBe(id2);
  });
});

