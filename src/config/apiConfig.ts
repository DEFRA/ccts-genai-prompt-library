import { z } from 'zod';

const apiConfigSchema = z.object({
  azure: z.object({
    apiKey: z.string().min(1, 'Azure OpenAI API key is required'),
    endpoint: z.string().min(1, 'Azure OpenAI endpoint is required')
      .transform(endpoint => {
        const formattedEndpoint = formatAzureEndpoint(endpoint);
        if (!formattedEndpoint) {
          console.error('Invalid or missing Azure OpenAI endpoint');
          return '';
        }
        return formattedEndpoint;
      }),
    deploymentId: z.string().min(1, 'Azure OpenAI deployment ID is required')
      .transform(id => id || 'gpt-4'),
    apiVersion: z.string().default('2023-12-01-preview'),
    models: z.array(z.string()).default(['gpt-4o-mini', 'gpt-4', 'gpt-4o'])
  }),
  openai: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().default('https://api.openai.com/v1'),
    model: z.string().default('gpt-4'),
    models: z.array(z.string()).default(['gpt-4o-mini', 'gpt-4', 'gpt-4o'])
  }),
  serper: z.object({
    apiKey: z.string().optional(),
    baseUrl: z.string().default('https://google.serper.dev/search')
  }).optional()
});

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    const windowEnv = (window as any).__ENV__;
    if (windowEnv?.[key]) {
      const value = windowEnv[key].trim();
      if (value.startsWith('%%') && value.endsWith('%%')) {
        const viteEnv = import.meta.env;
        if (viteEnv[key]) {
          return viteEnv[key].trim();
        }
        console.warn(`Environment variable ${key} contains placeholder value`);
        return defaultValue;
      }
      return value;
    }

    const viteEnv = import.meta.env;
    if (viteEnv[key]) {
      return viteEnv[key].trim();
    }

    return defaultValue.trim();
  } catch (error) {
    console.warn(`Error getting environment variable ${key}:`, error);
    return defaultValue.trim();
  }
};

const formatAzureEndpoint = (endpoint: string): string => {
  if (!endpoint) return '';
  
  try {

    if (endpoint.startsWith('%%') && endpoint.endsWith('%%')) {
      const viteEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
      if (viteEndpoint) {
        endpoint = viteEndpoint;
      } else {
        console.warn('Azure OpenAI endpoint contains placeholder value');
        return '';
      }    }

    while (endpoint.endsWith('/')) {
      endpoint = endpoint.substring(0, endpoint.length - 1);
    }

    if (!endpoint.startsWith('http')) {
      endpoint = `https://${endpoint}`;
    }

    new URL(endpoint);
    
    return endpoint;
  } catch (error) {
    console.error('Invalid endpoint URL format:', endpoint, error);
    throw new Error(`Invalid Azure endpoint URL: ${endpoint}`);
  }
};

export const apiConfig = (() => {
  try {
    const azureKey = getEnvVar('VITE_AZURE_OPENAI_KEY') || import.meta.env.VITE_AZURE_OPENAI_KEY;
    const azureEndpoint = getEnvVar('VITE_AZURE_OPENAI_ENDPOINT') ?? import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const azureDeploymentId = getEnvVar('VITE_AZURE_OPENAI_DEPLOYMENT_ID', 'gpt-4') ?? import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_ID ?? 'gpt-4';

    const azureModels = (getEnvVar('VITE_AZURE_OPENAI_MODELS') || 'gpt-4,gpt-4o,gpt-4o-mini').split(',').map(m => m.trim());
    const openaiModels = (getEnvVar('VITE_OPENAI_MODELS') || 'gpt-4,gpt-4o,gpt-4o-mini').split(',').map(m => m.trim());
  
    console.log('Environment Variables:', {
      hasAzureKey: !!azureKey,
      azureEndpoint,
      azureDeploymentId,
      azureModels,
      openaiModels,
      viteEnv: {
        hasKey: !!import.meta.env.VITE_AZURE_OPENAI_KEY,
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
        deploymentId: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_ID
      }
    });

    if (!azureKey || !azureEndpoint) {
      throw new Error('Required Azure OpenAI configuration is missing. Please check your environment variables.');
    }

    const config = apiConfigSchema.parse({
      azure: {
        apiKey: azureKey,
        endpoint: azureEndpoint,
        deploymentId: azureDeploymentId,
        apiVersion: '2023-12-01-preview',
        models: azureModels
      },
      openai: {
        apiKey: getEnvVar('VITE_OPENAI_API_KEY') || import.meta.env.VITE_OPENAI_API_KEY,
        baseUrl: getEnvVar('VITE_OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        model: getEnvVar('VITE_OPENAI_MODEL', 'gpt-4'),
        models: openaiModels
      },
      serper: {
        apiKey: getEnvVar('VITE_SERPER_API_KEY') || import.meta.env.VITE_SERPER_API_KEY,
        baseUrl: getEnvVar('VITE_SERPER_BASE_URL', 'https://google.serper.dev/search')
      }
    });

    console.log('API Configuration Status:', {
      azure: {
        hasKey: !!config.azure.apiKey,
        hasEndpoint: !!config.azure.endpoint,
        endpoint: config.azure.endpoint,
        deploymentId: config.azure.deploymentId,
        models: config.azure.models
      },
      openai: {
        hasKey: !!config.openai.apiKey,
        hasBaseUrl: !!config.openai.baseUrl,
        models: config.openai.models
      },
      serper: {
        hasKey: !!config.serper?.apiKey
      }
    });

    return config;
  } catch (error) {
    console.error('API Configuration Error:', error);
    return {
      azure: {
        apiKey: '',
        endpoint: '',
        deploymentId: 'gpt-4',
        apiVersion: '2023-12-01-preview',
        models: ['gpt-4o-mini', 'gpt-4', 'gpt-4o']
      },
      openai: {
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4',
        models: ['gpt-4o-mini', 'gpt-4', 'gpt-4o']
      },
      serper: {
        apiKey: '',
        baseUrl: 'https://google.serper.dev/search'
      }
    };
  }
})();

export const AZURE_API_VERSION = apiConfig.azure.apiVersion;
export const isAzureOpenAIConfigured = (): boolean => !!(apiConfig.azure.apiKey && apiConfig.azure.endpoint);
export const isOpenAIConfigured = (): boolean => !!apiConfig.openai.apiKey;
export const COMPLIANT_SYSTEM_MESSAGE = `You are a professional assistant helping with work-related tasks. You will:
1. Provide accurate and helpful information
2. Follow professional guidelines and best practices
3. Stay focused on the task at hand
4. Maintain appropriate professional boundaries
5. Use clear and professional language`; 