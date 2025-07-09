import React from 'react';

export const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return <p className="mt-1 text-sm text-vscode-error">{error}</p>;
};