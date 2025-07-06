# Knowledge Transfer Document

## Application Overview

The Template Library is a modern web application built with React and TypeScript for managing and organizing templates. It features role-based access control and a robust state management system.

## Core Components

### Template Management
- Template creation and editing
- Role-based organization
- Import/export functionality
- Search and filtering capabilities

### Role Management
- Default and custom roles
- Role-based access control
- Expertise management
- Role filtering

### State Management
- Zustand store implementation
- Local storage persistence
- Optimistic updates
- State normalization

## Technical Stack

### Frontend Technologies
- React 18 with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Vite as build tool

### Development Tools
- ESLint for code quality
- Prettier for code formatting
- Jest for testing
- React Testing Library

## Key Features Implementation

### Template Store
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  role: string;
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

### Role Store
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

## Component Architecture

### Template List
- Displays all templates
- Implements filtering and search
- Handles template actions
- Manages template state

### Template Card
- Shows template details
- Provides edit/delete actions
- Displays role and expertise
- Handles user interactions

### Manage Modal
- Template management interface
- Role management interface
- Import/export functionality
- Settings configuration

## State Management Flow

1. User Action
2. Store Update
3. Local Storage Persistence
4. UI Update
5. Error Handling

## Error Handling

### Types of Errors
1. Validation Errors
2. State Update Errors
3. Storage Errors
4. Network Errors

### Error Handling Strategy
1. Input Validation
2. Error Boundaries
3. Toast Notifications
4. Fallback UI

## Testing Strategy

### Unit Tests
- Component testing
- Store testing
- Utility function testing
- Error handling testing

### Integration Tests
- Component interaction
- State management
- User flows
- Error scenarios

## Performance Considerations

### Component Optimization
- Memoization
- Code splitting
- Lazy loading
- Virtual scrolling

### State Optimization
- Normalized state
- Batch updates
- Optimistic updates
- Efficient queries

## Security Measures

### Data Protection
- Input validation
- XSS prevention
- CSRF protection
- Secure storage

### Access Control
- Role-based access
- User authentication
- Session management
- Permission checks

## Deployment Process

### Build Process
1. Code linting
2. Type checking
3. Testing
4. Building
5. Deployment

### Environment Setup
1. Development
2. Testing
3. Staging
4. Production

## Maintenance Guidelines

### Code Quality
- Follow style guide
- Write tests
- Document changes
- Review code

### Performance Monitoring
- Load times
- State updates
- Error rates
- User interactions

## Future Development

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

## Support Resources

### Documentation
1. Technical documentation
2. User guides
3. API documentation
4. Component library

### Community
1. GitHub repository
2. Issue tracking
3. Discussion forums
4. Support channels

## API Integration

### Azure OpenAI Integration
```typescript
// API Configuration
interface AzureConfig {
  endpoint: string;
  apiKey: string;
  deploymentId: string;
  models: string[];
}

// Configuration Validation
const azureConfigSchema = z.object({
  endpoint: z.string().min(1).transform(formatAzureEndpoint),
  apiKey: z.string().min(1),
  deploymentId: z.string().default('gpt-4'),
  models: z.array(z.string()).default(['gpt-4o-mini', 'gpt-4', 'gpt-4o'])
});

// API Integration
const submitToLLM = async (prompt: string, options = {}) => {
  if (isAzureOpenAIConfigured()) {
    try {
      const response = await tryDifferentModels(
        endpoint,
        headers,
        messages,
        apiConfig.azure.models,
        options
      );
      return response.choices[0].message.content;
    } catch (error) {
      handleAPIError(error);
    }
  }
  throw new Error('No API configured');
};
```

### Rate Limit Handling
```typescript
// Rate limit handling with exponential backoff
const handleRateLimit = async (error: any, retryCount = 0) => {
  if (error.status === 429) {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 32000);
    await new Promise(resolve => setTimeout(resolve, delay));
    return true;
  }
  return false;
};

// Model fallback strategy
const tryDifferentModels = async (
  endpoint: string,
  headers: Record<string, string>,
  messages: any[],
  models: string[],
  options: any = {}
) => {
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

### Configuration Management
```typescript
// Runtime configuration
const configureEnvironment = () => {
  const cleanValue = (value: string) => {
    if (!value || (value.startsWith('%%') && value.endsWith('%%'))) {
      return '';
    }
    return value.trim();
  };

  const formatEndpoint = (endpoint: string) => {
    if (!endpoint) return '';
    endpoint = endpoint.replace(/[/]+$/, '');
    if (!endpoint.startsWith('http')) {
      endpoint = `https://${endpoint}`;
    }
    return endpoint;
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
```

### Error Handling
```typescript
// API error handling
const handleAPIError = (error: any) => {
  if (error.status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  if (error.message.includes('content policy')) {
    throw new Error('Content policy violation. Please revise your input.');
  }
  if (error.status === 401) {
    throw new Error('Authentication failed. Please check your API credentials.');
  }
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

## Best Practices

### API Integration
1. Always implement rate limit handling
2. Use model fallback strategy
3. Implement proper error handling
4. Validate configuration before use
5. Use environment variables for sensitive data

### Error Handling
1. Implement comprehensive error handling
2. Use appropriate error messages
3. Log errors for debugging
4. Implement retry mechanisms
5. Show user-friendly error messages

### Configuration
1. Clean and validate environment variables
2. Format endpoints properly
3. Provide fallback values
4. Log configuration status
5. Handle missing configurations gracefully
