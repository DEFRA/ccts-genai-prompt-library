export const createErrorDetails = (error: unknown, context?: string) => {
  const details: { message: string; timestamp: string; context?: string } = {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };

  if (context) {
    details.context = context;
  }

  return details;
};

/**
 * Generate a unique ID for enhanced prompts
 */
export const generateUniqueId = (): string => {
  // Use crypto for more secure random values if available
  const value = crypto.getRandomValues(new Uint32Array(1))[0];
  // Extract the last 8 digits for consistent testing
  const randomPart = value.toString().slice(-8);
  return `enhance-${Date.now()}-${randomPart}`;
};

/**
 * Get the file extension for a given language
 */
export const getFileExtension = (language: string): string => {
  const extensionMap: Record<string, string> = {
    gherkin: '.feature',
    python: '.py',
    javascript: '.js',
    typescript: '.ts',
    ruby: '.rb',
    csharp: '.cs',
    java: '.java',
    csv: '.csv',
    // Add more mappings as needed
  };

  const lowerCaseLanguage = language.toLowerCase();
  return extensionMap[lowerCaseLanguage] || '.txt';
};

/**
 * Generate a smart file name based on content and language
 */
export const getSmartFileName = (language: string, content: string): string => {
  const extension = getFileExtension(language);
  let fileName = '';

  if (language.toLowerCase() === 'gherkin') {
    // For Gherkin files, extract Feature name
    // Use a more efficient approach to avoid catastrophic backtracking
    const featureRegex = /^Feature:\s*([^\n]*)/m;
    const featureMatch = featureRegex.exec(content);
    if (featureMatch?.[1]) {
      fileName = featureMatch[1].trim().replace(/\s+/g, '');
    } else {
      fileName = 'FeatureTests';
    }
  } else {
    // For other files, use the first line or comment
    const firstLine = content.split('\n')[0].trim();
    // Remove non-word characters using string operations to avoid regex vulnerabilities
    fileName = firstLine
      .split('')
      .filter(char => /\w/.test(char)) // Keep only word characters
      .join('');
  }

  // Limit the length and ensure it's not empty
  fileName = fileName.slice(0, 30) || 'untitled';
  
  return fileName + extension;
};

/**
 * Extract RACE components from a text string
 */
export interface RACEComponents {
  role: string;
  action: string;
  context: string;
  execute: string;
}

/**
 * Check if a line is a section header and return the section type
 */
const getSectionType = (line: string): string | null => {
  if (/^#\s*Role:\s*/i.test(line)) return 'role';
  if (/^#\s*Action:\s*/i.test(line)) return 'action';
  if (/^#\s*Context:\s*/i.test(line)) return 'context';
  if (/^#\s*Execute:\s*/i.test(line)) return 'execute';
  return null;
};

/**
 * Extract the content from a section header line
 */
const extractSectionContent = (line: string, sectionType: string): string => {
  const regexMap: Record<string, RegExp> = {
    role: /^#\s*Role:\s*/i,
    action: /^#\s*Action:\s*/i,
    context: /^#\s*Context:\s*/i,
    execute: /^#\s*Execute:\s*/i,
  };
  
  const regex = regexMap[sectionType];
  return line.replace(regex, '').trim();
};

/**
 * Add content to a section, handling line breaks appropriately
 */
const addToSection = (currentContent: string, newContent: string): string => {
  return currentContent ? `${currentContent}\n${newContent}` : newContent;
};

export const extractRACEComponents = (content: string): RACEComponents => {
  // Use a more efficient approach to avoid catastrophic backtracking
  // Split content into lines and process each section separately
  const lines = content.split('\n');
  let currentSection = '';
  let role = '';
  let action = '';
  let context = '';
  let execute = '';

  for (const line of lines) {
    const sectionType = getSectionType(line);
    
    if (sectionType) {
      currentSection = sectionType;
      const sectionContent = extractSectionContent(line, sectionType);
      
      switch (sectionType) {
        case 'role':
          role = sectionContent;
          break;
        case 'action':
          action = sectionContent;
          break;
        case 'context':
          context = sectionContent;
          break;
        case 'execute':
          execute = sectionContent;
          break;
      }
    } else if (line.startsWith('#') && currentSection) {
      // New section started, stop collecting content
      currentSection = '';
    } else if (currentSection && line.trim()) {
      // Add content to current section
      const contentToAdd = line.trim();
      
      switch (currentSection) {
        case 'role':
          role = addToSection(role, contentToAdd);
          break;
        case 'action':
          action = addToSection(action, contentToAdd);
          break;
        case 'context':
          context = addToSection(context, contentToAdd);
          break;
        case 'execute':
          execute = addToSection(execute, contentToAdd);
          break;
      }
    }
  }

  return {
    role,
    action,
    context,
    execute,
  };
};

// Add any other utility functions needed by EnhancePromptModal
