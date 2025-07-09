import { Template } from "../types";

export const generatePrompt = (
  roleFromExpertise: string | null,
  template: Template,
  customSections: { [key: string]: string },
  selectedMultiSections: { [key: string]: string[] },
  programmingLanguage: string
): string => {
  const sections: string[] = [];

  if (template.raceRole) sections.push(`Role:\n${template.raceRole}`);
  if (template.raceAction) sections.push(`Action:\n${template.raceAction}`);
  if (template.raceContext) sections.push(`Context:\n${template.raceContext}`);
  if (template.raceExpectation)
    sections.push(`Execute:\n${template.raceExpectation}`);

  if (programmingLanguage && template.showProgrammingLanguage) {
    sections.push(`Language: ${programmingLanguage}`);
  }

  template.customSections?.forEach((section) => {
    if (!section.isVisible) return;

    const content =
      section.type === "multiselect"
        ? selectedMultiSections[section.id]?.join("\n")
        : customSections[section.id];

    if (content) {
      sections.push(`${section.name}:\n${content}`);
    }
  });

  return sections.join("\n\n");
};
