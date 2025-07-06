import { ChevronDown } from 'lucide-react';
import React from 'react';
import { CustomSection } from '../../types';

interface Props {
  section: CustomSection;
  selectedMultiSections: { [key: string]: string[] };
  handleMultiSelectChange: (id: string, option: string, checked: boolean, current: string[]) => string[];
  setSelectedMultiSections: (fn: (prev: any) => any) => void;
  templateSectionErrors: { [key: string]: string };
  handleCheckAll?: (sectionId: string, options: string[]) => void;
  handleUncheckAll?: (sectionId: string) => void;
}

const labelStyles = "block text-sm font-bold text-vscode-fg mb-1";
const buttonStyles = "px-3 py-2 text-sm bg-vscode-button text-vscode-button-fg rounded-sm hover:bg-vscode-button-hover transition-colors";
const dropdownStyles = "w-full px-3 py-2 text-sm rounded-sm bg-vscode-dropdown text-vscode-dropdown-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active";
const optionStyles = "flex items-center gap-2 px-3 py-2 text-sm text-vscode-fg hover:bg-vscode-list-hover cursor-pointer";

const errorStyles = "mt-1 text-sm text-vscode-error";
const descriptionStyles = "mt-1 text-xs text-vscode-fg";

interface OptionProps {
  option: string;
  checked: boolean;
  onChange: () => void;
}

const MultiSelectOption: React.FC<OptionProps> = ({ option, checked, onChange }) => (
  <label
    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer select-none transition-colors duration-100 rounded-sm
      ${checked ? 'bg-vscode-list-active text-vscode-list-active-fg' : 'text-vscode-fg hover:bg-vscode-list-hover'}
    `}
    style={{ userSelect: 'none' }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="accent-vscode-button mr-2"
    />
    {option}
  </label>
);

export const MultiSelectSection: React.FC<Props> = ({
  section,
  selectedMultiSections,
  handleMultiSelectChange,
  setSelectedMultiSections,
  templateSectionErrors,
  handleCheckAll,
  handleUncheckAll,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const selectedOptions = selectedMultiSections[section.id] ?? [];

  const handleOptionChange = (option: string, checked: boolean) => {
    setSelectedMultiSections((prev: any) => {
      const prevSelected = prev[section.id] ?? [];
      return {
        ...prev,
        [section.id]: checked
          ? prevSelected.filter((v: string) => v !== option)
          : [...prevSelected, option],
      };
    });
  };

  const renderOptions = () =>
    section.options?.map((option) => {
      const checked = selectedOptions.includes(option);
      return (
        <MultiSelectOption
          key={option}
          option={option}
          checked={checked}
          onChange={() => handleOptionChange(option, checked)}
        />
      );
    });



  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectAll() {
    if (handleCheckAll) {
      handleCheckAll(section.id, section.options ?? []);
    }
  }

  function handleClearAll() {
    if (handleUncheckAll) {
      handleUncheckAll(section.id);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={section.id} className={labelStyles}>
        {section.name}
        {section.required && <span className="text-vscode-error ml-1">*</span>}
      </label>
      
      {section.description && (
        <p className={descriptionStyles}>{section.description}</p>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`${dropdownStyles} flex justify-between items-center w-full ${
            templateSectionErrors[section.id] ? 'border-vscode-error' : ''
          }`}
        >
          <span>
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : section.placeholder ?? 'Select options...'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-vscode-dropdown border border-vscode-border rounded-sm shadow-lg">
            {handleCheckAll && handleUncheckAll && (
              <div className="p-2 border-b border-vscode-border flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={buttonStyles}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={buttonStyles}
                >
                  Clear All
                </button>
              </div>
            )}
            
            <div className="max-h-60 overflow-auto w-full">
              {renderOptions()}
            </div>
          </div>
        )}
      </div>
      
      {templateSectionErrors[section.id] && (
        <p className={errorStyles}>{templateSectionErrors[section.id]}</p>
      )}
    </div>
  );
}; 