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

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

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

## Pipeline Setup via GitHub Actions

### Overview
The project uses GitHub Actions for CI/CD automation, integrating SonarCloud analysis and deploying to Azure Blob Storage.

### Pipeline Configuration
Create a `.github/workflows/main.yml` file with the following configuration:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
      - dev
      - 'feature/*'
  pull_request:
    branches: 
      - main
      - dev

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18.x'

    - name: Install Dependencies & Build
      run: |
        npm install
        npm run build

    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      with:
        args: >
          -Dsonar.projectKey=qea_prompt-laibrary-v2
          -Dsonar.organization=qea
          -Dsonar.sources=.

    - name: Upload to Azure Blob Storage
      uses: azure/cli@v1
      env:
        AZURE_STORAGE_ACCOUNT: sareportingpoc
        AZURE_STORAGE_KEY: ${{ secrets.AZURE_STORAGE_KEY }}
      run: |
        for file in dist/*; do
          az storage blob upload \
            --account-name $AZURE_STORAGE_ACCOUNT \
            --container-name cpintegration \
            --file "$file" \
            --name "PromptLaibrary2/$(basename "$file")" \
            --auth-mode key \
            --account-key $AZURE_STORAGE_KEY \
            --overwrite
        done


### Required Secrets
    Add the following secrets in your GitHub repository settings:

## SONAR_TOKEN: 
    Your SonarCloud authentication token
## AZURE_STORAGE_KEY: 
    Your Azure Storage account key

## Pipeline Features
  1.Triggers on pushes to main, dev, and feature branches
  2.Node.js 18.x environment setup
  3.NPM package installation and build
  4.SonarCloud static code analysis
  5.Azure Blob Storage deployment
  6.Automatic artifact publishing
## Setup Instructions
  1.Configure GitHub repository secrets
  2.Enable GitHub Actions in your repository
  3.Push the workflow file to .github/workflows/main.yml
  4.Verify the workflow runs on push/pull request