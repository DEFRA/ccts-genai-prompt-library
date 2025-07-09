export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    console.error("No content to copy");
    return false;
  }

  const copyMethods = [tryVSCodeCopy, tryClipboardAPI];

  for (const method of copyMethods) {
    try {
      const success = await method(text);
      if (success) return true;
    } catch (error) {
      console.warn(`Copy method failed: ${method.name}`, error);
      continue;
    }
  }

  return false;
};

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: {
        command: string;
        text: string;
        [key: string]: any;
      }) => void;
    };
  }
}

const tryVSCodeCopy = async (text: string): Promise<boolean> => {
  if (typeof window.acquireVsCodeApi === "function") {
    try {
      const vscode = window.acquireVsCodeApi();
      vscode.postMessage({
        type: "copy",
        command: "copyToClipboard",
        text: text,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error("VS Code clipboard operation failed:", error);
      return false;
    }
  }
  return false;
};

const tryClipboardAPI = async (text: string): Promise<boolean> => {
  await navigator.clipboard.writeText(text);
  return true;
};
