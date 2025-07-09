# Prompt Laibrary

A modern web application for managing and organizing AI prompts with role-based access control.

## Features

- 🚀 Create and manage AI prompts
- 👥 Role-based access control (Admin and Standard users)
- 🎯 Template management system
- 🔍 Advanced search and filtering
- ✨ AI-powered prompt enhancement (Admin only)
- 🔄 Import/Export functionality
- 🎨 Modern, responsive UI
- 🌙 Dark/Light theme support

## User Roles

### Admin Users
- Full system access
- AI prompt enhancement capabilities
- Complete template and role management
- System configuration access
- Can delete default items

### Standard Users
- Basic prompt creation and management
- Template usage and customization
- Limited management interface access
- Cannot use AI enhancement features
- Cannot delete default items

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Azure OpenAI API access (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prompt-laibrary.git
cd prompt-laibrary
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables:
```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_admin_password
VITE_USER_USERNAME=user
VITE_USER_PASSWORD=your_user_password
VITE_AZURE_OPENAI_KEY=your_azure_openai_key
VITE_AZURE_OPENAI_ENDPOINT=your_azure_endpoint
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Documentation

- [Technical Documentation](./TECHNICAL.md)
- [Implementation Guidelines](./IMPLEMENTATION_GUIDELINES.md)
- [System Flows](./SYSTEM_FLOWS.md)
- [Component Documentation](./COMPONENTS.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React and TypeScript
- Powered by Azure OpenAI
- UI components with Tailwind CSS
- State management with Zustand
