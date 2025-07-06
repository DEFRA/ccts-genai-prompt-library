import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { generatePrompt } from './promptGenerator';

describe('generatePrompt', () => {
  const template = {
    id: 't1',
    name: 'Test Template',
    role: 'role1',
    description: '',
    expertise: [],
    content: '',
    isDefault: false,
    raceRole: 'Developer',
    raceAction: 'Write code',
    raceContext: 'In a team',
    raceExpectation: 'Deliver features',
    showProgrammingLanguage: true,
    customSections: [
      { id: 's1', name: 'Details', type: 'textarea', isVisible: true, required: false },
      { id: 's2', name: 'Options', type: 'multiselect', isVisible: true, required: false }
    ]
  };

  it('should generate prompt with all sections', () => {
    const result = generatePrompt(
      null,
      template,
      { s1: 'Section details' },
      { s2: ['Option1', 'Option2'] },
      'TypeScript'
    );
    expect(result).toContain('Role:\nDeveloper');
    expect(result).toContain('Action:\nWrite code');
    expect(result).toContain('Context:\nIn a team');
    expect(result).toContain('Execute:\nDeliver features');
    expect(result).toContain('Language: TypeScript');
    expect(result).toContain('Details:\nSection details');
    expect(result).toContain('Options:\nOption1\nOption2');
  });

  it('should skip programming language if showProgrammingLanguage is false', () => {
    const t = { ...template, showProgrammingLanguage: false };
    const result = generatePrompt(null, t, {}, {}, 'Python');
    expect(result).not.toContain('Language: Python');
  });

  it('should skip invisible custom sections', () => {
    const t = { ...template, customSections: [{ id: 's1', name: 'Hidden', type: 'textarea', isVisible: false, required: false }] };
    const result = generatePrompt(null, t, { s1: 'Should not show' }, {}, 'JS');
    expect(result).not.toContain('Hidden:');
  });

  it('should not add empty sections', () => {
    const t = { ...template, customSections: [{ id: 's1', name: 'Empty', type: 'textarea', isVisible: true, required: false }] };
    const result = generatePrompt(null, t, {}, {}, 'JS');
    expect(result).not.toContain('Empty:');
  });
});
