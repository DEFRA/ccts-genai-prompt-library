import { Template } from "../types";
import { generateId } from "../utils/generateId";

const templateModules = import.meta.glob("./Templates/*.json", { eager: true });

const ensureUniqueId = (templates: Template[]): Template[] => {
  const seenIds = new Set<string>();
  return templates.map((template) => {
    if (seenIds.has(template.id)) {
      template.id = generateId();
    }
    seenIds.add(template.id);
    return template;
  });
};

const processTemplateModule = (module: any): Template[] => {
  if (!Array.isArray(module.default)) {
    return [];
  }

  return module.default.map((template: Template) => ({
    ...template,
    isDefault: true,
    createdBy: template.createdBy || "system",
  }));
};

const loadTemplatesFromFiles = (): Template[] => {
  try {
    const allTemplates = Object.values(templateModules).flatMap((module: any) =>
      processTemplateModule(module)
    );

    return ensureUniqueId(allTemplates);
  } catch (error) {
    console.error("Error loading templates:", error);
    return [];
  }
};

export const defaultTemplates: Template[] = loadTemplatesFromFiles();
