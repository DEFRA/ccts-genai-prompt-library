import React from 'react';
import { CustomSection } from '../../types';

interface Props {
  section: CustomSection;
  value: string;
  handleCustomSectionChange: (id: string, value: string) => void;
  templateSectionErrors: { [key: string]: string };
}

const selectStyles = "w-full px-3 py-2 text-sm rounded-sm bg-vscode-dropdown text-vscode-dropdown-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active";
const labelStyles = "block text-sm font-bold text-vscode-fg mb-1";
const errorStyles = "mt-1 text-sm text-vscode-error";
const descriptionStyles = "mt-1 text-xs text-vscode-fg";

export const SelectSection: React.FC<Props> = ({
  section,
  value,
  handleCustomSectionChange,
  templateSectionErrors,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={section.id} className={labelStyles}>
        {section.name}
        {section.required && <span className="text-vscode-error ml-1">*</span>}
      </label>
      
      {section.description && (
        <p className={descriptionStyles}>{section.description}</p>
      )}
      
      <select
        id={section.id}
        value={value}
        onChange={(e) => handleCustomSectionChange(section.id, e.target.value)}
        className={`${selectStyles} ${
          templateSectionErrors[section.id] ? 'border-vscode-error' : ''
        }`}
      >
        <option value="">{section.placeholder || 'Select an option...'}</option>
        {section.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      
      {templateSectionErrors[section.id] && (
        <p className={errorStyles}>{templateSectionErrors[section.id]}</p>
      )}
    </div>
  );
}; 