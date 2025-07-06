import { Dispatch, SetStateAction } from "react";

export const useFileHandlers = (
  handleCustomSectionChange: (id: string, content: string) => void,
  setFileNames: Dispatch<SetStateAction<{ [key: string]: string }>>
) => {
  const handleFileChange = (sectionId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleCustomSectionChange(sectionId, content);
      setFileNames((prev) => ({
        ...prev,
        [sectionId]: file.name,
      }));
    };
    reader.readAsText(file);
  };

  const addOption = (current: string[], option: string): string[] => [
    ...current,
    option,
  ];

  const removeOption = (current: string[], option: string): string[] =>
    current.filter((item) => item !== option);

  const handleOptionAdd = (
    id: string,
    option: string,
    current: string[]
  ): string[] => {
    return addOption(current, option);
  };

  const handleOptionRemove = (
    id: string,
    option: string,
    current: string[]
  ): string[] => {
    return removeOption(current, option);
  };

  const handleMultiSelectChange = (
    id: string,
    option: string,
    checked: boolean,
    current: string[]
  ): string[] => {
    if (checked) {
      return handleOptionAdd(id, option, current);
    }
    return handleOptionRemove(id, option, current);
  };

  return { handleFileChange, handleMultiSelectChange };
};
