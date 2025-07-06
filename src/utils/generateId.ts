import { v4 as uuidv4 } from "uuid";

export const generateTemplateId = (): string => {
  return `template-${uuidv4()}`;
};

export const generateSectionId = (): string => {
  return `section-${uuidv4()}`;
};

export const generateId = (): string => {
  return uuidv4();
};

const usedIds = new Set<string>();
export const generateUniqueId = (prefix: string): string => {
  let newId: string;
  do {
    newId = `${prefix}-${uuidv4()}`;
  } while (usedIds.has(newId));

  usedIds.add(newId);
  return newId;
};

export const generateUniqueTemplateId = (): string => {
  return generateUniqueId("template");
};

export const generateUniqueSectionId = (): string => {
  return generateUniqueId("section");
};

export const clearUsedIds = (): void => {
  usedIds.clear();
};
