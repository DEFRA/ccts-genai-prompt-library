// Test Data Constants
export const TEST_CONFIG = {
  // Template Data
  TEMPLATE: {
    ID: 'template-1',
    NAME: 'Test Template',
    ROLE: 'role-1',
    EXPERTISE: 'JavaScript',
    CONTENT: 'Test template content',
    SECTION_ID: 'section-1',
    SECTION_NAME: 'Section 1',
  },

  // Role Data
  ROLES: {
    ROLE_1: {
      ID: 'role-1',
      NAME: 'Developer',
      DESCRIPTION: 'Software Developer',
    },
    ROLE_2: {
      ID: 'role-2',
      NAME: 'Designer',
      DESCRIPTION: 'UI Designer',
    },
  },

  // Expertise Options
  EXPERTISE: {
    JAVASCRIPT: 'JavaScript',
    REACT: 'React',
    TYPESCRIPT: 'TypeScript',
    FIGMA: 'Figma',
    UI_UX: 'UI/UX',
  },

  // Section Data
  SECTIONS: {
    SECTION_1: {
      ID: 'section-1',
      NAME: 'Custom Section',
    },
    SECTION_2: {
      ID: 'section-2',
      NAME: 'Multi Select',
    },
    SECTION_3: {
      ID: 'section-3',
      NAME: 'File Section',
    },
    SECTION_4: {
      ID: 'section-4',
      NAME: 'Hidden Section',
    },
  },

  // RACE Data
  RACE: {
    ROLE: 'Developer',
    ACTION: 'Create code',
    CONTEXT: 'Web application',
    EXECUTE: 'Write efficient code',
  },

  // File Data
  FILE: {
    NAME: 'test.js',
    CONTENT: 'File content here',
  },

  // Multi-Select Options
  MULTI_OPTIONS: {
    OPTION_1: 'Option 1',
    OPTION_2: 'Option 2',
  },

  // Programming Language
  PROGRAMMING_LANGUAGE: 'TypeScript',

  // Modal Titles
  MODAL_TITLES: {
    CREATE_PROMPT: 'Create Prompt',
    FILL_REQUIRED_FIELDS: 'Fill Required Fields',
  },

  // Validation Messages
  VALIDATION: {
    ERROR_REQUIRED: 'This field is required',
  },

  // Minimal Template
  MINIMAL_TEMPLATE: {
    ID: 'minimal-1',
    NAME: 'Minimal Template',
    CONTENT: 'Minimal template content',
  },

  // RACE Framework Test Data
  RACE_FRAMEWORK: {
    FRAMEWORK_TITLE: 'RACE Framework',
    TEMPLATE_NAME: 'RACE Template',
    EXISTING_TEMPLATE_NAME: 'Existing Template',
    EXISTING_TEMPLATE_DESCRIPTION: 'Test description',
    TEMPLATE_ID: 'template1',
    MOCK_TEMPLATE_ID: 'template-id-123',
    
    // RACE Field Values
    ROLE_VALUE: 'Act as Developer, Software Developer',
    ACTION_VALUE: 'Write clean code',
    CONTEXT_VALUE: 'For a new project',
    EXECUTE_VALUE: 'Follow best practices',
    
    // Existing Template RACE Values
    EXISTING_ROLE: 'Act as a Developer',
    EXISTING_ACTION: 'Write code',
    EXISTING_CONTEXT: 'In a React project',
    EXISTING_EXECUTE: 'Using TypeScript',
    
    // Updated RACE Values
    UPDATED_ACTION: 'Write clean, efficient code',
    UPDATED_CONTEXT: 'In a large-scale React application',
  },

  // Role Test Data
  RACE_ROLES: {
    ROLE_1: {
      ID: 'role1',
      NAME: 'Developer',
      DESCRIPTION: 'Software Developer',
      EXPERTISE_LEVELS: ['Beginner', 'Intermediate', 'Expert'],
    },
    ROLE_2: {
      ID: 'role2',
      NAME: 'Designer',
      DESCRIPTION: 'UX Designer',
      EXPERTISE_LEVELS: ['Beginner', 'Intermediate', 'Expert'],
    },
  },

  // Expertise Levels
  EXPERTISE_LEVELS: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    EXPERT: 'Expert',
  },

  // Modal Modes
  MODAL_MODES: {
    CREATE_TEMPLATE: 'createTemplate',
    UPDATE_TEMPLATE: 'updateTemplate',
  },

  // Button Text
  BUTTON_TEXT: {
    CREATE_TEMPLATE: 'Create Template',
    UPDATE_TEMPLATE: 'Update Template',
  },

  // Dates
  DATES: {
    CREATED_AT: '2023-01-01',
    UPDATED_AT: '2023-01-01',
  },

  // User Test Data
  USER: {
    USERNAME: 'testuser',
    ROLE: 'standard' as const,
    IS_AUTHENTICATED: true,
    DISPLAY_NAME: 'Test User',
    EMAIL: 'test@example.com',
  },

  // Auth Test Data
  AUTH: {
    TOKEN: 'test-token-123',
    REFRESH_TOKEN: 'refresh-token-456',
    EXPIRES_IN: 3600,
  },

  // Login Test Data
  LOGIN: {
    // User Credentials
    USERNAME: 'testuser',
    PASSWORD: process.env.TEST_PASSWORD || '', // Use environment variable for test password
    
    // UI Text
    TITLE: 'Login to Prompt',
    USERNAME_LABEL: 'username',
    SECRET_LABEL: 'password', // UI label only - not a real password
    LOGIN_BUTTON: 'login',
    LOGGING_IN_TEXT: 'logging in',
    
    // Error Messages
    ERROR_EMPTY_FORM: 'Please enter both username and password',
    ERROR_INVALID_CREDENTIALS: 'Invalid credentials',
    ERROR_LOGIN_FAILED: 'Login failed. Please try again.',
    
    // Auth Response
    SUCCESS_RESPONSE: {
      success: true,
      user: {
        username: 'testuser',
        role: 'standard',
      },
      token: 'test-token-123',
    },
    FAILURE_RESPONSE: {
      success: false,
    },
    
    // Network Error
    NETWORK_ERROR: 'Network error',
  },

  // Config Test Data
  CONFIG: {
    // Default Values
    DEFAULT_OPENAI_MODEL: 'gpt-4o',
    DEFAULT_API: 'mistral',
    DEFAULT_AZURE_DEPLOYMENT_ID: 'gpt-4o',
    DEFAULT_BING_SEARCH_LOCATION: 'global',
    DEFAULT_OPENAI_BASE_URL: 'https://api.openai.com/v1',
    
    // Test Values
    TEST_OPENAI_MODEL: 'window-model',
    TEST_DEFAULT_API: 'window-api',
    TEST_VITE_MODEL: 'vite-model',
    TEST_VITE_API: 'vite-api',
    TEST_MODEL_WITH_SPACES: 'model-with-spaces',
    TEST_API_WITH_SPACES: 'api-with-spaces',
    
    // Endpoint URLs
    ENDPOINTS: {
      AZURE_ENDPOINT: 'https://my-azure-endpoint.com',
      AZURE_ENDPOINT_WITH_SLASH: 'https://my-azure-endpoint.com/',
      AZURE_ENDPOINT_DOUBLE_SLASH: 'https://my-azure-endpoint.com//',
      HTTP_ENDPOINT: 'https://endpoint.com', // Changed from http to https for security
      HTTPS_ENDPOINT: 'https://endpoint.com',
      PLAIN_ENDPOINT: 'endpoint',
      PLAIN_ENDPOINT_DOMAIN: 'endpoint.com',
    },
    
    // Environment Variable Keys
    ENV_KEYS: {
      OPENAI_MODEL: 'VITE_OPENAI_MODEL',
      DEFAULT_API: 'VITE_DEFAULT_API',
      AZURE_DEPLOYMENT_ID: 'VITE_AZURE_OPENAI_DEPLOYMENT_ID',
      BING_SEARCH_LOCATION: 'VITE_BING_SEARCH_LOCATION',
      OPENAI_BASE_URL: 'VITE_OPENAI_BASE_URL',
      AZURE_ENDPOINT: 'VITE_AZURE_OPENAI_ENDPOINT',
    },
  },

  // Template List Test Data
  TEMPLATE_LIST: {
    // Search and Filter
    SEARCH_PLACEHOLDER: 'Search templates...',
    FILTER_BUTTON_TITLE: 'Filter by role',
    ALL_ROLES_OPTION: 'All Roles',
    
    // Test Search Terms
    SEARCH_TERMS: {
      FRONTEND: 'frontend',
      BACKEND: 'backend',
      TEMPLATE: 'template',
    },
    
    // External URL
    EXTERNAL_URL: 'https://example.com',
    
    // Button Text
    SELECT_TEMPLATE_BUTTON: 'Select template',
  },
} as const; 