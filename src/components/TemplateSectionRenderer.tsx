import React from "react";
import { CustomSection } from "../types";
import { MultiSelectSection } from "./sections/MultiSelectSection";
import { FileUploadSection } from "./sections/FileUploadSection";
import { TextAreaSection } from "./sections/TextAreaSection";
import { SelectSection } from "./sections/SelectSection";

const inputStyles =
  "w-full px-3 py-2 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active placeholder-vscode-input-fg/50";

const textareaStyles =
  "w-full px-3 py-2 text-sm rounded-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border focus:outline-none focus:ring-1 focus:ring-vscode-active placeholder-vscode-input-fg/50 resize-none min-h-[100px]";

const labelStyles = "block text-sm font-bold text-vscode-fg mb-1";

const sectionTitleStyles = "text-base font-medium text-vscode-fg mb-4";

interface Props {
  section: CustomSection;
  customSections: { [key: string]: string };
  selectedMultiSections: { [key: string]: any };
  fileNames: { [key: string]: string };
  templateSectionErrors: { [key: string]: string };
  templateShakingSections: Set<string>;
  handleCustomSectionChange: (id: string, value: string) => void;
  handleFileChange: (id: string, file: File) => void;
  handleMultiSelectChange: (
    id: string,
    option: string,
    checked: boolean,
    current: string[]
  ) => string[];
  setSelectedMultiSections: (fn: (prev: any) => any) => void;
  handleCheckAll?: (sectionId: string, options: string[]) => void;
  handleUncheckAll?: (sectionId: string) => void;
}

const sectionComponents: {
  [key: string]: React.FC<any>;
} = {
  textarea: TextAreaSection,
  select: SelectSection,
  multiselect: MultiSelectSection,
  file: FileUploadSection,
};

export const TemplateSectionRenderer: React.FC<Props> = ({
  section,
  customSections,
  selectedMultiSections,
  fileNames,
  templateSectionErrors,
  templateShakingSections,
  handleCustomSectionChange,
  handleFileChange,
  handleMultiSelectChange,
  setSelectedMultiSections,
  handleCheckAll,
  handleUncheckAll,
}) => {
  const getInputClassName = (sectionId: string) => `
    w-full px-3 py-2 border rounded-lg text-sm 
    bg-white dark:bg-gray-800 
    border-gray-300 dark:border-gray-600 
    text-gray-900 dark:text-white
    ${
      templateShakingSections.has(sectionId)
        ? "border-red-500 dark:border-red-500 shake-animation"
        : "border-gray-300 dark:border-gray-700"
    }
    ${
      templateSectionErrors[sectionId]
        ? "border-red-500 dark:border-red-500 ring-2 ring-red-500/20"
        : ""
    }
    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:border-blue-400
    transition-all ease-in-out duration-200
  `;

  const SectionComponent = sectionComponents[section.type];

  if (!SectionComponent) {
    return null;
  }

  return (
    <SectionComponent
      section={section}
      value={customSections[section.id] || ""}
      selectedMultiSections={selectedMultiSections}
      fileNames={fileNames}
      handleCustomSectionChange={handleCustomSectionChange}
      handleFileChange={handleFileChange}
      handleMultiSelectChange={handleMultiSelectChange}
      setSelectedMultiSections={setSelectedMultiSections}
      getInputClassName={getInputClassName}
      templateSectionErrors={templateSectionErrors}
      customSections={customSections}
      handleCheckAll={handleCheckAll}
      handleUncheckAll={handleUncheckAll}
    />
  );
};
