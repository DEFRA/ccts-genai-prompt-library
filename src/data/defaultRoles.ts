import { Role } from "../types";

const DEBUG = true;
const debug = (...args: any[]) => {
  if (DEBUG) {
    console.log("[DefaultRoles]", ...args);
  }
};

const roleModules = import.meta.glob("./Roles/*.json", { eager: true });

const processRole = (role: any): Role | null => {
  if (!role?.id || !role?.name) {
    debug("Invalid role data:", role);
    return null;
  }

  const processedRole: Role = {
    ...role,
    isDefault: true,
    createdAt: role.createdAt ?? new Date().toISOString(),
    updatedAt: role.updatedAt ?? new Date().toISOString(),
  };

  debug("Processed role:", { id: processedRole.id, name: processedRole.name });
  return processedRole;
};

const processRoleFile = (filePath: string, module: any): Role[] => {
  if (!module || typeof module !== "object") {
    debug(`Invalid module format in ${filePath}`);
    return [];
  }

  const moduleContent = module as { roles?: any[] };
  if (!Array.isArray(moduleContent.roles)) {
    debug(`No valid roles array in ${filePath}`);
    return [];
  }

  const validRoles = moduleContent.roles
    .map(processRole)
    .filter((role): role is Role => role !== null);

  debug(`Successfully loaded ${validRoles.length} roles from ${filePath}`);
  return validRoles;
};

const loadRolesFromFiles = (): Role[] => {
  debug("Starting to load roles from files");
  debug("Available role modules:", Object.keys(roleModules));

  return Object.entries(roleModules).flatMap(([filePath, module]) => {
    try {
      debug(`Processing file: ${filePath}`);
      return processRoleFile(filePath, module);
    } catch (error) {
      debug(`Error processing file ${filePath}:`, error);
      return [];
    }
  });
};

export const defaultRoles: Role[] = loadRolesFromFiles();
