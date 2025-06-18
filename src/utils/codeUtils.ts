export function detectFileDetails(code: string): { fileName: string; extension: string } {  // Extract filename from first line if it starts with filename=
  const firstLine = code.split('\n')[0];
  const filenameRegex = /filename=(.*)/;
  const fileNameMatch = filenameRegex.exec(firstLine);
  let fileName = fileNameMatch ? fileNameMatch[1].trim() : 'code';
  let extension = fileName.split('.').pop() || '';

  if (!extension) {
    const languageRegex = /language-(\w+)/;
    const languageMatch = languageRegex.exec(firstLine);
    if (languageMatch) {
      extension = languageMatch[1];
      fileName = `${fileName}.${extension}`;
    }
  }

  return { fileName, extension };
}

export function downloadCode(code: string, fileName: string): void {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
