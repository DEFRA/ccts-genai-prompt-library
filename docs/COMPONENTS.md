# Prompt Library Components Documentation

## Core Components

### 1. Template List
The main interface for viewing and managing templates:
- Role-based filtering
- Search functionality
- Grid layout display
- Responsive design

```typescript
interface TemplateListProps {
  userId?: string;
}
```

### 2. Template Card
Displays templates with:
- Role and expertise tags
- Description preview
- Action buttons for edit/delete
- Hover effects and transitions

```typescript
interface TemplateCardProps {
  template: Template;
  isUserTemplate: boolean;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}
```

### 3. Sidebar
Collapsible navigation component with:
- Minimal width when collapsed (w-8)
- Role-based navigation items
- Theme toggle support
- User authentication status

```typescript
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}
```

### 4. Manage Modal
Modal for managing templates and roles:
- Template CRUD operations
- Role management
- Import/Export functionality
- Filter and search capabilities

```typescript
interface ManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

## Service Components

### 1. Template Store
Manages template state and operations:
- Template CRUD operations
- State persistence
- Default templates handling
- User templates management

```typescript
interface TemplateStore {
  templates: Template[];
  userTemplates: Template[];
  addTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateById: (id: string) => Template | undefined;
}
```

### 2. Role Store
Manages role-related functionality:
- Role CRUD operations
- Default roles handling
- User roles management
- Role state persistence

```typescript
interface RoleStore {
  roles: Role[];
  userRoles: Role[];
  defaultRoles: Role[];
  addRole: (role: Role) => Promise<Role>;
  updateRole: (role: Role) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  getAllRoles: () => Role[];
}
```

## API Integration Components

### API Selector
```typescript
interface APISelector {
  submitToLLM: (prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }) => Promise<string>;
  
  tryDifferentModels: (
    endpoint: string,
    headers: Record<string, string>,
    messages: any[],
    models: string[],
    options?: any
  ) => Promise<any>;
}
```

### Configuration Manager
```typescript
interface ConfigManager {
  cleanValue: (value: string) => string;
  formatEndpoint: (endpoint: string) => string;
  parseModels: (modelsStr: string) => string[];
  validateConfig: () => boolean;
}
```

### Error Handler Component
```typescript
interface ErrorHandlerProps {
  error: Error;
  resetError: () => void;
  showNotification?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  resetError,
  showNotification = true
}) => {
  useEffect(() => {
    if (showNotification) {
      toast.error(error.message);
    }
  }, [error, showNotification]);

  return (
    <div className="error-container">
      <h3>Error Occurred</h3>
      <p>{error.message}</p>
      <button onClick={resetError}>Try Again</button>
    </div>
  );
};
```

## Enhanced Modal Components

### CreateTemplateModal
```typescript
interface CreateTemplateModalProps {
  initialData?: Partial<Template>;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  initialData
}) => {
  // Form state management
  const { formData, setFormData } = useFormState();
  const { newSection, setNewSection } = useFormState();
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [shakingSections, setShakingSections] = useState<Set<string>>(new Set());
  
  // Custom hooks
  const { validateSections } = useCustomSectionValidation();
  const { isValid, setIsValid } = useFormValidation();
  
  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = await validateSections(
        selectedTemplateForPrompt?.customSections || [],
        customSections,
        selectedMultiSections
      );

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setShakingSections(new Set(Object.keys(validation.errors)));
        setTimeout(() => {
          setValidationErrors({});
          setShakingSections(new Set());
        }, 5000);
        return;
      }

      handlePreview();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };
  
  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={handleClose}
      size="full"
      className="w-full h-full max-w-none max-h-none overflow-visible font-vscode"
      title={modalMode === 'updateTemplate' ? 'Edit Template' : 'Create Template'}
    >
      {/* Modal content */}
    </Modal>
  );
};
```

### EnhancePromptModal
```typescript
interface EnhancePromptModalProps {
  prompt: string;
  onEnhance: (enhancedPrompt: string) => void;
}

const EnhancePromptModal: React.FC<EnhancePromptModalProps> = ({
  prompt,
  onEnhance
}) => {
  // API integration
  const enhancePrompt = async () => {
    try {
      const enhancedPrompt = await submitToLLM(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      });
      
      onEnhance(enhancedPrompt);
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <Modal>
      {/* Modal content */}
    </Modal>
  );
};
```

## Utility Components

### ValidationManager
```typescript
interface ValidationManagerProps {
  sections: CustomSection[];
  values: Record<string, string>;
  multiSelections: Record<string, string[]>;
  onValidation: (result: ValidationResult) => void;
}

const ValidationManager: React.FC<ValidationManagerProps> = ({
  sections,
  values,
  multiSelections,
  onValidation
}) => {
  const validateAll = async () => {
    const result = await validateSections(sections, values, multiSelections);
    onValidation(result);
  };
  
  return null; // Utility component, no UI
};
```

### ConfigurationProvider
```typescript
interface ConfigurationProviderProps {
  children: React.ReactNode;
}

const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({
  children
}) => {
  const [config, setConfig] = useState(loadConfiguration());
  
  useEffect(() => {
    // Validate configuration on mount
    const isValid = validateConfig();
    if (!isValid) {
      console.error('Invalid configuration detected');
    }
  }, []);
  
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};
```

## Implementation Notes

### State Management
1. Template Management:
   - Local storage persistence
   - Default templates handling
   - User templates separation
   - State synchronization

2. Role Management:
   - Default roles handling
   - User roles persistence
   - Role-template relationships
   - State updates

### Performance Considerations
1. Component Optimization:
   - Lazy loading
   - Memoization
   - Virtual scrolling
   - Code splitting

2. State Updates:
   - Batch updates
   - Optimistic updates
   - State normalization
   - Change detection

### Security Measures
1. Data Validation:
   - Input sanitization
   - Type checking
   - Schema validation
   - XSS prevention

2. Authentication:
   - Role-based access
   - Session management
   - Secure storage
   - Token handling