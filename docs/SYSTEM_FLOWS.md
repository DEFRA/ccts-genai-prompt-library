# System Flows

## User Authentication Flow

1. User enters credentials
2. System validates credentials against environment variables
3. System determines user role (Admin/Standard)
4. System generates appropriate token
5. User is redirected to main interface with role-specific access

## Access Control Flow

### Admin Users
1. Full access to all features
   - Create/Edit/Delete prompts
   - Manage roles and templates
   - Access AI enhancement features
   - Delete default items
   - System configuration

2. Feature Access
   - Enhance Prompt button visible
   - Submit button available in preview
   - Full management capabilities

### Standard Users
1. Limited feature access
   - Create/Edit own prompts
   - View and use templates
   - Access management interface
   - Cannot use AI enhancement
   - Cannot delete default items

2. Feature Restrictions
   - No Enhance Prompt button
   - No Submit button in preview
   - Limited management capabilities

## Template Management Flow

1. Template Creation
   - User creates new template
   - System assigns ownership
   - Template marked as user-created

2. Template Modification
   - Check user permissions
   - Allow/restrict based on template type (default/user-created)
   - Apply changes if permitted

3. Template Deletion
   - Verify user role
   - Check template type
   - Allow deletion based on rules:
     * Admin can delete any template
     * Standard users can only delete their own templates

## Role Management Flow

1. Role Creation
   - Available to all users
   - System tracks creator

2. Role Modification
   - Check user permissions
   - Allow/restrict based on role type

3. Role Deletion
   - Verify user role
   - Check if role is default
   - Allow deletion based on rules:
     * Admin can delete any role
     * Standard users cannot delete default roles

## Template Creation Flow

```mermaid
graph LR
    A[Start] --> B[Select Role]
    B --> C[Add Details]
    C --> D[Add Expertise]
    D --> E[Preview]
    E --> F[Save Template]
```

## State Management Flow

```mermaid
graph TD
    A[User Action] --> B[Zustand Store]
    B --> C[Component State]
    C --> D[UI Update]
    B --> E[Local Storage]
```

## Data Persistence Flow

```mermaid
graph TD
    A[Store Update] --> B[Persist Middleware]
    B --> C[Local Storage]
    C --> D[Load on Init]
    D --> E[Hydrate Store]
```

## Component Interaction Flow

```mermaid
graph TD
    A[Template List] --> B[Template Card]
    B --> C[Manage Modal]
    C --> D[Edit Form]
    D --> E[Store Update]
    E --> A
```

## Error Handling Flow

1. Permission Errors
   - Display appropriate error message
   - Log attempt
   - Maintain current state

2. Validation Errors
   - Show validation feedback
   - Preserve user input
   - Provide correction guidance

3. System Errors
   - Log error details
   - Show user-friendly message
   - Maintain data integrity

## Import/Export Flow

```mermaid
graph TD
    A[User Action] --> B{Import/Export?}
    B -->|Import| C[Parse Data]
    B -->|Export| D[Format Data]
    C --> E[Validate]
    E --> F[Save to Store]
    D --> G[Download File]
```

## API Integration Flow

```mermaid
graph TD
    A[User Action] --> B[API Selector]
    B --> C{API Type}
    C -->|Azure| D[Azure OpenAI]
    C -->|OpenAI| E[OpenAI API]
    D --> F[Model Selection]
    E --> F
    F --> G{Rate Limited?}
    G -->|Yes| H[Exponential Backoff]
    H --> F
    G -->|No| I[Process Response]
    I --> J[Update UI]
```

## Rate Limit Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Rate Limited?}
    B -->|Yes| C[Calculate Delay]
    C --> D[Wait]
    D --> E[Try Next Model]
    E --> F{Success?}
    F -->|Yes| G[Return Response]
    F -->|No| H{More Models?}
    H -->|Yes| E
    H -->|No| I[Throw Error]
    B -->|No| J[Process Request]
```

## Configuration Management Flow

```mermaid
graph TD
    A[App Start] --> B[Load Config]
    B --> C[Clean Values]
    C --> D[Format Endpoints]
    D --> E[Parse Models]
    E --> F{Valid Config?}
    F -->|Yes| G[Initialize App]
    F -->|No| H[Show Error]
    H --> I[Load Defaults]
```

## Error Recovery Flow

```mermaid
graph TD
    A[Error Detected] --> B{Error Type}
    B -->|Rate Limit| C[Handle Rate Limit]
    B -->|Validation| D[Show Validation Error]
    B -->|API| E[Handle API Error]
    B -->|Config| F[Load Defaults]
    C --> G[Retry with Backoff]
    D --> H[Update UI]
    E --> I[Show Error Message]
    F --> J[Restart App]
```

## Template Enhancement Flow

```mermaid
graph TD
    A[Select Template] --> B[Open Enhance Modal]
    B --> C[Submit to LLM]
    C --> D{API Available?}
    D -->|Yes| E[Process Template]
    D -->|No| F[Show Error]
    E --> G[Update Template]
    F --> H[Use Original]
```

## Validation Flow

```mermaid
graph TD
    A[Input Change] --> B[Validate Input]
    B --> C{Valid?}
    C -->|Yes| D[Clear Errors]
    C -->|No| E[Show Errors]
    E --> F[Shake Invalid Fields]
    F --> G[Auto-clear After 5s]
    D --> H[Enable Submit]
```
