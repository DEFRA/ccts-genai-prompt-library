import { Upload } from 'lucide-react';
import React, { useCallback } from 'react';
import { CustomSection } from '../../types';

interface Props {
  section: CustomSection;
  value: string;
  handleCustomSectionChange: (id: string, value: string) => void;
  getInputClassName: (id: string) => string;
  templateSectionErrors: { [key: string]: string };
}

const textareaStyles = "w-full px-3 py-2 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active placeholder-vscode-input-fg/50 resize-none min-h-[100px]";
const labelStyles = "block text-sm font-bold text-vscode-fg mb-1";
const errorStyles = "mt-1 text-sm text-vscode-error";
const descriptionStyles = "mt-1 text-xs text-vscode-fg";

export const TextAreaSection: React.FC<Props> = ({
  section,
  value,
  handleCustomSectionChange,
  getInputClassName,
  templateSectionErrors
}) => {
  const handleFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      handleCustomSectionChange(section.id, text);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  }, [section.id, handleCustomSectionChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-2">
      <label htmlFor={section.id} className={labelStyles}>
        {section.name}
        {section.required && <span className="text-vscode-error ml-1">*</span>}
      </label>
      
      {section.description && (
        <p className={descriptionStyles}>{section.description}</p>
      )}
      
      <div className="relative">
        <textarea
          id={section.id}
          value={value}
          onChange={(e) => handleCustomSectionChange(section.id, e.target.value)}
          placeholder={section.placeholder}
          className={`${textareaStyles} ${
            templateSectionErrors[section.id] ? 'border-vscode-error' : ''
          }`}
          rows={8}
          style={{ minHeight: '200px' }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
        <label 
          htmlFor={`file-upload-${section.id}`}
          className="absolute right-2 top-2 cursor-pointer p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xs hover:border-blue-500 dark:hover:border-blue-400 transition-colors inline-flex items-center justify-center group"
        >
          <input
            id={`file-upload-${section.id}`}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
          <Upload className="h-3.5 w-3.5 text-gray-400" />
          <div className="absolute bottom-full right-0 mb-2 invisible group-hover:visible bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded py-1 px-2 whitespace-nowrap shadow-lg">
            Upload file
          </div>
        </label>
      </div>
      
      {templateSectionErrors[section.id] && (
        <p className={errorStyles}>{templateSectionErrors[section.id]}</p>
      )}
    </div>
  );
}; 