(function (window) {
  try {
    window.__ENV__ = window.__ENV__ || {};

    const cleanValue = (value) => {
      if (typeof value !== 'string') return '';
      if (value.startsWith('%%') && value.endsWith('%%')) {
        return '';
      }
      return value.trim();
    };    const formatEndpoint = (endpoint) => {
      if (!endpoint) return '';
      if (endpoint.endsWith('/')) {
        let i = endpoint.length - 1;
        while (i >= 0 && endpoint[i] === '/') {
          i--;
        }
        endpoint = endpoint.substring(0, i + 1);
      }
      if (!endpoint.startsWith('http')) {
        endpoint = `https://${endpoint}`;
      }
      return endpoint;
    };

    const parseModels = (modelsStr) => {
      if (!modelsStr) return ['gpt-4o-mini', 'gpt-4', 'gpt-4o'];
      return modelsStr.split(',').map(m => m.trim());
    };

    const azureEndpoint = formatEndpoint(cleanValue('%%AZURE_OPENAI_ENDPOINT%%'));
    const azureKey = cleanValue('%%AZURE_OPENAI_KEY%%');
    const azureDeploymentId = cleanValue('%%AZURE_OPENAI_DEPLOYMENT_ID%%');
    const azureModels = parseModels(cleanValue('%%AZURE_OPENAI_MODELS%%'));

    window.__ENV__.VITE_AZURE_OPENAI_KEY = azureKey;
    window.__ENV__.VITE_AZURE_OPENAI_ENDPOINT = azureEndpoint;
    window.__ENV__.VITE_AZURE_OPENAI_DEPLOYMENT_ID = azureDeploymentId || 'gpt-4';
    window.__ENV__.VITE_AZURE_OPENAI_MODELS = azureModels;

    window.__ENV__.VITE_OPENAI_API_KEY = cleanValue('%%OPENAI_API_KEY%%');
    window.__ENV__.VITE_OPENAI_BASE_URL = cleanValue('%%OPENAI_BASE_URL%%') || 'https://api.openai.com/v1';
    window.__ENV__.VITE_OPENAI_MODEL = 'gpt-4';
    window.__ENV__.VITE_OPENAI_MODELS = parseModels(cleanValue('%%OPENAI_MODELS%%'));

    window.__ENV__.VITE_SERPER_API_KEY = cleanValue('%%SERPER_API_KEY%%');
    window.__ENV__.VITE_SERPER_BASE_URL = 'https://google.serper.dev/search';

    window.__ENV__.VITE_API_VERSION = '2023-12-01-preview';

    window.__ENV__.VITE_ENABLE_STREAMING = true;
    window.__ENV__.VITE_ENABLE_CACHING = true;

    window.__ENV__.VITE_ENVIRONMENT = 'production';

    console.log('Configuration loaded successfully');
  } catch (error) {
    console.error('Error initializing configuration:', error);
    window.__ENV__ = window.__ENV__ || {};
  }
})(window); 