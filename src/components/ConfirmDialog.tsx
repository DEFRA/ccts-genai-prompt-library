import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message: string;
  title?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  message,
  title = 'Confirm Action'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-vscode text-vscode">
      <div className="flex min-h-screen items-center justify-center p-4">
        <button className="fixed inset-0 bg-vscode-bg/80" onClick={onCancel} aria-label="Close dialog" />
        
        <div className="relative w-full max-w-sm bg-vscode-bg border border-vscode-border">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h3 className="text-base font-medium text-vscode-fg">
                {title}
              </h3>
            </div>
            
            <p className="text-sm text-white/50 mb-6">
              {message}
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm bg-vscode-input-bg text-vscode-input-fg border border-vscode-border rounded-sm hover:bg-vscode-list-hover"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-3 py-1.5 text-sm bg-vscode-button text-vscode-button-fg rounded-sm hover:bg-vscode-button-hover"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
