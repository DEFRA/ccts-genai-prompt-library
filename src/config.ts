// Function to allow easier testing
export const getEnvVar = (key: string, defaultValue: string = ""): string => {
  // Check window.__ENV__ first (highest priority)
  if (window && typeof window === 'object') {
    const windowEnv = (window as any).__ENV__;
    if (windowEnv && typeof windowEnv === 'object' && key in windowEnv && 
        windowEnv[key] !== undefined && windowEnv[key] !== null) {
      return String(windowEnv[key]).trim();
    }
  }

  // Then check import.meta.env (fallback)
  try {
    const viteEnv = import.meta.env;
    if (viteEnv && typeof viteEnv === 'object' && key in viteEnv && 
        viteEnv[key] !== undefined && viteEnv[key] !== null) {
      return String(viteEnv[key]).trim();
    }
  } catch (e) {
    console.warn('Error accessing import.meta.env:', e);
  }

  // Finally use default value if neither source has the key
  return defaultValue.trim();
};

// Export for testing
export const formatAzureEndpoint = (endpoint: string): string => {
  if (!endpoint) return '';
  while (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1);
  }

  if (!endpoint.startsWith('http')) {
    endpoint = `https://${endpoint}`;
  }

  return endpoint;
};

export interface Config {
  MISTRAL_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_MODEL: string;
  DEFAULT_API: string;
  BING_SEARCH_KEY: string;
  BING_SEARCH_KEY_BACKUP: string;
  BING_SEARCH_ENDPOINT: string;
  BING_SEARCH_LOCATION: string;
  AZURE_ORG: string;
  AZURE_PAT: string;
  JIRA_URL: string;
  JIRA_EMAIL: string;
  JIRA_API_TOKEN: string;
  CONFLUENCE_URL: string;
  CONFLUENCE_EMAIL: string;
  CONFLUENCE_API_TOKEN: string;
  CONFLUENCE_SPACE_KEY: string;
  CONFLUENCE_USERNAME: string;

  AZURE_OPENAI_KEY?: string;
  AZURE_OPENAI_ENDPOINT?: string;
  AZURE_OPENAI_DEPLOYMENT_ID?: string;
  SERPER_API_KEY?: string;
  GOOGLE_SERP_API_KEY?: string;
}

export const config: Config = {
  MISTRAL_API_KEY: getEnvVar("VITE_MISTRAL_API_KEY", ""),
  OPENAI_API_KEY: getEnvVar("VITE_OPENAI_API_KEY", ""),  OPENAI_BASE_URL: getEnvVar(
    "VITE_OPENAI_BASE_URL",
    "https://api.openai.com/v1"
  ),
  OPENAI_MODEL: getEnvVar("VITE_OPENAI_MODEL", "gpt-4o"),
  DEFAULT_API: getEnvVar("VITE_DEFAULT_API", "mistral"),

  BING_SEARCH_KEY: getEnvVar("VITE_BING_SEARCH_KEY", ""),
  BING_SEARCH_KEY_BACKUP: getEnvVar("VITE_BING_SEARCH_KEY_BACKUP", ""),
  BING_SEARCH_ENDPOINT: getEnvVar("VITE_BING_SEARCH_ENDPOINT", ""),
  BING_SEARCH_LOCATION: getEnvVar("VITE_BING_SEARCH_LOCATION", "global"),

  AZURE_ORG: getEnvVar("VITE_AZURE_ORG", ""),
  AZURE_PAT: getEnvVar("VITE_AZURE_PAT", ""),

  JIRA_URL: getEnvVar("VITE_JIRA_URL", ""),
  JIRA_EMAIL: getEnvVar("VITE_JIRA_EMAIL", ""),
  JIRA_API_TOKEN: getEnvVar("VITE_JIRA_API_TOKEN", ""),

  CONFLUENCE_URL: getEnvVar("VITE_CONFLUENCE_URL", ""),
  CONFLUENCE_EMAIL: getEnvVar("VITE_CONFLUENCE_EMAIL", ""),
  CONFLUENCE_API_TOKEN: getEnvVar("VITE_CONFLUENCE_API_TOKEN", ""),
  CONFLUENCE_SPACE_KEY: getEnvVar("VITE_CONFLUENCE_SPACE_KEY", ""),
  CONFLUENCE_USERNAME: getEnvVar("VITE_CONFLUENCE_USERNAME", ""),

  AZURE_OPENAI_KEY: getEnvVar("VITE_AZURE_OPENAI_KEY", ""),  AZURE_OPENAI_ENDPOINT: formatAzureEndpoint(
    getEnvVar("VITE_AZURE_OPENAI_ENDPOINT", "")
  ),  AZURE_OPENAI_DEPLOYMENT_ID: getEnvVar(
    "VITE_AZURE_OPENAI_DEPLOYMENT_ID",
    "gpt-4o"
  ),
  SERPER_API_KEY: getEnvVar("VITE_SERPER_API_KEY", ""),
  GOOGLE_SERP_API_KEY: getEnvVar("VITE_GOOGLE_SERP_API_KEY", ""),
};
