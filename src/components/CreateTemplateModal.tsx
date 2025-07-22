import { Edit2, Plus, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useRoleStore } from '../store/roleStore';
import { useTemplateStore } from '../store/templateStore';
import { useStore } from '../store/useStore';
import { CustomSection, Role, Template } from '../types';
import { generateId } from '../utils/generateId';
import { Modal } from './Modal';
import { ErrorMessage } from './ErrorMessage';
import { useFocusEffect } from '../hooks/useFocusEffect';

interface CreateTemplateModalProps {
  initialData?: Partial<Template>;
}

interface NewCustomSection {
  name: string;
  description: string;
}

interface NewSection {
  id: string;
  name: string;
  description: string;
  type: 'textarea' | 'select' | 'multiselect' | 'file';
  options: string[];
  isVisible: boolean;
  required: boolean;
  inputValidation?: {
    type: 'regex' | 'bdd' | 'code-snippet';
    pattern?: string;
    errorMessage?: string;
    language?: string;
  };
  acceptedFileTypes?: string;
  placeholder?: string;
}

type ValidationInputType = 'regex' | 'bdd' | 'code-snippet';
type ValidationType = ValidationInputType | 'none';
type SectionType = 'textarea' | 'select' | 'multiselect' | 'file';

interface FormData {
  name: string;
  description: string;
  role: string;
  expertise: string;
  raceRole: string;
  raceAction: string;
  raceContext: string;
  raceExecute: string;
  customSections: CustomSection[];
  showProgrammingLanguage: boolean;
}

const createUniqueId = (prefix: string, value: string, index: number) => `${prefix}-${value}-${index}`;

