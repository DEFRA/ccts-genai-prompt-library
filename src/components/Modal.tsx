import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  title?: string;
  hideHeader?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full h-full'
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className = '',
  hideHeader = false
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-vscode">
      <div className="flex min-h-screen items-center justify-center p-0">        {/* Backdrop */}
        <button 
          className="fixed inset-0 bg-black/50" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onClose();
            }
          }}
          aria-label="Close modal"
          data-testid="modal-backdrop"
          tabIndex={0}
        />
        
        {/* Modal */}
        <dialog
          open
          className={`
            relative w-full ${sizeClasses[size]} ${className}
            bg-vscode-panel border border-vscode-border
            shadow-lg
          `}
          aria-modal="true"
        >
          {/* Header */}
          {!hideHeader && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-vscode-border bg-vscode-section">
              {title && (
                <h3 className="text-sm font-medium text-vscode-fg">
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className="p-2.5 rounded-sm text-vscode-fg hover:text-vscode-fg hover:bg-vscode-list-hover transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="relative">
            {children}
          </div>
        </dialog>
      </div>
    </div>
  );
};
