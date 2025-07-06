# Implementation Guidelines

## User Roles and Access Control

### Role Types
1. Admin Users
   - Full system access
   - Access to AI enhancement features
   - Can manage all templates and roles
   - Can delete default items

2. Standard Users
   - Basic system access
   - Cannot access AI enhancement
   - Can manage own content
   - Cannot delete default items

### Implementation Best Practices

#### Access Control
```typescript
// Use role-based conditionals for feature access
const FeatureComponent: React.FC = () => {
  const { isAdmin } = useStore();
  
  return (
    <div>
      <CommonFeatures />
      {isAdmin && <AdminOnlyFeatures />}
    </div>
  );
};

// Implement permission checks in handlers
const handleDelete = (item: any) => {
  if (!isAdmin && item.isDefault) {
    toast.error('Only administrators can delete default items');
    return;
  }
  // Proceed with deletion
};
```

## Code Quality Standards

### TypeScript Best Practices
- Use strict type checking
- Avoid `any` type
- Define interfaces for all data structures
- Use type guards when necessary
- Implement proper error handling

### React Component Guidelines
- Use functional components
- Implement proper prop types
- Use hooks effectively
- Memoize when necessary
- Follow component composition patterns

### State Management
- Use Zustand for global state
- Keep state normalized
- Implement proper actions
- Handle side effects
- Maintain persistence

## Component Structure

### Template Components
```typescript
// Template List Component
const TemplateList: React.FC<TemplateListProps> = ({ userId }) => {
  const templates = useTemplateStore(state => state.templates);
  const roles = useRoleStore(state => state.roles);
  
  return (
    <div>
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          template={template}
          role={roles.find(r => r.id === template.roleId)}
        />
      ))}
    </div>
  );
};

// Template Card Component
const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  role,
  onEdit,
  onDelete
}) => {
  const { isAdmin } = useStore();
  
  return (
    <div className="card">
      <h3>{template.name}</h3>
      <p>{template.description}</p>
      <div className="tags">
        <RoleTag role={role} />
        <ExpertiseTags expertise={template.expertise} />
      </div>
      <div className="actions">
        <EditButton onClick={() => onEdit(template)} />
        {(isAdmin || !template.isDefault) && (
          <DeleteButton onClick={() => onDelete(template)} />
        )}
      </div>
    </div>
  );
};
```

### Role Components
```typescript
// Role List Component
const RoleList: React.FC = () => {
  const roles = useRoleStore(state => state.roles);
  const { isAdmin } = useStore();
  
  return (
    <div>
      {roles.map(role => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={handleEdit}
          onDelete={isAdmin ? handleDelete : undefined}
        />
      ))}
    </div>
  );
};

// Role Card Component
const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onDelete
}) => {
  const { isAdmin } = useStore();
  
  return (
    <div className="card">
      <h3>{role.name}</h3>
      <div className="expertise">
        {role.expertise.map(exp => (
          <ExpertiseTag key={exp} expertise={exp} />
        ))}
      </div>
      <div className="actions">
        <EditButton onClick={() => onEdit(role)} />
        {(isAdmin || !role.isDefault) && onDelete && (
          <DeleteButton onClick={() => onDelete(role)} />
        )}
      </div>
    </div>
  );
};
```

## Store Implementation

### Template Store
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

const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      userTemplates: [],
      defaultTemplates: [],
      
      addTemplate: async (template) => {
        set(state => ({
          templates: [...state.templates, template],
          userTemplates: [...state.userTemplates, template]
        }));
        return template;
      },
      
      updateTemplate: async (template) => {
        set(state => ({
          templates: state.templates.map(t =>
            t.id === template.id ? template : t
          ),
          userTemplates: state.userTemplates.map(t =>
            t.id === template.id ? template : t
          ),
          defaultTemplates: state.defaultTemplates.map(t =>
            t.id === template.id ? template : t
          )
        }));
        return template;
      },
      
      deleteTemplate: async (id) => {
        set(state => ({
          templates: state.templates.filter(t => t.id !== id),
          userTemplates: state.userTemplates.filter(t => t.id !== id),
          defaultTemplates: state.defaultTemplates.filter(t => t.id !== id)
        }));
      }
    }),
    {
      name: 'template-store'
    }
  )
);
```

### Role Store
```typescript
interface Role {
  id: string;
  name: string;
  expertise: string[];
  isDefault: boolean;
}

