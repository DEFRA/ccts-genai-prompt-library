# System Specifications: Template Library Application

Create a modern web application for managing and creating templates using the following specifications:

## Core Technologies
- React + TypeScript
- Vite for build tooling
- Zustand for state management
- TailwindCSS for styling
- React Beautiful DND for drag-and-drop
- React-Toastify for notifications

## Project Structure
1. Create a new Vite project with React-TypeScript template
2. Implement the following directory structure:
```
/src
  /components
  /store
  /types
  /utils
  /data
  /services
  /hooks
```

## Key Features Implementation

### 1. State Management
Create Zustand stores for:
- Template management (`templateStore.ts`)
- Role management (`roleStore.ts`)
- User preferences (`useStore.ts`)

### 2. Core Components

#### Modal Components
```typescript
// CreateTemplateModal.tsx
- Implement multi-step template creation
- Role selection
- Template selection
- Custom section input
- Preview functionality

// SimpleTemplateModal.tsx
- Single-page template creation
- Custom section validation
```

#### Navigation Components
```typescript
// Sidebar.tsx
- Role-based navigation
- Template management
- User preferences
```

#### Content Components
```typescript
// PreviewPage.tsx
- Template preview
- Copy functionality
- Format handling
```

### 3. Data Models

#### Template Interface
```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  role: string;
  content: string;
  customSections?: CustomSection[];
  isVisible?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Custom Section Interface
```typescript
interface CustomSection {
  id: string;
  name: string;
  description?: string;
  type: 'textarea' | 'multiselect';
  isVisible: boolean;
  required?: boolean;
  inputValidation?: {
    type: 'regex';
    pattern?: string;
    errorMessage?: string;
  };
}
```

### 4. Core Functionality

#### Template Framework
- Role definition
- Content specification
- Context setting
- Validation details

#### Validation System
```typescript
// Implement validation for:
- Required fields
- Custom section inputs
- Template completeness
- Role selection
```

#### Template Management
```typescript
// Features:
- Create/Edit/Delete templates
- Import/Export functionality
- Template categorization
- Search and filtering
```

### 5. UI/UX Requirements

#### Styling
```css
/* Use TailwindCSS with:
- Dark/Light mode support
- Responsive design
- Custom animations
- Consistent color scheme
*/
```

#### User Experience
- Implement loading states
- Error handling
- Success notifications
- Intuitive navigation

### 6. Additional Features

#### Search Functionality
```typescript
// Implement:
- Full-text search
- Filter by role
- Sort by date/name
```

#### Export/Import
```typescript
// Support:
- JSON format
- Bulk operations
- Data validation
```

## Implementation Guidelines

1. **State Management**
   - Use Zustand with persistence
   - Implement proper type safety
   - Handle async operations

2. **Component Architecture**
   - Follow atomic design principles
   - Implement proper prop typing
   - Use custom hooks for logic separation

3. **Error Handling**
   - Implement try-catch blocks
   - Show user-friendly error messages
   - Log errors appropriately

4. **Performance Optimization**
   - Implement lazy loading
   - Use proper React hooks
   - Optimize re-renders

5. **Code Quality**
   - Follow TypeScript best practices
   - Implement proper commenting
   - Use consistent naming conventions

## Testing Requirements

1. **Unit Tests**
   - Test core functionality
   - Test state management
   - Test utility functions

2. **Integration Tests**
   - Test component interaction
   - Test data flow
   - Test user workflows

## Documentation Requirements

1. **Code Documentation**
   - JSDoc comments
   - Type definitions
   - Function documentation

2. **User Documentation**
   - Setup instructions
   - Usage guidelines
   - API documentation

## Deployment Guidelines

1. **Build Process**
   - Optimize for production
   - Handle environment variables
   - Implement proper bundling

2. **Environment Setup**
   - Development configuration
   - Production configuration
   - Testing environment
