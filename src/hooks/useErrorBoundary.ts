import { useCallback } from "react";

export const useErrorBoundary = () => {
  const handleError = useCallback((error: unknown) => {
    console.error("Error caught by useErrorBoundary:", error);

    throw error;
  }, []);

  return { handleError };
};
