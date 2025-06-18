# Technical Documentation

## Architecture Overview

The Prompt Laibrary is a modern web application built with React and TypeScript, designed for managing and organizing prompts with role-based access control.

### Core Technologies
- React 18 with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Vite as build tool

### Key Features
- Prompt management
- Role-based access control (Admin and Standard User roles)
- Import/export functionality
- Search and filtering
- AI-powered prompt enhancement (Admin only)

## User Roles and Permissions

### Admin Users
- Full access to all features
- Can create, edit, and delete prompts
- Can manage roles and templates
- Access to AI-powered prompt enhancement
- Can delete default roles and templates
- Full system configuration access

### Standard Users
- Limited access to features
- Can create and edit own prompts
- Can view and use existing templates
- Can access the management interface
- Cannot use AI-powered prompt enhancement
- Cannot delete default roles

## Component Architecture

### Authentication
```typescript
interface User {
  username: string;
  isAuthenticated: boolean;
  role: 'admin' | 'standard';
}

interface AuthResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
}
```

### Template Management
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  roleId: string;
  expertise: string[];
  content: string;
  isDefault: boolean;
}

interface TemplateStore {
  templates: Template[];
  userTemplates: Template[];
  defaultTemplates: Template[];
  addTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
}
```

### Role Management
```typescript
interface Role {
  id: string;
  name: string;
  expertise: string[];
  isDefault: boolean;
}

interface RoleStore {
  roles: Role[];
  userRoles: Role[];
  defaultRoles: Role[];
  addRole: (role: Role) => Promise<Role>;
  updateRole: (role: Role) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
}
```

## Access Control Implementation

### Feature Access Control
```typescript
// Example of feature-based access control
const FeatureComponent = () => {
  const { isAdmin } = useStore();
  
  return (
    <div>
      {/* Basic features available to all users */}
      <BasicFeatures />
      
      {/* Admin-only features */}
      {isAdmin && (
        <>
          <EnhancePromptButton />
          <AdminControls />
        </>
      )}
    </div>
  );
};
```

### Permission Checking
```typescript
// Example of permission checking in components
const ManageComponent = () => {
  const { isAdmin } = useStore();
  
  const handleDelete = (item: any) => {
    if (!isAdmin && item.isDefault) {
      toast.error('Only administrators can delete default items');
      return;
    }
    // Proceed with deletion
  };
};
```

## State Management

### Store Configuration
```typescript
interface Store {
  // User state
  currentUser: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  
  // Auth actions
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  
  // Feature flags
  isEnhanceModalOpen: boolean;
  isManageModalOpen: boolean;
  
  // Modal controls
  toggleEnhanceModal: () => void;
  toggleManageModal: () => void;
}
```

## Security Considerations

### Authentication Flow
- Environment-based credential management
- Secure token storage
- Role-based session management
- Automatic session timeout

### Access Control
- Feature-level access restrictions
- UI element visibility control
- API endpoint protection
- Data access filtering

### Best Practices
- Regular security audits
- Input validation
- Error handling
- Secure data storage

## Component Architecture

### Template Management
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  roleId: string;
  expertise: string[];
  content: string;
  isDefault: boolean;
}

interface TemplateStore {
  templates: Template[];
  userTemplates: Template[];
  defaultTemplates: Template[];
  addTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
}
```

### Role Management
```typescript
interface Role {
  id: string;
  name: string;
  expertise: string[];
  isDefault: boolean;
}

interface RoleStore {
  roles: Role[];
  userRoles: Role[];
  defaultRoles: Role[];
  addRole: (role: Role) => Promise<Role>;
  updateRole: (role: Role) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
}
```

### Component Structure
```typescript
// Template List Component
interface TemplateListProps {
  userId?: string;
}

// Template Card Component
interface TemplateCardProps {
  template: Template;
  isUserTemplate: boolean;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
}

// Manage Modal Component
interface ManageModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

## State Management

### Store Configuration
```typescript
const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Store implementation
    }),
    {
      name: 'template-library-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
```

### Data Flow
1. User Action
2. Store Update
3. Local Storage Persistence
4. UI Update
5. Error Handling

## Performance Optimization

### Component Level
- Memoization with React.memo
- Virtual scrolling for long lists
- Code splitting with React.lazy
- Optimized re-renders
- Efficient event handlers

### State Level
- Normalized state structure
- Batch updates
- Optimistic updates
- Efficient queries
- Local storage caching

## Security Measures

### Data Protection
```typescript
const validateInput = (input: string): boolean => {
  // Input validation logic
  return true;
};

const sanitizeContent = (content: string): string => {
  // Content sanitization logic
  return content;
};
```

### Access Control
```typescript
const checkPermission = (userId: string, action: string): boolean => {
  // Permission check logic
  return true;
};

const ProtectedRoute: React.FC = ({ children }) => {
  // Route protection logic
  return <>{children}</>;
};
```

## Error Handling

### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Toast Notifications
```typescript
const showError = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    duration: 3000
  });
};

