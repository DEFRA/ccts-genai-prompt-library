import React from "react";
import { Template } from "../types";
import { Modal } from "./Modal";

interface ViewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  onUseTemplate?: () => void;
}

export const ViewTemplateModal: React.FC<ViewTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
}) => {
  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={template.name}>
      <div className="space-y-4 sm:space-y-6">
        {/* Description */}
        {template.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
              Description
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-200">
              {template.description}
            </p>
          </div>
        )}

        {/* Role */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
            Role
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-200">
            {template.role}
          </p>
        </div>

        {/* RACE Framework */}
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            RACE Framework
          </h3>

          {template.raceRole && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                Role
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xs">
                <p className="text-sm text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {template.raceRole}
                </p>
              </div>
            </div>
          )}

          {template.raceAction && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                Action
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xs">
                <p className="text-sm text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {template.raceAction}
                </p>
              </div>
            </div>
          )}

          {template.raceContext && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                Context
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xs">
                <p className="text-sm text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {template.raceContext}
                </p>
              </div>
            </div>
          )}

          {template.raceExpectation && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                Execute
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xs">
                <p className="text-sm text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {template.raceExpectation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Sections */}
        {template.customSections?.map((section) => (
          <div key={section.id}>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              {section.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-200">
              {section.description}
            </p>
            {!!section.content?.length && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xs mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-200 whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Close
          </button>
          {onUseTemplate && (
            <button
              onClick={onUseTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Use Template
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
