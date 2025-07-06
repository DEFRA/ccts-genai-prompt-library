import DOMPurify from "dompurify";

export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") {
    throw new Error("Input must be a string");
  }

  let sanitized = input.replace(/\0/g, "");
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  sanitized = sanitized.replace(
    /(\b(select|insert|update|delete|drop|union|exec|eval)\b)/gi,
    ""
  );
  sanitized = sanitized.replace(/[;&|`]/g, "");
  sanitized = sanitized.trim().replace(/\s+/g, " ");

  return sanitized;
};

export const sanitizeFilename = (filename: string): string => {
  if (typeof filename !== "string") {
    throw new Error("Filename must be a string");
  }

  let sanitized = filename
    .replace(/\.\./g, "")
    .replace(/[/\\?%*:|"<>]/g, "")
    .trim();

  if (!sanitized) {
    sanitized = "unnamed_file";
  }

  const MAX_FILENAME_LENGTH = 255;
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.split(".").pop() || "";
    sanitized =
      sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length - 1) + "." + ext;
  }

  return sanitized;
};
