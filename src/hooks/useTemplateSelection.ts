import { useState, useCallback } from "react";
import { Template } from "../types";

export const useTemplateSelection = (allTemplates: Template[]) => {
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  const updateFilteredTemplates = useCallback(
    (roleId: string, expertise: string) => {
      if (!roleId) {
        setFilteredTemplates([]);
        return;
      }

      const filtered = allTemplates
        .filter(
          (template) =>
            template.role === roleId &&
            (!expertise || template.expertise === expertise)
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log("Filtering templates:", { roleId, expertise, filtered });
      setFilteredTemplates(filtered);
    },
    [allTemplates]
  );

  return { filteredTemplates, updateFilteredTemplates };
};
