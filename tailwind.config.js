export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1b1e',
          card: '#25262b',
          hover: '#2c2d33',
          border: '#2e2f34',
          text: '#c1c2c5',
        },
        light: {
          bg: '#ffffff',
          card: '#f3f3f3',
          hover: '#e8e8e8',
          border: '#d4d4d4',
          text: '#333333',
        },
        vscode: {
 
          'bg': 'var(--vscode-editor-background, #1e1e1e)',
          'fg': 'var(--vscode-editor-foreground, #d4d4d4)',
          

          'light-bg': 'var(--vscode-editor-background, #ffffff)',
          'light-fg': 'var(--vscode-editor-foreground, #333333)',
          'light-sidebar': 'var(--vscode-sideBar-background, #f3f3f3)',
          'light-sidebar-fg': 'var(--vscode-sideBar-foreground, #333333)',
          'light-button': 'var(--vscode-button-background, #007acc)',
          'light-button-hover': 'var(--vscode-button-hoverBackground, #0062a3)',
          'light-button-fg': 'var(--vscode-button-foreground, #ffffff)',
          'light-input-bg': 'var(--vscode-input-background, #ffffff)',
          'light-input-fg': 'var(--vscode-input-foreground, #333333)',
          'light-dropdown': 'var(--vscode-dropdown-background, #f3f3f3)',
          'light-dropdown-fg': 'var(--vscode-dropdown-foreground, #333333)',
          'light-list-active': 'var(--vscode-list-activeSelectionBackground, #2477ce)',
          'light-list-hover': 'var(--vscode-list-hoverBackground, #e8e8e8)',
          'light-border': 'var(--vscode-panel-border, #e8e8e8)',
          'light-active': 'var(--vscode-focusBorder, #007fd4)',
          'light-tab-active': 'var(--vscode-tab-activeBackground, #ffffff)',
          'light-error': 'var(--vscode-errorForeground, #e51400)',
          'light-panel': 'var(--vscode-panel-background, #ffffff)',
          'light-section': 'var(--vscode-settings-sectionBackground, #f3f3f3)',
          
       
          'sidebar': 'var(--vscode-sideBar-background, #252526)',
          'sidebar-fg': 'var(--vscode-sideBar-foreground, #cccccc)',
          

          'button': 'var(--vscode-button-background, #0e639c)',
          'button-hover': 'var(--vscode-button-hoverBackground, #1177bb)',
          'button-fg': 'var(--vscode-button-foreground, #ffffff)',

          'input-bg': 'var(--vscode-input-background, #3c3c3c)',
          'input-fg': 'var(--vscode-input-foreground, #cccccc)',
          

          'dropdown': 'var(--vscode-dropdown-background, #3c3c3c)',
          'dropdown-fg': 'var(--vscode-dropdown-foreground, #f0f0f0)',
          
  
          'list-active': 'var(--vscode-list-activeSelectionBackground, #094771)',
          'list-hover': 'var(--vscode-list-hoverBackground, #2a2d2e)',
          
          'border': 'var(--vscode-panel-border, #80808059)',
          'active': 'var(--vscode-focusBorder, #007fd4)',
          
          'tab-active': 'var(--vscode-tab-activeBackground, #1e1e1e)',
          
          'error': 'var(--vscode-errorForeground, #f48771)',
          
          'panel': 'var(--vscode-panel-background, #1e1e1e)',
          'section': 'var(--vscode-settings-sectionBackground, #252526)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        fadeIn: 'fadeIn 200ms ease-out',
        modalSlide: 'modalSlide 200ms cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        modalSlide: {
          '0%': { 
            opacity: '0',
            transform: 'translate3d(0, -20px, 0) scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'translate3d(0, 0, 0) scale(1)'
          }
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      fontFamily: {
        'vscode': 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, sans-serif)'
      },
      fontSize: {
        'vscode': 'var(--vscode-font-size, 13px)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/typography'),
  ],
};
