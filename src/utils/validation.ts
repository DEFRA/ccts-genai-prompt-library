import { Role, Template } from "../types";

export const validateApiKey = (apiKey?: string): boolean => {
  if (!apiKey) {
    return false;
  }

  const API_KEY_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;
  return API_KEY_PATTERN.test(apiKey);
};

export const validateEnvironment = (): boolean => {
  const requiredEnvVars = ["MISTRAL_API_KEY"];

  return requiredEnvVars.every((varName) => {
    const value = process.env[varName];
    return value && value.length > 0;
  });
};

export const validateRequestParams = <T extends Record<string, unknown>>(
  params: T,
  requiredFields: (keyof T)[]
): T => {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`Missing required field: ${String(field)}`);
    }
  }

  const sanitized = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  ) as T;

  return sanitized;
};

export const validateUrl = (url: string): string => {
  try {
    const normalizedUrl = new URL(url);
    if (!["http:", "https:"].includes(normalizedUrl.protocol)) {
      throw new Error("Invalid URL protocol");
    }
    return normalizedUrl.toString();  } catch (error) {
    throw new Error(`Invalid URL format: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const validateRole = (role: Role, existingRoles: Role[]): boolean => {
  if (!role.id || !role.name || !role.description) {
    return false;
  }

  const duplicateName = existingRoles.some(
    (r) => r.id !== role.id && r.name.toLowerCase() === role.name.toLowerCase()
  );

  return !duplicateName;
};

export const validateTemplate = (
  template: Template,
  existingRoles: Role[]
): boolean => {
  if (!template.id || !template.name || !template.role) {
    return false;
  }

  const roleExists = existingRoles.some((r) => r.id === template.role);
  if (!roleExists) {
    return false;
  }

  return true;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const validateTemplateInput = (template: Partial<Template>): boolean => {
  if (!template.name || template.name.length < 3) {
    return false;
  }

  if (template.description && template.description.length > 500) {
    return false;
  }

  return true;
};

export const validateRoleInput = (role: Partial<Role>): boolean => {
  if (!role.name || role.name.length < 2) {
    return false;
  }

  if (role.expertise && !Array.isArray(role.expertise)) {
    return false;
  }

  return true;
};
