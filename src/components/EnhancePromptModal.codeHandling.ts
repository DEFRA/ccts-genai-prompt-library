import { toast } from 'react-hot-toast';

/**
 * Handles copying code to clipboard
 * @param text Text content to copy
 * @returns Promise<boolean> True if successful, false otherwise
 */
export const handleCopyCode = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy code:', error);
    return false;
  }
};

/**
 * Handles downloading code as a file
 * @param content Text content to download
 * @param fileName Name of the file to be downloaded
 */
export const handleDownloadCode = (content: string, fileName: string): void => {
  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  } catch (error) {
    console.error('Failed to download file:', error);
    toast.error('Failed to download file');
  }
};
