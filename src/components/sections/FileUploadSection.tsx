import React from 'react';
import { CustomSection } from '../../types';
import { Upload, X } from 'lucide-react';

interface Props {
  section: CustomSection;
  fileNames: { [key: string]: string };
  handleFileChange: (id: string, file: File) => void;
  templateSectionErrors: { [key: string]: string };
}

const labelStyles = "block text-sm font-bold text-vscode-fg mb-1";
const buttonStyles = "px-3 py-2 text-sm bg-vscode-button text-vscode-button-fg rounded-sm hover:bg-vscode-button-hover transition-colors flex items-center gap-2";
const fileNameStyles = "px-3 py-2 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm flex items-center justify-between";
const errorStyles = "mt-1 text-sm text-vscode-error";
const descriptionStyles = "mt-1 text-xs text-vscode-fg";

export const FileUploadSection: React.FC<Props> = ({
  section,
  fileNames,
  handleFileChange,
  templateSectionErrors,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const fileName = fileNames[section.id];

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    handleFileChange(section.id, null as any);
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
      
      <input
        ref={inputRef}
        type="file"
        id={section.id}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileChange(section.id, file);
          }
        }}
        className="hidden"
        accept={section.acceptedFileTypes}
      />
      
      {fileName ? (
        <div className={fileNameStyles}>
          <span className="truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="text-vscode-fg hover:text-vscode-fg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`${buttonStyles} ${
            templateSectionErrors[section.id] ? 'border-vscode-error' : ''
          }`}
        >
          <Upload className="w-4 h-4" />
          {section.placeholder || 'Choose file...'}
        </button>
      )}
      
      {templateSectionErrors[section.id] && (
        <p className={errorStyles}>{templateSectionErrors[section.id]}</p>
      )}
    </div>
  );
}; 