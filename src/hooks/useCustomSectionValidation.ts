import { CustomSection } from "../types";

export const useCustomSectionValidation = () => {
  const validateSections = async (
    sections: CustomSection[],
    customSections: Record<string, string>,
    selectedMultiSections: Record<string, string[]>
  ) => {
    const errors: Record<string, string> = {};
    let isValid = true;

    console.log("Starting validation with:", {
      sections,
      customSections,
      selectedMultiSections,
    });

    for (const section of sections) {
      if (!section.isVisible) continue;

      const content = getSectionContent(
        section,
        customSections,
        selectedMultiSections
      );
      console.log("Validating section:", {
        section,
        content,
        type: section.type,
      });

      if (section.type === "multiselect") {
        if (!validateMultiSelect(section, selectedMultiSections, errors)) {
          isValid = false;
        }
        continue;
      }

      if (!validateRequiredField(section, content, errors)) {
        isValid = false;
      }

      if (section.inputValidation && !validateInput(section, content, errors)) {
        isValid = false;
      }
    }

    console.log("Validation result:", { isValid, errors });
    return { isValid, errors };
  };

  const getSectionContent = (
    section: CustomSection,
    customSections: Record<string, string>,
    selectedMultiSections: Record<string, string[]>
  ): string | string[] => {
    return section.type === "multiselect"
      ? selectedMultiSections[section.id] || []
      : customSections[section.id] || "";
  };

  const validateMultiSelect = (
    section: CustomSection,
    selectedMultiSections: Record<string, string[]>,
    errors: Record<string, string>
  ): boolean => {
    const selectedValues = selectedMultiSections[section.id] || [];
    if (section.required && selectedValues.length === 0) {
      errors[section.id] = `${section.name} is required`;
      return false;
    }
    return true;
  };

  const validateRequiredField = (
    section: CustomSection,
    content: string | string[],
    errors: Record<string, string>
  ): boolean => {
    if (
      section.required &&
      (!content || (typeof content === "string" && !content.trim()))
    ) {
      errors[section.id] = `${section.name} is required`;
      return false;
    }
    return true;
  };

  const validateInput = (
    section: CustomSection,
    content: string | string[],
    errors: Record<string, string>
  ): boolean => {
    if (Array.isArray(content) || !section.inputValidation) {
      return true;
    }

    const { type, pattern, errorMessage, language } = section.inputValidation;
    
    switch (type) {
      case "code-snippet":
        return validateCodeSnippet(
          content,
          language,
          errorMessage,
          errors,
          section.id
        );
      case "bdd":
        return validateBDD(content, errorMessage, errors, section.id);
      case "regex":
        return validateRegex(
          content,
          pattern,
          errorMessage,
          errors,
          section.id
        );
      default:
        return true;
    }
  };

  const validateCodeSnippet = (
    content: string,
    language: string | undefined,
    errorMessage: string | undefined,
    errors: Record<string, string>,
    sectionId: string
  ): boolean => {
    const languagePatterns = getLanguagePatterns();
    const genericCodePatterns = getGenericCodePatterns();

    if (language && languagePatterns[language.toLowerCase()]) {
      const patterns = languagePatterns[language.toLowerCase()];
      if (!Object.values(patterns).some((pattern) => pattern.test(content))) {
        errors[sectionId] =
          errorMessage || `Please provide valid ${language} code`;
        return false;
      }
    } else if (!genericCodePatterns.some((pattern) => pattern.test(content))) {
      errors[sectionId] =
        errorMessage || "Please provide valid code content, not plain text";
      return false;
    }

    const meaningfulLines = content
      .split("\n")
      .filter((line) => line.trim().length > 0);
    if (meaningfulLines.length === 0) {
      errors[sectionId] =
        errorMessage || "Code snippet must contain meaningful content";
      return false;
    }

    return true;
  };

  const validateBDD = (
    content: string,
    errorMessage: string | undefined,
    errors: Record<string, string>,
    sectionId: string
  ): boolean => {
    const bddKeywords = ["Scenario", "Given", "When", "Then"];
    if (
      !bddKeywords.every((keyword) =>
        content.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      errors[sectionId] =
        errorMessage ||
        "BDD scenario must include Scenario, Given, When, and Then statements";
      return false;
    }
    return true;
  };

  const validateRegex = (
    content: string,
    pattern: string | undefined,
    errorMessage: string | undefined,
    errors: Record<string, string>,
    sectionId: string
  ): boolean => {
    if (pattern && !new RegExp(pattern).test(content)) {
      errors[sectionId] = errorMessage || "Invalid format";
      return false;
    }
    return true;
  };

  interface LanguagePattern {
    [key: string]: RegExp;
  }

  interface LanguagePatterns {
    [key: string]: LanguagePattern;
  }

  const getLanguagePatterns = (): LanguagePatterns => ({    groovy: {
      keywords: /\b(?:def|class|extends|implements|package|import|return)\b/,
      syntax: /[@${}()[\]]/,
      declarations: /\b(?:def|class|interface)\s+[a-zA-Z_]\w{0,30}/,
      groovySpecific: /\b(?:println|print|each|in|it|delegate|owner)\b|\$\{[^}]{0,100}\}|->/,
    },
  });  const getGenericCodePatterns = (): RegExp[] => [
    /[{}()<>]/,
    /\b(?:function|class|if|else|for|while|return)\b/,
    /[<>!=]=|&&|\|\||[-+*/%]=?/,
    /\b[a-zA-Z_]\w{0,30}\s{0,3}\([^)]{0,100}\)/,
    /^\s{0,10}[a-zA-Z_]\w{0,30}\s{0,3}[=:]/m,
    /^\s{0,10}(?:\/\/|\/\*|\*\/|#)/m,
    /<[^>]{1,100}>/,
    /\$\{?[a-zA-Z_]\w{0,30}\}?/,
    /@[a-zA-Z_]\w{0,30}/,
    /`[^`]{0,1000}`|'[^']{0,1000}'|"[^"]{0,1000}"/,
  ];

  return { validateSections };
};
