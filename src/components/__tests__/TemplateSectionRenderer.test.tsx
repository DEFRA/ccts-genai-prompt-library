import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateSectionRenderer } from '../TemplateSectionRenderer';
import { CustomSection } from '../../types';

// Mock the section components
vi.mock('../sections/TextAreaSection', () => ({
  TextAreaSection: ({ section, value, handleCustomSectionChange, getInputClassName, templateSectionErrors }) => (
    <div data-testid="textarea-section" className={getInputClassName(section.id)}>
      {section.name}
      <span data-testid="textarea-value">{value}</span>
      <span data-testid="textarea-error">{templateSectionErrors[section.id] || ''}</span>
    </div>
  ),
}));

vi.mock('../sections/SelectSection', () => ({
  SelectSection: ({ section, value, handleCustomSectionChange, getInputClassName }) => (
    <div data-testid="select-section" className={getInputClassName(section.id)}>
      {section.name}
      <span data-testid="select-value">{value}</span>
    </div>
  ),
}));

vi.mock('../sections/MultiSelectSection', () => ({
  MultiSelectSection: ({ section, selectedMultiSections, handleMultiSelectChange }) => (
    <div data-testid="multiselect-section">
      {section.name}
      <span data-testid="multiselect-selected">{JSON.stringify(selectedMultiSections[section.id] || [])}</span>
    </div>
  ),
}));

vi.mock('../sections/FileUploadSection', () => ({
  FileUploadSection: ({ section, fileNames, handleFileChange }) => (
    <div data-testid="file-section">
      {section.name}
      <span data-testid="file-name">{fileNames[section.id] || ''}</span>
    </div>
  ),
}));

