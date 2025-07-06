import { toast } from "react-hot-toast";

export const getFileExtension = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "txt";
  return ext;
};

export const downloadFile = (content: string, filename: string): void => {
  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download file:", error);
    toast.error("Failed to download file");
  }
};

export const validateFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(true);
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
};
