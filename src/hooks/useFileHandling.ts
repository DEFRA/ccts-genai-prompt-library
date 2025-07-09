import { useState } from "react";
import { toast } from "react-hot-toast";
import { FileData } from "../types";

export const useFileHandling = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);

  const handleFileUpload = (sectionId: string, file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      addUploadedFile(sectionId, file.name, content);
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
    };

    reader.readAsText(file);
  };

  const addUploadedFile = (id: string, name: string, content: string) => {
    setUploadedFiles((prev) => [...prev, { id, name, content }]);
  };

  return { uploadedFiles, handleFileUpload };
};