const showSuccess = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    duration: 2000
  });
};
```

## Testing Strategy

### Unit Tests
```typescript
describe('Template Store', () => {
  it('should add template', async () => {
    const store = useTemplateStore.getState();
    const template = {
      id: '1',
      name: 'Test',
      description: 'Test template',
      roleId: '1',
      expertise: ['test'],
      content: 'Test content',
      isDefault: false
    };
    
    await store.addTemplate(template);
    expect(store.templates).toContainEqual(template);
  });
});
```

### Integration Tests
```typescript
describe('Template List', () => {
  it('should render templates', () => {
    const templates = [/* test data */];
    const roles = [/* test data */];
    
    render(
      <TemplateList
        templates={templates}
        roles={roles}
      />
    );
    
    expect(screen.getAllByTestId('template-card')).toHaveLength(templates.length);
  });
});
```

## Build and Deployment

### Build Process
1. Run linting and type checking
2. Execute test suite
3. Build production bundle
4. Optimize assets
5. Deploy to hosting

### Environment Configuration
```env
VITE_APP_TITLE=Template Library
VITE_STORAGE_PREFIX=template_library
VITE_DEFAULT_THEME=light
```

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor performance
- Review error logs
- Update documentation
- Perform security audits

### Troubleshooting
1. Check console errors
2. Verify state updates
3. Test in different browsers
4. Check network requests
5. Review local storage

## Future Enhancements

### Planned Features
1. Advanced filtering
2. Bulk operations
3. Template versioning
4. Role hierarchies

### Technical Improvements
1. Performance monitoring
2. Enhanced error handling
3. Improved accessibility
4. Better state persistence

## API Configuration

### Azure OpenAI Integration
```typescript
interface AzureConfig {
  endpoint: string;
  apiKey: string;
  deploymentId: string;
  models: string[];  // Fallback model options
}

interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  models: string[];  // Fallback model options
}

// Configuration validation
const azureConfigSchema = z.object({
  endpoint: z.string().min(1).transform(endpoint => formatAzureEndpoint(endpoint)),
  apiKey: z.string().min(1),
  deploymentId: z.string().default('gpt-4'),
  models: z.array(z.string()).default(['gpt-4o-mini', 'gpt-4', 'gpt-4o'])
});
```

### Rate Limit Handling
```typescript
// Rate limit handling with exponential backoff
const tryDifferentModels = async (
  endpoint: string,
  headers: Record<string, string>,
  messages: any[],
  models: string[],
  options: any = {}
): Promise<any> => {
  for (const model of models) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages, model, ...options })
      });

      if (response.status === 429) {
        const retryDelay = extractRetryDelay(response);
        await delay(retryDelay);
        continue;
      }

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
    }
  }
  throw new Error('All models failed');
};
```

### Environment Configuration
```javascript
// Runtime configuration
window.__ENV__ = {
  VITE_AZURE_OPENAI_KEY: cleanValue('%%AZURE_OPENAI_KEY%%'),
  VITE_AZURE_OPENAI_ENDPOINT: formatEndpoint(cleanValue('%%AZURE_OPENAI_ENDPOINT%%')),
  VITE_AZURE_OPENAI_DEPLOYMENT_ID: cleanValue('%%AZURE_OPENAI_DEPLOYMENT_ID%%') || 'gpt-4',
  VITE_AZURE_OPENAI_MODELS: parseModels(cleanValue('%%AZURE_OPENAI_MODELS%%')),
  // ... other configurations
};
```

## Error Handling

### API Error Handling
```typescript
// Enhanced error handling for API calls
const handleAPIError = (error: any) => {
  if (error.message.includes('Rate limit exceeded')) {
    throw new Error('API rate limit exceeded. Please try again later.');
  }
  if (error.message.includes('content policy')) {
    throw new Error('Content policy violation. Please revise your input.');
  }
  throw error;
};
```

### Validation Error Handling
```typescript
// Custom section validation
const validateSections = async (
  sections: CustomSection[],
  values: Record<string, string>,
  multiSelections: Record<string, string[]>
) => {
  const errors: Record<string, string> = {};
  
  for (const section of sections) {
    if (section.required) {
      const value = section.type === 'multiselect' 
        ? multiSelections[section.id] 
        : values[section.id];
        
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors[section.id] = `${section.name} is required`;
      }
    }
    
    if (section.inputValidation && values[section.id]) {
      // Validation logic based on type
      if (!validateInput(values[section.id], section.inputValidation)) {
        errors[section.id] = section.inputValidation.errorMessage;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```