const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      roles: [],
      userRoles: [],
      defaultRoles: [],
      
      addRole: async (role) => {
        set(state => ({
          roles: [...state.roles, role],
          userRoles: [...state.userRoles, role]
        }));
        return role;
      },
      
      updateRole: async (role) => {
        set(state => ({
          roles: state.roles.map(r =>
            r.id === role.id ? role : r
          ),
          userRoles: state.userRoles.map(r =>
            r.id === role.id ? role : r
          ),
          defaultRoles: state.defaultRoles.map(r =>
            r.id === role.id ? role : r
          )
        }));
        return role;
      },
      
      deleteRole: async (id) => {
        set(state => ({
          roles: state.roles.filter(r => r.id !== id),
          userRoles: state.userRoles.filter(r => r.id !== id),
          defaultRoles: state.defaultRoles.filter(r => r.id !== id)
        }));
      }
    }),
    {
      name: 'role-store'
    }
  )
);
```

## Error Handling

### Input Validation
```typescript
const validateTemplate = (template: Template): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!template.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  }
  
  if (!template.roleId) {
    errors.push({ field: 'roleId', message: 'Role is required' });
  }
  
  if (!template.content) {
    errors.push({ field: 'content', message: 'Content is required' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

## API Integration Guidelines

### Azure OpenAI Configuration
```typescript
// Configure Azure OpenAI API with fallback options
const configureAzureAPI = () => {
  const endpoint = formatAzureEndpoint(config.AZURE_OPENAI_ENDPOINT);
  const models = ['gpt-4o-mini', 'gpt-4', 'gpt-4o'];
  
  return {
    endpoint,
    apiKey: config.AZURE_OPENAI_KEY,
    deploymentId: config.AZURE_OPENAI_DEPLOYMENT_ID || 'gpt-4',
    models,
    apiVersion: '2023-12-01-preview'
  };
};

// Format Azure endpoint
const formatAzureEndpoint = (endpoint: string): string => {
  if (!endpoint) return '';
  endpoint = endpoint.replace(/[/]+$/, '');
  if (!endpoint.startsWith('http')) {
    endpoint = `https://${endpoint}`;
  }
  return endpoint;
};
```

### Rate Limit Handling
```typescript
// Implement exponential backoff for rate limits
const handleRateLimit = async (error: any, retryCount: number = 0): Promise<void> => {
  if (error.status === 429) {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 32000);
    console.log(`Rate limited. Retrying in ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return;
  }
  throw error;
};

// Model fallback strategy
const tryDifferentModels = async (models: string[], operation: (model: string) => Promise<any>) => {
  for (const model of models) {
    try {
      return await operation(model);
    } catch (error) {
      if (error.status === 429) {
        await handleRateLimit(error);
        continue;
      }
      console.error(`Failed with model ${model}:`, error);
    }
  }
  throw new Error('All models failed');
};
```

### Error Handling Best Practices
```typescript
// Implement comprehensive error handling
const handleAPIError = (error: any) => {
  // Rate limit handling
  if (error.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Content policy violations
  if (error.message.includes('content policy')) {
    throw new Error('Content policy violation. Please revise your input.');
  }

  // Authentication errors
  if (error.status === 401) {
    throw new Error('Authentication failed. Please check your API credentials.');
  }

  // Invalid requests
  if (error.status === 400) {
    throw new Error('Invalid request. Please check your input.');
  }

  // Generic error
  throw new Error('An unexpected error occurred. Please try again.');
};

// Validation error handling
const handleValidationError = (error: ValidationError) => {
  if (error.type === 'required') {
    return `${error.field} is required`;
  }
  if (error.type === 'pattern') {
    return `${error.field} format is invalid`;
  }
  return error.message || 'Validation failed';
};
```

### Environment Configuration
```typescript
// Configure runtime environment
const configureEnvironment = () => {
  const cleanValue = (value: string) => {
    if (!value || value.startsWith('%%') && value.endsWith('%%')) {
      return '';
    }
    return value.trim();
  };

  return {
    azureOpenAI: {
      endpoint: formatEndpoint(cleanValue(process.env.AZURE_OPENAI_ENDPOINT)),
      apiKey: cleanValue(process.env.AZURE_OPENAI_KEY),
      deploymentId: cleanValue(process.env.AZURE_OPENAI_DEPLOYMENT_ID) || 'gpt-4',
      models: parseModels(cleanValue(process.env.AZURE_OPENAI_MODELS))
    },
    openAI: {
      apiKey: cleanValue(process.env.OPENAI_API_KEY),
      baseUrl: cleanValue(process.env.OPENAI_BASE_URL) || 'https://api.openai.com/v1',
      models: parseModels(cleanValue(process.env.OPENAI_MODELS))
    }
  };
};

// Parse models configuration
const parseModels = (modelsStr: string) => {
  if (!modelsStr) return ['gpt-4o-mini', 'gpt-4', 'gpt-4o'];
  return modelsStr.split(',').map(m => m.trim());
};
```