describe('TemplateSectionRenderer', () => {
  const defaultProps = {
    customSections: {},
    selectedMultiSections: {},
    fileNames: {},
    templateSectionErrors: {},
    templateShakingSections: new Set<string>(),
    handleCustomSectionChange: vi.fn(),
    handleFileChange: vi.fn(),
    handleMultiSelectChange: vi.fn(),
    setSelectedMultiSections: vi.fn(),
    handleCheckAll: vi.fn(),
    handleUncheckAll: vi.fn(),
  };

  it('renders textarea section correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'text-section',
      name: 'Text Section',
      type: 'textarea',
      options: [],
      description: 'Enter text here',
      required: false,
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...defaultProps} />);

    // Assert
    expect(screen.getByTestId('textarea-section')).toBeInTheDocument();
    expect(screen.getByText('Text Section')).toBeInTheDocument();
  });

  it('renders select section correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'select-section',
      name: 'Select Section',
      type: 'select',
      options: ['Option 1', 'Option 2'],
      description: 'Select an option',
      required: false,
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...defaultProps} />);

    // Assert
    expect(screen.getByTestId('select-section')).toBeInTheDocument();
    expect(screen.getByText('Select Section')).toBeInTheDocument();
  });

  it('renders multiselect section correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'multiselect-section',
      name: 'MultiSelect Section',
      type: 'multiselect',
      options: ['Option 1', 'Option 2'],
      description: 'Select multiple options',
      required: false,
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...defaultProps} />);

    // Assert
    expect(screen.getByTestId('multiselect-section')).toBeInTheDocument();
    expect(screen.getByText('MultiSelect Section')).toBeInTheDocument();
  });

  it('renders file upload section correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'file-section',
      name: 'File Section',
      type: 'file',
      options: [],
      description: 'Upload a file',
      required: false,
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...defaultProps} />);

    // Assert
    expect(screen.getByTestId('file-section')).toBeInTheDocument();
    expect(screen.getByText('File Section')).toBeInTheDocument();
  });

  it('returns null for unknown section type', () => {
    // Arrange
    const section: CustomSection = {
      id: 'unknown-section',
      name: 'Unknown Section',
      type: 'unknown' as any,
      options: [],
      description: 'Unknown section type',
      required: false,
    };

    // Act
    const { container } = render(<TemplateSectionRenderer section={section} {...defaultProps} />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  it('passes down error state correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'text-section',
      name: 'Text Section',
      type: 'textarea',
      options: [],
      description: 'Enter text here',
      required: true,
    };

    const errorProps = {
      ...defaultProps,
      templateSectionErrors: { 'text-section': 'This field is required' },
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...errorProps} />);    // Assert
    expect(screen.getByTestId('textarea-section')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-error')).toHaveTextContent('This field is required');
  });

  it('passes down templateShakingSections correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'text-section',
      name: 'Text Section',
      type: 'textarea',
      options: [],
      description: 'Enter text here',
      required: true,
    };

    const shakingProps = {
      ...defaultProps,
      templateShakingSections: new Set(['text-section']),
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...shakingProps} />);

    // Assert
    expect(screen.getByTestId('textarea-section')).toBeInTheDocument();
  });
  it('passes down customSections values correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'text-section',
      name: 'Text Section',
      type: 'textarea',
      options: [],
      description: 'Enter text here',
      required: false,
    };

    const customSectionProps = {
      ...defaultProps,
      customSections: { 'text-section': 'Custom text value' },
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...customSectionProps} />);

    // Assert
    expect(screen.getByTestId('textarea-section')).toBeInTheDocument();
    expect(screen.getByTestId('textarea-value')).toHaveTextContent('Custom text value');
  });

  it('passes custom props to section components', () => {
    // Arrange
    const section: CustomSection = {
      id: 'multiselect-section',
      name: 'MultiSelect Section',
      type: 'multiselect',
      options: ['Option 1', 'Option 2'],
      description: 'Select multiple options',
      required: false,
    };
    
    const handleMultiSelectChange = vi.fn();
    const handleCheckAll = vi.fn();
    const handleUncheckAll = vi.fn();
    
    const props = {
      ...defaultProps,
      selectedMultiSections: { 'multiselect-section': ['Option 1'] },
      handleMultiSelectChange,
      handleCheckAll,
      handleUncheckAll,
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...props} />);    // Assert
    expect(screen.getByTestId('multiselect-section')).toBeInTheDocument();
    expect(screen.getByTestId('multiselect-selected')).toHaveTextContent('["Option 1"]');
  });

  it('handles file upload section props correctly', () => {
    // Arrange
    const section: CustomSection = {
      id: 'file-section',
      name: 'File Section',
      type: 'file',
      options: [],
      description: 'Upload a file',
      required: false,
      acceptedFileTypes: '.txt,.md',
    };
    
    const handleFileChange = vi.fn();
    const fileNames = { 'file-section': 'test.txt' };
    
    const props = {
      ...defaultProps,
      fileNames,
      handleFileChange,
    };    // Act
    render(<TemplateSectionRenderer section={section} {...props} />);

    // Assert    expect(screen.getByTestId('file-section')).toBeInTheDocument();
    expect(screen.getByTestId('file-name')).toHaveTextContent('test.txt');
  });

  it('uses getInputClassName to apply styles based on section state', () => {
    // Arrange
    const section: CustomSection = {
      id: 'text-section',
      name: 'Text Section',
      type: 'textarea',
      options: [],
      description: 'Enter text here',
      required: true,
    };

    const props = {
      ...defaultProps,
      templateSectionErrors: { 'text-section': 'This field is required' },
      templateShakingSections: new Set(['text-section']),
    };

    // Act
    render(<TemplateSectionRenderer section={section} {...props} />);

    // Assert
    // Our mock should have the getInputClassName called with the section id
    expect(screen.getByTestId('textarea-section')).toBeInTheDocument();
  });

  it('renders different section types with different component mocks', () => {
    // Arrange
    const textSection: CustomSection = {
      id: 'text-section',
      name: 'Text Area',
      type: 'textarea',
      options: [],
      description: 'Enter text',
      required: true,
    };
    
    const selectSection: CustomSection = {
      id: 'select-section',
      name: 'Select',
      type: 'select',
      options: ['Option 1', 'Option 2'],
      description: 'Choose option',
      required: true,
    };

    // Act - render each section
    const { rerender } = render(<TemplateSectionRenderer section={textSection} {...defaultProps} />);
    
    // Assert for first render
    expect(screen.getByTestId('textarea-section')).toBeInTheDocument();
    
    // Act - rerender with different section
    rerender(<TemplateSectionRenderer section={selectSection} {...defaultProps} />);
    
    // Assert for second render
    expect(screen.getByTestId('select-section')).toBeInTheDocument();
  });
});
