import { useRoleStore } from "./roleStore";
import { useTemplateStore } from "./templateStore";
import { defaultRoles } from "../data/defaultRoles";
import { defaultTemplates } from "../data/defaultTemplates";

const DEBUG = true;
const debug = (...args: any[]) => {
};

let isInitialized = false;

export const initializeStores = async () => {
  if (isInitialized) {
    debug("Stores already initialized");
    return;
  }

  try {
    debug("Starting store initialization");

    const roleStore = useRoleStore.getState();
    if (!roleStore.isInitialized) {
      debug("Initializing role store");
      roleStore.initializeDefaultRoles(defaultRoles);
    }

    const templateStore = useTemplateStore.getState();
    if (!templateStore.isInitialized) {
      debug("Initializing template store");
      templateStore.initializeDefaultTemplates(defaultTemplates);
      templateStore.initializeTemplates();
    }

    isInitialized = true;
    debug("Store initialization complete");
  } catch (error) {
    debug("Failed to initialize stores:", error);
    throw error;
  }
};

export const isStoreInitialized = () => isInitialized;

export const areStoresReady = () => {
  const roleStore = useRoleStore.getState();
  const templateStore = useTemplateStore.getState();
  return roleStore.isInitialized && templateStore.isInitialized;
};
