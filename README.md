# Prompt Laibrary

A modern web application for managing and organizing prompt templates with role-based access control.

## Features

- Template Management
  - Create and edit templates
  - Role-based organization
  - Import/export functionality
  - Search and filtering

- Role Management
  - Default and custom roles
  - Role-based access control
  - Expertise management
  - Role filtering

- User Interface
  - Modern, responsive design
  - Dark/light theme support
  - Intuitive navigation
  - Accessible components

## Tech Stack

- React 18 with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Vite as build tool

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm 7 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prompt-laibrary.git
cd prompt-laibrary
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
prompt-laibrary/
├── src/
│   ├── components/     # React components
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── data/          # Default data
│   └── styles/        # Global styles
├── docs/              # Documentation
├── public/            # Static assets
└── tests/             # Test files
```

## Usage

### Creating Templates

1. Click "Create Template"
2. Select role and expertise
3. Fill in template details
4. Preview and save

### Managing Roles

1. Access Manage Modal
2. Create or edit roles
3. Set role expertise
4. Save changes

### Organizing Templates

1. View all templates
2. Filter by role
3. Search by name/description
4. Sort and organize

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code

### Environment Variables

```env
VITE_APP_TITLE=Prompt Laibrary
VITE_STORAGE_PREFIX=prompt_laibrary
VITE_DEFAULT_THEME=light
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Testing

This project uses Vitest for testing. For more details on testing strategy, see [TESTING.md](docs/TESTING.md).

### Run Tests

```bash
# Run all tests once
npm test

# Run tests and watch for changes
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI with SonarQube report conversion
npm run test:ci
```

### Test Report Conversion

For SonarQube integration, test reports are converted from Vitest's JUnit format to SonarQube's test execution report format. For details on this process, see [TEST_REPORT_CONVERSION.md](docs/TEST_REPORT_CONVERSION.md).

```bash
npm run test:integration
```

## Documentation

- [Technical Documentation](docs/TECHNICAL.md)
- [Implementation Guidelines](docs/IMPLEMENTATION_GUIDELINES.md)
- [Component Documentation](docs/COMPONENTS.md)
- [System Flows](docs/SYSTEM_FLOWS.md)

## Support

- GitHub Issues
- Documentation
- Community Forums

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
