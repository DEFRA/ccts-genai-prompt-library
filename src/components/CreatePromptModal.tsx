import { BrainCircuit, ChevronDown, Code2, UserCircle2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../components/Modal';
import { Select } from '../components/Select';
import { languages } from '../data/languages';
import { useCustomSectionValidation } from '../hooks/useCustomSectionValidation';
import { useFileHandlers } from '../hooks/useFileHandlers';
import { useFormValidation } from '../hooks/useFormValidation';
import { useMultiSelectState } from '../hooks/useMultiSelectState';
import { usePromptFormState } from '../hooks/usePromptFormState';
import { usePromptFormValidation } from '../hooks/usePromptFormValidation';
import { usePromptHandlers } from '../hooks/usePromptHandlers';
import { useRoleAndExpertise } from '../hooks/useRoleAndExpertise';
import { useTemplateSelection } from '../hooks/useTemplateSelection';
import { useRoleStore } from '../store/roleStore';
import { useTemplateStore } from '../store/templateStore';
import { useStore } from '../store/useStore';
import '../styles/SimplePromptModal.css';
import { Template } from '../types';
import { getFileExtension } from '../utils/fileUtils';
import { PreviewPage } from './PreviewPage';
import { TemplateSectionRenderer } from './TemplateSectionRenderer';

interface FileData {
  id: string;
  name: string;
  content: string;
}

interface CustomTextArea {
  id: string;
  name: string;
  content: string;
}

interface CustomSectionData {
  sectionId: string;
  name: string;
  content: string;
}



const getFinalContent = (
  template: Template | null,
  formData: any, 
  getFileExtension: (filename: string) => string,
  customSections: { [key: string]: string },
  selectedMultiSections: { [key: string]: string[] },
  fileNames: { [key: string]: string }
) => {
  if (!template) return '';

  const sections = [];

  if (template.raceRole?.trim()) {
    sections.push({
      header: '### Role:',
      content: template.raceRole.trim()
    });
  }

  if (template.raceAction?.trim()) {
    sections.push({
      header: '### Action:',
      content: template.raceAction.trim()
    });
  }

  if (template.raceContext?.trim()) {
    sections.push({
      header: '### Context:',
      content: template.raceContext.trim()
    });
  }

  if (template.raceExecute?.trim()) {
    sections.push({
      header: '### Execute:',
      content: template.raceExecute.trim()
    });
  }

  template.customSections?.forEach(section => {
    if (!section.isVisible) return;

    let sectionContent = '';
    if (section.type === 'multiselect') {
      const selectedValues = selectedMultiSections[section.id] || [];
      sectionContent = selectedValues.length > 0
        ? selectedValues.map(value => `- ${value}`).join('\n')
        : '';
    } else if (section.type === 'file') {
      const content = customSections[section.id] || '';
      const fileName = fileNames[section.id];
      sectionContent = content ? `[File: ${fileName}]\n${content}` : '';
    } else {
      sectionContent = customSections[section.id] || '';
    }

    if (sectionContent) {
      sections.push({
        header: `### ${section.name}:`,
        content: sectionContent
      });
    }
  });

  if (template.showProgrammingLanguage && formData?.programmingLanguage) {
    sections.push({
      header: '### Programming Language:',
      content: formData.programmingLanguage
    });
  }

  return sections
    .map(section => `${section.header}\n${section.content}`)
    .join('\n\n');
};

const inputStyles = "w-full px-3 py-2 text-sm rounded-xs bg-white dark:bg-vscode-input-bg text-gray-800 dark:text-vscode-input-fg border border-gray-300 dark:border-vscode-border focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-vscode-active placeholder-gray-500 dark:placeholder-vscode-input-fg/50";
const textareaStyles = "w-full px-3 py-2 text-sm rounded-xs bg-white dark:bg-vscode-input-bg text-gray-800 dark:text-vscode-input-fg border border-gray-300 dark:border-vscode-border focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-vscode-active placeholder-gray-500 dark:placeholder-vscode-input-fg/50 resize-none";
const selectStyles = "w-full px-3 py-2 text-sm rounded-xs bg-white dark:bg-vscode-dropdown text-gray-800 dark:text-vscode-dropdown-fg border border-gray-300 dark:border-vscode-border focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-vscode-active";
const sectionStyles = " p-2 space-y-6 bg-vscode-panel flex-grow overflow-y-auto";
const labelStyles = "block text-sm font-semibold text-gray-700 dark:text-vscode-fg mb-2";

export const CreatePromptModal: React.FC = () => {
  const { 
    isCreateModalOpen, 
    toggleCreateModal, 
    selectedTemplateForPrompt,
    setSelectedTemplateForPrompt,
    modalMode 
  } = useStore();

  const {
    selectedMultiSections,
    setSelectedMultiSections,
    handleMultiSelectChange
  } = useMultiSelectState(selectedTemplateForPrompt);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    checkedPractices: [] as { description: string; label: string; }[],
    additionalText: '',
    uploadedFiles: [] as FileData[],
    customTextAreas: [] as CustomTextArea[],
    programmingLanguage: '',
    outputValidation: '',
    customSections: [] as CustomSectionData[],
    name: '',
    roleDescription: '',
    expertise: '',
    role: '',
    templateId: ''
  });
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});
  const [customSections, setCustomSections] = useState<{ [key: string]: string }>({});
  const [showPreview, setShowPreview] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const { validateSections } = useCustomSectionValidation();
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [shakingSections, setShakingSections] = useState<Set<string>>(new Set());
  const firstInputRef = useRef<HTMLSelectElement>(null);

  const { templates, userTemplates } = useTemplateStore();
  const { isValid, setIsValid } = useFormValidation();
  const { getAllRoles } = useRoleStore();
  const allRoles = useMemo(() => getAllRoles(), [getAllRoles]);
  const {
    selectedRole: roleFromExpertise,
    setSelectedRole: setRoleFromExpertise,
    selectedExpertise,
    setSelectedExpertise,
    expertiseOptions,
  } = useRoleAndExpertise({ roles: allRoles });

  const allTemplates = useMemo(() => [...templates, ...userTemplates], [templates, userTemplates]);
  const { filteredTemplates, updateFilteredTemplates } = useTemplateSelection(allTemplates);
  
  const handleCustomSectionChange = useCallback((sectionId: string, value: string) => {

    setCustomSections(prev => ({
          ...prev,
      [sectionId]: value
    }));
  }, []);

  const { handleFileChange } = useFileHandlers(
    handleCustomSectionChange,
    setFileNames
  );

  usePromptFormState(updateFilteredTemplates);

  usePromptFormValidation(
    roleFromExpertise,
        selectedTemplateForPrompt, 
        customSections,
        selectedMultiSections,
    formData.programmingLanguage,
    setIsValid,
    modalMode
  );

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    setFormData({
      title: '',
      content: '',
      description: '',
      checkedPractices: [],
      additionalText: '',
      uploadedFiles: [],
      customTextAreas: [],
      programmingLanguage: '',
      outputValidation: '',
      customSections: [],
      name: '',
      roleDescription: '',
      expertise: '',
      role: '',
      templateId: ''
    });
    setCustomSections({});
    setSelectedMultiSections({});
    setFileNames({});
    setShowPreview(false);
    toggleCreateModal();
    setSelectedTemplateForPrompt(null);
  };


  const {
    handleInputChange,
    handlePreview,
    handleCopySuccess
  } = usePromptHandlers({
    setFormData,
    setShowPreview,
    setShowCopySuccess,
    setValidationErrors,
    setShakingSections: (sections: string[]) => setShakingSections(new Set(sections)),
    selectedTemplateForPrompt, 
    customSections,
    selectedMultiSections
  });

  const handleCheckAll = useCallback((sectionId: string, options: string[]) => {
    setSelectedMultiSections(prev => ({
      ...prev,
      [sectionId]: [...options]
    }));
  }, [setSelectedMultiSections]);

  const handleUncheckAll = useCallback((sectionId: string) => {
    setSelectedMultiSections(prev => ({
      ...prev,
      [sectionId]: []
    }));
  }, [setSelectedMultiSections]);

  const handleRoleChange = useCallback((roleId: string) => {
    setRoleFromExpertise(roleId);
    setSelectedExpertise('');
    setSelectedTemplateForPrompt(null);
    updateFilteredTemplates(roleId, '');
  }, [setRoleFromExpertise, setSelectedTemplateForPrompt, updateFilteredTemplates]);

  const handleExpertiseChange = useCallback((expertise: string) => {
    setSelectedExpertise(expertise);
    setSelectedTemplateForPrompt(null);
    updateFilteredTemplates(roleFromExpertise || '', expertise);
  }, [roleFromExpertise, setSelectedExpertise, setSelectedTemplateForPrompt, updateFilteredTemplates]);

  useEffect(() => {
    if (roleFromExpertise) {
      updateFilteredTemplates(roleFromExpertise, selectedExpertise || '');
    }
  }, [roleFromExpertise, selectedExpertise, updateFilteredTemplates]);

 

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = await validateSections(
        selectedTemplateForPrompt?.customSections || [],
        customSections,
        selectedMultiSections
      );

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShakingSections(new Set(Object.keys(validation.errors)));
        setTimeout(() => {
          setValidationErrors({});
          setShakingSections(new Set());
        }, 5000);
        return;
      }

      handlePreview();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  useEffect(() => {
    if (isCreateModalOpen) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isCreateModalOpen]);

  const templateOptions = useMemo(() => {
    return userTemplates
      .filter(template => 
        (!roleFromExpertise || template.role === roleFromExpertise) &&
        (!selectedExpertise || template.expertise === selectedExpertise)
      )
      .map(template => ({
        value: template.id,
        label: template.name
      }));
  }, [userTemplates, roleFromExpertise, selectedExpertise]);

  if (!isCreateModalOpen || (modalMode !== 'createPrompt' && modalMode !== 'createPromptWithTemplate')) {
    return null;
  }

  return (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleClose}
          size="full"
          className="w-screen h-screen max-w-screen max-h-screen overflow-visible font-sans bg-gray-50 dark:bg-vscode-editor-background"
          title={modalMode === 'createPromptWithTemplate' 
            ? selectedTemplateForPrompt?.name || 'Create Prompt' 
            : 'Create Prompt'
          }
        >
      <form onSubmit={handleFormSubmit} className="p-2 overflow-y-auto scrollbar-hide" style={{ height: 'calc(100vh - 60px)' }}>
            <div className="space-y-6">
              {}
              {modalMode === 'createPrompt' && (
                <div className={sectionStyles}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="role" className={labelStyles}>
                        Role 
                        {" "}
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                          (Select a professional persona)
                        </span>{" "}
                      </label>
                      <div className="relative">
                        <select
                          ref={firstInputRef}
                          id="role"
                          value={roleFromExpertise || ''}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className={selectStyles}
                        >
                          <option value="">Choose a Role</option>
                          {allRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <UserCircle2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {}
                    {roleFromExpertise && expertiseOptions.length > 0 && (
                      <div className="animate-fadeIn">
                        <label htmlFor="expertise-select" className={labelStyles}>
                          Expertise
                          {" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                            (Choose expertise)
                          </span>
                          {" "}
                        </label>
                        <div className="relative">
                          <select
                            id="expertise-select"
                            value={selectedExpertise || ''}
                            onChange={(e) => handleExpertiseChange(e.target.value)}
                            className={selectStyles}
                          >
                            <option value="">Select expertise...</option>
                            {expertiseOptions.map(expertise => (
                              <option key={`expertise-${expertise}`} value={expertise}>
                                {expertise}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <BrainCircuit className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                      </div>
                    )}

                    {}
                    {roleFromExpertise && selectedExpertise && filteredTemplates.length > 0 && (
                      <div className="animate-fadeIn">
                        <label 
                          htmlFor="template-select"
                          className={labelStyles}
                        >
                          Template
                          {" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                            (Select a template to use)
                          </span>
                          {" "}
                        </label>
                        <div className="relative">
                          <Select
                            options={templateOptions}
                            value={selectedTemplateForPrompt?.id || ''}
                            onChange={(value) => {
                              const template = userTemplates.find(t => t.id === value);
                              if (template) {
                                setSelectedTemplateForPrompt(template);
                                setFormData(prev => ({
                                  ...prev,
                                  role: template.role,
                                  expertise: template.expertise
                                }));
                              }
                            }}
                            placeholder="Select a template"
                            className="w-full"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {}
              {selectedTemplateForPrompt && (
                <div className={sectionStyles}>
                  <div className="space-y-4">
                    {selectedTemplateForPrompt.customSections?.map(section => (
                      <TemplateSectionRenderer
                        key={section.id}
                        section={section}
                        customSections={customSections}
                        selectedMultiSections={selectedMultiSections}
                        fileNames={fileNames}
                        templateSectionErrors={validationErrors}
                        templateShakingSections={shakingSections}
                        handleCustomSectionChange={handleCustomSectionChange}
                        handleFileChange={handleFileChange}
                        handleMultiSelectChange={handleMultiSelectChange}
                        handleCheckAll={handleCheckAll}
                        handleUncheckAll={handleUncheckAll}
                        setSelectedMultiSections={setSelectedMultiSections}
                      />
                    ))}

                    {}
                    {selectedTemplateForPrompt?.showProgrammingLanguage && (
                      <div className="space-y-2">
                        <label 
                          htmlFor="programming-language"
                          className={labelStyles}
                        >
                          Output Language
                          {" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                            (Select output format)
                          </span>
                          {" "}
                        </label>
                        <div className="relative">
                          <select
                            id="programming-language"
                            value={formData.programmingLanguage}
                            onChange={(e) => handleInputChange('programmingLanguage', e.target.value)}
                            className={selectStyles}
                          >
                            <option value="">Select a programming language...</option>
                            {languages.map(lang => (
                              <option key={lang.id} value={lang.id}>
                                {lang.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Code2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="submit"
                  className={`
                    px-4 py-2 text-sm rounded-sm transition-all duration-200
                    ${!isValid 
                      ? 'bg-vscode-input-bg text-vscode-fg border-b border-vscode-border bg-vscode-section cursor-not-allowed opacity-90' 
                      : 'bg-vscode-button text-vscode-button-fg hover:bg-vscode-button-hover'
                    }
                    flex items-center gap-2
                  `}
                  disabled={!isValid}
                  title={!isValid ? "Please fill in all required fields" : "Create prompt"}
                >
                  {!isValid ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-vscode-error/50 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-vscode-error"></span>
                      </span>
                      <span>Fill Required Fields</span>
                    </>
                  ) : (
                    'Create Prompt'
                  )}
                </button>
              </div>
            </div>
      </form>

      {showPreview && (
        <PreviewPage
          isOpen={showPreview}
          content={getFinalContent(
            selectedTemplateForPrompt, 
            formData, 
            getFileExtension,
            customSections,
            selectedMultiSections,
            fileNames
          )}
          onBack={() => setShowPreview(false)}
          onCopy={handleCopySuccess}
          showCopySuccess={showCopySuccess}
        />
      )}
    </Modal>
  );
};

export default CreatePromptModal;
export { getFinalContent };

