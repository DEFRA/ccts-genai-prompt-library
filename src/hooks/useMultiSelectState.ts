import { useState, useEffect } from "react";
import { Template } from "../types";

export const useMultiSelectState = (template: Template | null) => {
  const [selectedMultiSections, setSelectedMultiSections] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    if (template?.customSections) {
      const initialState = initializeMultiSelectSections(template);
      setSelectedMultiSections(initialState);
    }
  }, [template]);

  const handleMultiSelectChange = (
    sectionId: string,
    option: string,
    checked: boolean,
    current: string[]
  ): string[] => {
    const updatedValues = updateMultiSelectValues(option, checked, current);

    setSelectedMultiSections((prev) => ({
      ...prev,
      [sectionId]: updatedValues,
    }));

    return updatedValues;
  };

  const initializeMultiSelectSections = (
    template: Template
  ): Record<string, string[]> => {
    return template.customSections
      .filter((section) => section.type === "multiselect")
      .reduce(
        (acc, section) => ({
          ...acc,
          [section.id]: [],
        }),
        {}
      );
  };

  const addOption = (current: string[], option: string): string[] => [
    ...current,
    option,
  ];

  const removeOption = (current: string[], option: string): string[] =>
    current.filter((value) => value !== option);

  const updateMultiSelectValues = (
    option: string,
    checked: boolean,
    current: string[]
  ): string[] => {
    if (checked) {
      return addOption(current, option);
    }
    return removeOption(current, option);
  };

  return {
    selectedMultiSections,
    setSelectedMultiSections,
    handleMultiSelectChange,
  };
};
