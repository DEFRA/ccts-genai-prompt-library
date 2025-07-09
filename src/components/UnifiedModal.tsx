import React from "react";
import { X, ArrowLeft } from "lucide-react";

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
}

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  onBack,
  title,
  children,
  size = "lg",
  className = "",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        className={`relative w-full ${sizeClasses[size]} mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 ${className}`}
      >
  
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          {onBack ? (
            <button
              onClick={onBack}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center space-x-2 text-sm"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {title && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center flex-grow">
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
