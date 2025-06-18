const fs = require('fs');
const path = require('path');

function formatAzureEndpoint(endpoint) {
  if (!endpoint) return '';
  while (endpoint.endsWith('/')) {
    endpoint = endpoint.slice(0, -1);
  }

  if (!endpoint.startsWith('http')) {
    endpoint = `https://${endpoint}`;
  }

  return endpoint;
}

function replaceEnvVariables(content) {
  const envVars = {
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY,
    AZURE_OPENAI_ENDPOINT: formatAzureEndpoint(process.env.AZURE_OPENAI_ENDPOINT),
    AZURE_OPENAI_DEPLOYMENT_ID: process.env.AZURE_OPENAI_DEPLOYMENT_ID || 'gpt-4',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    SERPER_API_KEY: process.env.SERPER_API_KEY
  };

  console.log('Environment Variables Status:', {
    hasAzureKey: !!envVars.AZURE_OPENAI_KEY,
    azureEndpoint: envVars.AZURE_OPENAI_ENDPOINT,
    azureDeploymentId: envVars.AZURE_OPENAI_DEPLOYMENT_ID,
    hasOpenAIKey: !!envVars.OPENAI_API_KEY,
    hasSerperKey: !!envVars.SERPER_API_KEY
  });

  return Object.entries(envVars).reduce((acc, [key, value]) => {
    if (!value) {
      console.warn(`Warning: ${key} is not set in environment variables`);
      return acc;
    }
    return acc.replace(new RegExp(`%%${key}%%`, 'g'), value);
  }, content);
}

async function deploy() {
  try {
    if (!process.env.AZURE_OPENAI_KEY) {
      throw new Error('AZURE_OPENAI_KEY is required but not set');
    }
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error('AZURE_OPENAI_ENDPOINT is required but not set');
    }

    const configPath = path.join(__dirname, '../dist/config.js');
    console.log('Reading config from:', configPath);

    const configContent = fs.readFileSync(configPath, 'utf8');
    console.log('Config template loaded successfully');

    const updatedConfig = replaceEnvVariables(configContent);
    console.log('Environment variables replaced successfully');

    fs.writeFileSync(configPath, updatedConfig);
    console.log('Configuration file updated successfully');

  } catch (error) {
    console.error('Error updating configuration:', error);
    process.exit(1);
  }
}

deploy();