const useFormState = create(
  persist<{
    formData: FormData;
    newSection: NewSection;
    setFormData: (newState: FormData | ((prev: FormData) => FormData)) => void;
    setNewSection: (newState: NewSection | ((prev: NewSection) => NewSection)) => void;
  }>(
    (set) => ({
      formData: {
        name: '',
        description: '',
        role: '',
        expertise: '',
        raceRole: '',
        raceAction: '',
        raceContext: '',
        raceExecute: '',
        customSections: [],
        showProgrammingLanguage: false
      },
      newSection: {
        id: generateId(),
        name: '',
        description: '',
        type: 'textarea' as const,
        options: [],
        isVisible: true,
        required: false,
        inputValidation: undefined
      },
      setFormData: (newState) => set((state) => ({
        formData: typeof newState === 'function' ? newState(state.formData) : newState
      })),
      setNewSection: (newState) => set((state) => ({
        newSection: typeof newState === 'function' ? newState(state.newSection) : newState
      }))
    }),
    {
      name: 'template-form-state',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

const useTemplateForm = () => {
  const { formData, setFormData } = useFormState();
  const { newSection, setNewSection } = useFormState();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [editingSection, setEditingSection] = useState<{id: string, section: CustomSection} | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newOption, setNewOption] = useState('');
  
  return {
    formData, setFormData,
    newSection, setNewSection,
    allRoles, setAllRoles,
    editingSection, setEditingSection,
    showAddSection, setShowAddSection,
    newOption, setNewOption
  };
};

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({ initialData }) => {
  const {
    formData, setFormData,
    newSection, setNewSection,
    allRoles, setAllRoles,
    editingSection, setEditingSection,
    showAddSection, setShowAddSection,
    newOption, setNewOption
  } = useTemplateForm();

  const { addTemplate, updateTemplate, overrideDefaultTemplate } = useTemplateStore();
  const { getAllRoles } = useRoleStore();
  const { 
    isCreateModalOpen, 
    toggleCreateModal, 
    modalMode,
    setModalMode,
    selectedTemplate,
    setSelectedTemplate,
    setInitialRoleId
  } = useStore();


  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
  }, [showAddSection]);

  useEffect(() => {
    if (isCreateModalOpen && modalMode === 'updateTemplate' && selectedTemplate) {
      const mappedCustomSections = selectedTemplate.customSections?.map(section => ({
        ...section,
        id: section.id || generateId(),
        name: section.name,
        description: section.description || '',
        type: section.type || 'textarea',
        options: section.options || [],
        isVisible: section.isVisible ?? true,
        required: section.required || false,
        content: section.content || '',
        inputValidation: section.inputValidation ? {
          type: section.inputValidation.type,
          pattern: section.inputValidation.pattern || '',
          errorMessage: section.inputValidation.errorMessage || '',
          language: section.inputValidation.language
        } : undefined
      })) || [];

      setNewSection({
        id: generateId(),
        name: '',
        description: '',
        type: 'textarea' as const,
        options: [],
        isVisible: true,
        required: false,
        inputValidation: undefined
      });
      setEditingSection(null);
      setShowAddSection(false);
      setNewOption('');

      setFormData({
        name: selectedTemplate.name || '',
        description: selectedTemplate.description || '',
        role: selectedTemplate.role || '',
        expertise: selectedTemplate.expertise || '',
        raceRole: selectedTemplate.raceRole || '',
        raceAction: selectedTemplate.raceAction || '',
        raceContext: selectedTemplate.raceContext || '',
        raceExecute: selectedTemplate.raceExecute || '',
        customSections: mappedCustomSections,
        showProgrammingLanguage: selectedTemplate.showProgrammingLanguage || false
      });
    }
  }, [isCreateModalOpen, modalMode, selectedTemplate]);

  useEffect(() => {
    setAllRoles(getAllRoles());
  }, [getAllRoles]);

  const expertiseOptions = useMemo(() => {
    if (!formData.role) return [];
    const selectedRole = allRoles.find(r => r.id === formData.role);
    return selectedRole?.expertise || [];
  }, [formData.role, allRoles]);

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = allRoles.find(r => r.id === e.target.value);
    const roleDescription = selectedRole?.description ? `, ${selectedRole.description}` : '';
    const raceRoleText = selectedRole ? `Act as ${selectedRole.name}${roleDescription}` : '';
    
    setFormData(prev => ({
      ...prev,
      role: e.target.value,
      raceRole: raceRoleText
    }));
  };


  const handleClose = () => {
    console.log('handleClose triggered');
    setFormData({
      name: '',
      description: '',
      role: '',
      expertise: '',
      raceRole: '',
      raceAction: '',
      raceContext: '',
      raceExecute: '',
      customSections: [],
      showProgrammingLanguage: false
    });

    setShowAddSection(false);
    setNewSection({
      id: generateId(),
      name: '',
      description: '',
      type: 'textarea' as const,
      options: [],
      isVisible: true,
      required: false,
      inputValidation: undefined
    });
    setEditingSection(null);

    setSelectedTemplate(null);
    setInitialRoleId(null);

    toggleCreateModal();
  };
  const validateForm = (): boolean => {
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Template name is required');
      return false;
    }

    if (!formData.role) {
      toast.error('Role selection is required');
      return false;
    }
    
    if (!formData.expertise) {
      toast.error('Expertise selection is required');
      return false;
    }
    
    if (!formData.raceAction?.trim()) {
      toast.error('RACE Action description is required');
      return false;
    }

    return true;
  };

  const handleSaveTemplate = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    const templateData = {
      ...formData,
      id: selectedTemplate?.id || generateId(),
      createdAt: selectedTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      setIsSubmitting(true);
      
      if (modalMode === 'updateTemplate') {
        if (selectedTemplate?.isDefault) {
          overrideDefaultTemplate({
            ...templateData,
            id: templateData.id,
            isDefault: true
          });
          toast.success('Default template updated successfully');
        } else {
          updateTemplate(templateData);
          toast.success('Template updated successfully');
        }
      } else {
        addTemplate({
          ...templateData,
          id: generateId(),
          isDefault: false
        });
        toast.success('Template created successfully');
      }
      
      toggleCreateModal();
      setModalMode('createTemplate');
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Error saving template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isCreateModalOpen]);

  const handleEditSection = (index: number) => {
    const section = formData.customSections[index];
    setNewSection({
      id: section.id,
      name: section.name,
      description: section.description || '',
      type: section.type || 'textarea',
      options: section.options || [],
      isVisible: section.isVisible ?? true,
      required: section.required || false,
      inputValidation: section.inputValidation ? {
        type: section.inputValidation.type,
        pattern: section.inputValidation.pattern || '',
        errorMessage: section.inputValidation.errorMessage || '',
        language: section.inputValidation.language
      } : undefined,
      placeholder: section.placeholder || ''
    });
    setEditingSection({ id: section.id, section });
    setShowAddSection(true);
  };

  const handleDeleteSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== index)
    }));
  };

  const handleOptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewOption(e.target.value);
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newOption.trim()) {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleAddOption = () => {
    if (!newOption.trim()) {
      toast.error('Option cannot be empty');
      return;
    }

    if (newSection.options.includes(newOption.trim())) {
      toast.error('Option already exists');
      return;
    }

    setNewSection(prev => ({
      ...prev,
      options: [...prev.options, newOption.trim()]
    }));
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    setNewSection(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleCancelAddSection = useCallback(() => {
    if (editingSection) {
      const currentSection = formData.customSections.find(s => s.id === editingSection.id);
      if (currentSection) {
        setNewSection({
          id: currentSection.id,
          name: currentSection.name,
          description: currentSection.description || '',
          type: currentSection.type || 'textarea',
          options: currentSection.options || [],
          isVisible: currentSection.isVisible ?? true,
          required: currentSection.required || false,
          inputValidation: currentSection.inputValidation ? {
            type: currentSection.inputValidation.type,
            pattern: currentSection.inputValidation.pattern || '',
            errorMessage: currentSection.inputValidation.errorMessage || '',
            language: currentSection.inputValidation.language
          } : undefined
        });
      }
    } else {
      setNewSection({
        id: generateId(),
        name: '',
        description: '',
        type: 'textarea' as const,
        options: [],
        isVisible: true,
        required: false,
        inputValidation: undefined
      });
    }
    setShowAddSection(false);
    setEditingSection(null);
    setNewOption('');
  }, [editingSection, formData.customSections]);

  const handleCloseSectionForm = useCallback(() => {
    if (editingSection) {
      handleCancelAddSection();
    } else {
      setShowAddSection(false);
      setNewSection({
        id: generateId(),
        name: '',
        description: '',
        type: 'textarea' as const,
        options: [],
        isVisible: true,
        required: false,
        inputValidation: undefined
      });
      setNewOption('');
    }
  }, [editingSection, handleCancelAddSection]);

  const validateSectionData = (section: NewSection) => {
    const errors: { [key: string]: string } = {};
    
    if (!section.name?.trim()) {
      errors.name = 'Section name is required';
      toast.error('Section name is required');
      return false;
    }
    
    if (section.type === 'select' || section.type === 'multiselect') {
      if (!section.options?.length) {
        errors.options = 'At least one option is required for select/multiselect fields';
        toast.error('At least one option is required for select/multiselect fields');
        return false;
      }
    }

    if (section.inputValidation) {
      if (section.inputValidation.type === 'regex' && !section.inputValidation.pattern) {
        errors.pattern = 'Validation pattern is required';
        toast.error('Validation pattern is required');
        return false;
      }
      if (!section.inputValidation.errorMessage) {
        errors.errorMessage = 'Error message is required for validation';
        toast.error('Error message is required for validation');
        return false;
      }
    }
    
    return true;
  };


  const handleSaveSection = () => {
    if (!validateSectionData(newSection)) return;

    const sectionData = {
      id: newSection.id,
      name: newSection.name.trim(),
      description: newSection.description?.trim() || '',
      type: newSection.type,
      options: newSection.options || [],
      required: newSection.required,
      inputValidation: newSection.inputValidation,
      isVisible: true,
      placeholder: newSection.placeholder || ''
    };

    setFormData(prev => {
      if (editingSection) {
        return {
          ...prev,
          customSections: prev.customSections.map(s => 
            s.id === editingSection.id ? sectionData : s
          )
        };
      }
      
      return {
        ...prev,
        customSections: [...prev.customSections, sectionData]
      };
    });

    setNewSection({
      id: generateId(),
      name: '',
      description: '',
      type: 'textarea' as const,
      options: [],
      isVisible: true,
      required: false,
      inputValidation: undefined,
      placeholder: ''
    });
    setEditingSection(null);
    setShowAddSection(false);
    setNewOption('');

    toast.success(editingSection ? 'Section updated successfully' : 'Section added successfully');
  };

  const validationTypes = [
    { value: 'regex', label: 'Regular Expression' },
    { value: 'bdd', label: 'BDD Scenario' },
    { value: 'code-snippet', label: 'Code Snippet' }
  ];

  const handleSectionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewSection(prev => ({
      ...prev,
      type: e.target.value as SectionType,
      options: e.target.value === 'select' || e.target.value === 'multiselect' ? [] : prev.options
    }));
  };

  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSection(prev => ({
      ...prev,
      name: e.target.value
    }));
  };

  const handleSectionDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSection(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handleRequiredChange = () => {
    setNewSection(prev => ({
      ...prev,
      required: !prev.required
    }));
  };

  const handleValidationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const validationType = e.target.value as ValidationType;
    const newValidation = validationType === 'none' 
      ? undefined 
      : {
          type: validationType,
          pattern: '',
          errorMessage: '',
          language: validationType === 'code-snippet' ? 'javascript' : undefined
        };
    
    setNewSection(prev => ({
      ...prev,
      inputValidation: newValidation
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewSection(prev => ({
      ...prev,
      inputValidation: {
        ...prev.inputValidation,
        language: e.target.value
      }
    }));
  };

  const handleValidationPatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSection(prev => ({
      ...prev,
      inputValidation: {
        ...prev.inputValidation,
        pattern: e.target.value
      }
    }));
  };

  const handleValidationErrorMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSection(prev => ({
      ...prev,
      inputValidation: {
        ...prev.inputValidation,
        errorMessage: e.target.value
      }
    }));
  };

useFocusEffect(nameInputRef, showAddSection);
  useEffect(() => {
    return () => {
      useFormState.persist.clearStorage();
    };
  }, []);

  if (!isCreateModalOpen) return null;

  const inputStyles = "w-full px-3 py-2 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active placeholder-vscode-input-fg/50";

  const textareaStyles = "w-full px-3 py-2 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active placeholder-vscode-input-fg/50 resize-none min-h-[100px]";

  const selectStyles = "w-full px-3 py-2 text-sm rounded-sm bg-vscode-dropdown text-vscode-dropdown-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active";

  const buttonPrimaryStyles = "px-4 py-2 text-sm bg-vscode-button text-vscode-button-fg rounded-sm hover:bg-vscode-button-hover transition-colors";

  const buttonSecondaryStyles = "px-4 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm hover:bg-vscode-list-hover transition-colors";

  const sectionStyles = "bg-vscode-section border border-vscode-border rounded-sm p-2 space-y-4";

  const labelStyles = "block text-sm font-bold text-vscode-fg mb-1";
  
  const getValidationPlaceholder = (type: ValidationInputType): string => {
    if (type === 'regex') {
      return 'Enter regex pattern';
    }
    if (type === 'bdd') {
      return 'Enter BDD format';
    }
    return 'Enter code format pattern';
  };

  const sectionFormStyles = "bg-vscode-section border border-vscode-border rounded-sm p-4 animate-fadeIn";
  const optionTagStyles = "inline-flex items-center gap-1 px-2 py-1 text-sm bg-vscode-button/20 text-vscode-button-fg rounded-sm";

  const requiredFieldStyles = "text-vscode-error ml-1";

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={handleClose}
      size="full"
      className="w-full h-full max-w-none max-h-none overflow-visible font-vscode"
      title={modalMode === 'updateTemplate' ? 'Edit Template' : 'Create Template'} 
    >
      <form onSubmit={handleSaveTemplate} className="h-full flex flex-col">
        <div className="p-2 space-y-6 bg-vscode-panel flex-grow overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className={labelStyles}>
                Title&nbsp;<span className={requiredFieldStyles}>*</span>
              </label>
              <input
                id="title"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                className={`${inputStyles} ${errors.name ? 'border-vscode-error' : ''}`}
                placeholder="Enter template name"
              />
              <ErrorMessage error={errors.name} />
            </div>

            <div>
              <label htmlFor="description" className={labelStyles}>
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                className={textareaStyles}
                placeholder="Enter template description"
              />
            </div>

            <div>
              <label htmlFor="role" className={labelStyles}>
                Role&nbsp;<span className={requiredFieldStyles}>*</span>
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={handleRoleSelect}
                className={selectStyles}
              >
                <option value="">Select a role</option>
                {allRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.role} />
            </div>

            <div>
              <label htmlFor="expertise" className={labelStyles}>
                Expertise&nbsp;<span className={requiredFieldStyles}>*</span>
              </label>
              <select
                id="expertise"
                value={formData.expertise}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  expertise: e.target.value
                }))}
                className={selectStyles}
              >
                <option value="">Select expertise</option>
                {expertiseOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <ErrorMessage error={errors.expertise} />
            </div>
          <div className={sectionStyles}>
            <h3 className="text-sm font-medium text-vscode-fg mb-4">RACE Framework</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="raceRole" className={labelStyles}>
                  Role&nbsp;<span className={requiredFieldStyles}>*</span>
                </label>
                <textarea
                  id="raceRole"
                  value={formData.raceRole}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    raceRole: e.target.value
                  }))}
                  className={textareaStyles}
                  placeholder="Enter role description"
                />
                <ErrorMessage error={errors.raceRole} />
              </div>

              <div>
                <label htmlFor="raceAction" className={labelStyles}>
                  Action&nbsp;<span className={requiredFieldStyles}>*</span>
                </label>
                <textarea
                  id="raceAction"
                  value={formData.raceAction}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    raceAction: e.target.value
                  }))}
                  className={textareaStyles}
                  placeholder="Enter action description"
                />
                <ErrorMessage error={errors.raceAction} />
              </div>

              <div>
                <label htmlFor="raceContext" className={labelStyles}>
                  Context
                </label>
                <textarea
                  id="raceContext"
                  value={formData.raceContext}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    raceContext: e.target.value
                  }))}
                  className={textareaStyles}
                  placeholder="Enter context description"
                />
              </div>

              <div>
                <label htmlFor="raceExecute" className={labelStyles}>
                  Execute
                </label>
                <textarea
                  id="raceExecute"
                  value={formData.raceExecute}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    raceExecute: e.target.value
                  }))}
                  className={textareaStyles}
                  placeholder="Enter execution steps"
                />
              </div>
            </div>
          </div>
          <div className={sectionStyles}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-vscode-fg">Custom Sections</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setNewSection({
                    id: generateId(),
                    name: '',
                    description: '',
                    type: 'textarea',
                    options: [],
                    isVisible: true,
                    required: false,
                    inputValidation: undefined
                  });
                  setEditingSection(null);
                  setShowAddSection(true);
                }}
                className={buttonSecondaryStyles}
              >
                <span className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Section
                </span>
              </button>
            </div>
            {showAddSection && (
              <div className={sectionFormStyles}>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-vscode-fg">
                    {editingSection ? `Edit Section: ${editingSection.section.name}` : 'Add New Section'}
                  </h4>
                  <button
                    onClick={() => {
                      setShowAddSection(false);
                      setEditingSection(null);
                    }}
                    className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="section-name" className={labelStyles}>
                      Section Name
                    </label>
                    <input
                      id="section-name"
                      type="text"
                      value={newSection.name}
                      onChange={handleSectionNameChange}
                      className={inputStyles}
                      placeholder="Enter section name"
                    />
                    <ErrorMessage error={errors.name} />
                  </div>
                  <div>
                    <label htmlFor="section-description" className={labelStyles}>
                      Description
                    </label>
                    <input
                      id="section-description"
                      type="text"
                      value={newSection.description}
                      onChange={handleSectionDescriptionChange}
                      className={inputStyles}
                      placeholder="Enter section description"
                    />
                    <ErrorMessage error={errors.description} />
                  </div>
                  <div>
                    <label htmlFor="section-type" className={labelStyles}>
                      Type
                    </label>
                    <select
                      id="section-type"
                      value={newSection.type}
                      onChange={handleSectionTypeChange}
                      className={selectStyles}
                    >
                      <option value="textarea">Text Area</option>
                      <option value="select">Single Select</option>
                      <option value="multiselect">Multi Select</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                  {newSection.type === 'textarea' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="validation-type" className={labelStyles}>
                          Validation Type
                        </label>
                        <select
                          id="validation-type"
                          value={newSection.inputValidation?.type || 'none'}
                          onChange={handleValidationTypeChange}
                          className={selectStyles}
                        >
                          <option value="none">No Validation</option>
                          {validationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {newSection.inputValidation && (
                        <>
                          {newSection.inputValidation.type === 'code-snippet' && (
                            <div>
                              <label htmlFor="language" className={labelStyles}>
                                Programming Language
                              </label>
                              <select
                                id="language"
                                value={newSection.inputValidation.language || 'javascript'}
                                onChange={handleLanguageChange}
                                className={selectStyles}
                              >
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="csharp">C#</option>
                                <option value="ruby">Ruby</option>
                              </select>
                            </div>
                          )}

                          <div>
                            <label htmlFor="validation-pattern" className={labelStyles}>
                              Validation Pattern
                            </label>
                            <input
                              id="validation-pattern"
                              type="text"
                              value={newSection.inputValidation.pattern || ''}
                              onChange={handleValidationPatternChange}
                              className={inputStyles}
                              placeholder={getValidationPlaceholder(newSection.inputValidation.type)}
                            />
                          </div>

                          <div>
                            <label htmlFor="error-message" className={labelStyles}>
                              Error Message
                            </label>
                            <input
                              id="error-message"
                              type="text"
                              value={newSection.inputValidation.errorMessage || ''}
                              onChange={handleValidationErrorMessageChange}
                              className={inputStyles}
                              placeholder="Enter error message to display when validation fails"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {(newSection.type === 'select' || newSection.type === 'multiselect') && (
                    <div className="space-y-3">
                      <label htmlFor="section-options" className={labelStyles}>
                        Options
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newSection.options.map((option) => (
                          <span key={option} className={optionTagStyles}>
                            {option}
                            <button
                              onClick={() => handleRemoveOption(newSection.options.indexOf(option))}
                              className="ml-1 p-0.5 hover:text-vscode-error rounded-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          id="section-options"
                          type="text"
                          value={newOption}
                          onChange={handleOptionInputChange}
                          onKeyDown={handleOptionKeyDown}
                          className={inputStyles}
                          placeholder="Type option and press Enter"
                        />
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className={buttonSecondaryStyles}
                          disabled={!newOption.trim()}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSection.required}
                        onChange={handleRequiredChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-vscode-input-bg peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-vscode-active rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-vscode-fg after:border-vscode-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vscode-button"></div>
                      <span className="ml-2 text-sm text-vscode-fg">Required field</span>
                    </label>
                  </div>
                  <div>
                    <label htmlFor="placeholder" className={labelStyles}>
                      Placeholder
                    </label>
                    <input
                      id="placeholder"
                      type="text"
                      value={newSection.placeholder || ''}
                      onChange={(e) => setNewSection(prev => ({
                        ...prev,
                        placeholder: e.target.value
                      }))}
                      className={inputStyles}
                      placeholder="Enter placeholder text"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t border-vscode-border">
                    <button
                      type="button"
                      onClick={handleCloseSectionForm}
                      className={buttonSecondaryStyles}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveSection();
                      }}
                      className={buttonPrimaryStyles}
                      disabled={!newSection.name.trim() || (
                        (newSection.type === 'select' || newSection.type === 'multiselect') && 
                        newSection.options.length === 0
                      )}
                    >
                      {editingSection ? 'Update Section' : 'Add Section'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {formData.customSections.map((section, index) => (
                <section
                  key={section.id}
                  className="group bg-vscode-input-bg border border-vscode-border hover:border-vscode-active rounded-sm p-4 transition-colors"
                  aria-label={`Custom section: ${section.name}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-vscode-fg flex items-center gap-2">
                        {section.name}
                        {section.required && (
                          <span className="text-xs bg-vscode-button/20 text-vscode-button-fg px-1.5 py-0.5 rounded-sm">
                            Required
                          </span>
                        )}
                      </h4>
                      {section.description && (
                        <p className="mt-1 text-xs text-vscode-fg">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEditSection(index);
                        }}
                        className="p-2.5 rounded-sm text-white hover:text-white hover:bg-vscode-list-hover"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(index)}
                        className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-error hover:bg-vscode-list-hover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {section.type === 'select' || section.type === 'multiselect' ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {section.options?.map((option) => (
                        <span
                          key={option}
                          className="px-2 py-1 text-xs bg-vscode-button/10 text-vscode-button-fg rounded-sm"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 px-3 py-2 bg-vscode-panel border border-vscode-border rounded-sm">
                      <span className="text-xs text-vscode-fg">
                        {section.type === 'textarea' ? 'Text Area Input' : 'File Upload Input'}
                      </span>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-vscode-section border border-vscode-border rounded-sm p-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label 
                htmlFor="showProgrammingLanguage" 
                className="text-sm font-medium text-vscode-fg"
              >
                Show Programming Language Field
              </label>
              <p className="text-xs text-vscode-fg mt-1">
                Enable to display programming language selection in prompts
              </p>
            </div>
            <label 
              className="relative inline-flex items-center cursor-pointer"
              aria-label="Show Programming Language Field Toggle"
            >
              <input
                type="checkbox"
                id="showProgrammingLanguage"
                checked={formData.showProgrammingLanguage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  showProgrammingLanguage: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-vscode-input-bg peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-vscode-active rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-vscode-fg after:border-vscode-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vscode-button"></div>
            </label>
          </div>
        </div>
        </div>
          
        <div className="p-2 bg-vscode-panel border-t border-vscode-border mt-auto">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className={buttonSecondaryStyles}
            >
              Cancel
            </button>
            {(() => {
              let buttonLabel = '';
              if (isSubmitting) {
                buttonLabel = 'Creating...';
              } else if (modalMode === 'updateTemplate') {
                buttonLabel = 'Update Template';
              } else {
                buttonLabel = 'Create Template';
              }
              return (
                <button
                  type="submit"
                  className={`${buttonPrimaryStyles} ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {buttonLabel}
                </button>
              );
            })()}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTemplateModal;