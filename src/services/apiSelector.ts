import { ChatMessage } from '../types';
import { performSerperSearch as performWebSearch, fetchDDaTFrameworkInfo } from './serperSearch';
import { getApiConfig, isAzureOpenAIConfigured } from '../config/apiConfig';

const CACHE_PREFIX = 'chat_cache_';
const CACHE_DURATION = 60 * 60 * 1000; 
const IMAGE_MAX_SIZE = 800;

interface CacheEntry {
  data: string;
  timestamp: number;
}

class ResponseCache {
  private static instance: ResponseCache;
  private readonly cache: Map<string, CacheEntry>;

  private constructor() {
    this.cache = new Map();
    this.loadFromLocalStorage();
  }

  static getInstance(): ResponseCache {
    if (!ResponseCache.instance) {
      ResponseCache.instance = new ResponseCache();
    }
    return ResponseCache.instance;
  }

  private loadFromLocalStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            const entry: CacheEntry = JSON.parse(value);
            if (Date.now() - entry.timestamp < CACHE_DURATION) {
              this.cache.set(key.slice(CACHE_PREFIX.length), entry);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading cache from localStorage:", error);
    }
  }

  private saveToLocalStorage(key: string, entry: CacheEntry) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      this.clearOldEntries();
    }
  }

  private clearOldEntries() {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          entries.push({ key, entry: JSON.parse(value) as CacheEntry });
        }
      }
    }

    entries.sort((a, b) => b.entry.timestamp - a.entry.timestamp);
    entries.slice(50).forEach(({ key }) => localStorage.removeItem(key));
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, data: string) {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    this.cache.set(key, entry);
    this.saveToLocalStorage(key, entry);
  }
}

const optimizeImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > IMAGE_MAX_SIZE || height > IMAGE_MAX_SIZE) {
        if (width > height) {
          height = (height / width) * IMAGE_MAX_SIZE;
          width = IMAGE_MAX_SIZE;
        } else {
          width = (width / height) * IMAGE_MAX_SIZE;
          height = IMAGE_MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to blob"));
          }
        },
        "image/jpeg",
        0.8
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

const generateCacheKey = (messages: ChatMessage[]): string => {
  return messages.map((m) => `${m.role}:${m.content}`).join("|");
};

const COMPLIANT_SYSTEM_MESSAGE = `You are a professional assistant helping with work-related tasks. You will:
1. Provide accurate and helpful information
2. Follow professional guidelines and best practices
3. Stay focused on the task at hand
4. Maintain appropriate professional boundaries
5. Use clear and professional language`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const extractRetryDelay = (message: string): number => {
  const regex = /retry after (\d+) seconds/;
  const match = regex.exec(message);
  if (match) {
    return parseInt(match[1], 10) * 1000;
  }
  return 0;
};

async function tryModelWithRetry(
  endpoint: string,
  headers: Record<string, string>,
  messages: any[],
  model: string,
  options: any = {}
): Promise<any> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      model,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      n: 1,
      stream: false
    })
  });

  if (response.ok) {
    console.log(`Success with model: ${model}`);
    return await response.json();
  }

  const errorData = await response.json();
  console.log(`Error with model ${model}:`, errorData);

  if (response.status === 429) {
    const retryDelay = extractRetryDelay(errorData.error?.message ?? '');
    if (retryDelay) {
      console.log(`Rate limit hit for ${model}, waiting ${retryDelay}ms`);
      await delay(retryDelay);
      return tryModelWithRetry(endpoint, headers, messages, model, options);
    }
  }

  throw errorData;
}

const tryDifferentModels = async (
  endpoint: string,
  headers: Record<string, string>,
  messages: any[],
  models: string[],
  options: any = {}
): Promise<any> => {
  const errors: any[] = [];
  let lastRateLimitError = null;
  let lastContentFilterError = null;

  for (const model of models) {
    try {
      return await tryModelWithRetry(endpoint, headers, messages, model, options);
    } catch (error) {
      console.log(`Error with model ${model}:`, error);
      if (error.error?.message?.includes('rate limit')) {
        lastRateLimitError = error;
      }
      if (error.error?.message?.includes('content filtering system') || 
          error.error?.message?.includes('content policy')) {
        lastContentFilterError = error;
        console.log('DEBUG: Found content filter error:', error);
      }
      errors.push({ model, error });
    }
  }

  if (lastContentFilterError) {
    console.log('DEBUG: Throwing content filter error:', lastContentFilterError);
    throw lastContentFilterError;
  }

  if (lastRateLimitError) {
    throw new Error(
      `Rate limit exceeded for all models. ${
        lastRateLimitError.error?.message ?? "Please try again later."
      }`
    );
  }

  throw new Error(`All models failed:\n${JSON.stringify(errors, null, 2)}`);
};

async function tryAzureOpenAI(prompt: string, options: any, cache: ResponseCache, cacheKey: string): Promise<string> {
  const deploymentId = getApiConfig().azure.deploymentId;
  const endpoint = getApiConfig().azure.endpoint;
  const cleanPrompt = prompt.replace(/[^\w\s.,?!-]/g, ' ').trim();
  const messages = [
    { role: 'system', content: COMPLIANT_SYSTEM_MESSAGE },
    { role: 'user', content: cleanPrompt }
  ];

  try {
    const response = await tryDifferentModels(
      `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${getApiConfig().azure.apiVersion}`,
      {
        'Content-Type': 'application/json',
        'api-key': getApiConfig().azure.apiKey
      },
      messages,
      getApiConfig().azure.models,
      options
    );

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Azure OpenAI API');
    }

    const result = response.choices[0].message.content;
    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.log('DEBUG tryAzureOpenAI caught error:', error);
    throw error;
  }
}

async function tryOpenAI(prompt: string, options: any, cache: ResponseCache, cacheKey: string): Promise<string> {
  const messages = [
    { role: 'system', content: COMPLIANT_SYSTEM_MESSAGE },
    { role: 'user', content: prompt }
  ];

  const response = await tryDifferentModels(
    `${getApiConfig().openai.baseUrl}/chat/completions`,
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiConfig().openai.apiKey}`
    },
    messages,
    getApiConfig().openai.models,
    options
  );

  if (!response.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from OpenAI API');
  }

  const result = response.choices[0].message.content;
  cache.set(cacheKey, result);
  return result;
}

// Extract error message parsing logic
const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    if ('error' in errorObj && errorObj.error && typeof errorObj.error === 'object') {
      const nestedError = errorObj.error as Record<string, unknown>;
      if ('message' in nestedError && typeof nestedError.message === 'string') {
        return nestedError.message;
      }
    }
  }
  return String(error);
};

// Extract error handling logic
const handleLLMError = (error: unknown): never => {
  console.error('Error in submitToLLM:', error);
  
  const errorMsg = extractErrorMessage(error);
  
  // Debug logging
  console.log('DEBUG submitToLLM error message:', errorMsg);
  
  // Handle rate limit errors
  if (typeof errorMsg === 'string' && errorMsg.includes('Rate limit exceeded')) {
    throw new Error('API rate limit exceeded. Please try again later or contact support to increase your quota.');
  }
  
  throw error;
};

// Extract Azure OpenAI error checking
const shouldRethrowAzureError = (error: unknown): boolean => {
  const msg = extractErrorMessage(error);
  let nestedMsg = '';
  
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if ('error' in errorObj && errorObj.error && typeof errorObj.error === 'object') {
      const nestedError = errorObj.error as Record<string, unknown>;
      if ('message' in nestedError && typeof nestedError.message === 'string') {
        nestedMsg = nestedError.message;
      }
    }
  }
  
  const fullMsg = msg ?? nestedMsg;
  
  return fullMsg.includes('content policy') ||
         fullMsg.includes('Rate limit exceeded') ||
         fullMsg.includes('content filtering system');
};

export const submitToLLM = async (
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  } = {}
): Promise<string> => {
  const cache = ResponseCache.getInstance();
  const cacheKey = `llm:${prompt}:${JSON.stringify(options)}`;
  
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    if (isAzureOpenAIConfigured()) {
      try {
        return await tryAzureOpenAI(prompt, options, cache, cacheKey);
      } catch (error) {
        if (shouldRethrowAzureError(error)) {
          throw error;
        }
      }
    }

    throw new Error('No API keys configured. Please configure either Azure OpenAI key.');
  } catch (error) {
    return handleLLMError(error);
  }
};

const API_FALLBACKS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini"],
  },
  azure: {
    baseUrl: getApiConfig().azure.endpoint ?? "",
    models: ["gpt-4o", "gpt-4o-mini"],
    apiVersion: "2023-12-01-preview",
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
    models: ["mistral-tiny", "mistral-small", "mistral-medium"],
  },
};

const tryAPIEndpoints = async (messages: any[], options: any = {}) => {
  const errors: any[] = [];

  if (getApiConfig().azure.apiKey && getApiConfig().azure.endpoint) {
    try {
      const deploymentId = getApiConfig().azure.deploymentId ?? "gpt-4o";
      const apiVersion = API_FALLBACKS.azure.apiVersion;

      const response = await fetch(
        `${getApiConfig().azure.endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${apiVersion}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": getApiConfig().azure.apiKey,
          },
          body: JSON.stringify({
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 2000,
            ...options,
          }),
        }
      );

      if (response.ok) {
        return await response.json();
      }

      const error = await response.json().catch(() => ({}));
      errors.push({ endpoint: "azure", error });
    } catch (error) {
      errors.push({ endpoint: "azure", error });
    }
  }

  if (getApiConfig().openai.apiKey) {
    try {
      const response = await fetch(
        `${
          getApiConfig().openai.baseUrl ?? API_FALLBACKS.openai.baseUrl
        }/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getApiConfig().openai.apiKey}`,
          },
          body: JSON.stringify({
            model: getApiConfig().openai.model || "gpt-4o",
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 2000,
            ...options,
          }),
        }
      );

      if (response.ok) {
        return await response.json();
      }

      const error = await response.json().catch(() => ({}));
      errors.push({ endpoint: "openai", error });
    } catch (error) {
      errors.push({ endpoint: "openai", error });
    }
  }

  if (!getApiConfig().azure.apiKey) {
    throw new Error("No API keys configured. Please configure Azure OpenAI.");
  }

  throw new Error(
    `All API endpoints failed:\n${JSON.stringify(errors, null, 2)}`
  );
};

const INAPPROPRIATE_PATTERNS = [
  /\b(sex|porn|nude|nsfw|xxx)\b/i,
  /\b(fuck|shit|damn|bitch|ass)\b/i,
  /\b(kill|murder|suicide|death)\b/i,
  /\b(racist|racism|nazi|supremacy)\b/i,
  /\b(joke|funny|meme|lol|lmao)\b/i,
];

const OFF_TOPIC_PATTERNS = [
  /\b(dating|relationship advice|gossip)\b/i,
  /\b(cryptocurrency|stock market|gambling)\b/i,
  /\b(politics|religion|conspiracy)\b/i,
];

const filterContent = (
  message: string
): { isAllowed: boolean; reason?: string } => {
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(message)) {
      return {
        isAllowed: false,
        reason:
          "I apologize, but I need to stay focused on work-related topics. Please keep our conversation professional and work-related.",
      };
    }
  }

  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(message)) {
      return {
        isAllowed: false,
        reason:
          "I need to stay focused on work-related topics. Let's return to discussing your professional needs or technical questions.",
      };
    }
  }

  return { isAllowed: true };
};

function buildSystemMessage(initialContent: string, ddatInfo: string, searchResults: any[] = []): string {
  const safeResults = Array.isArray(searchResults) ? searchResults : [];
  return `${COMPLIANT_SYSTEM_MESSAGE}

Context from initial prompt:
${initialContent || "Focus on providing professional assistance."}

GDS Standards and Best Practices:
${safeResults.map((result) => `- ${result.snippet}`).join("\n")}

DDaT Framework Context:
${ddatInfo}

Guidelines:
1. Stay focused on work-related topics
2. Provide clear, professional responses
3. Follow GDS best practices and standards
4. Maintain appropriate boundaries
5. Use professional terminology`;
}

async function callAzureOpenAI(messages: any[], cache: ResponseCache, cacheKey: string): Promise<string> {
  const deploymentId = getApiConfig().azure.deploymentId ?? 'gpt-4o';  let endpoint = getApiConfig().azure.endpoint;
  if (endpoint?.endsWith('/')) {
    let i = endpoint.length - 1;
    while (i >= 0 && endpoint[i] === '/') {
      i--;
    }
    endpoint = endpoint.substring(0, i + 1);
  }
  const response = await fetch(
    `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=${getApiConfig().azure.apiVersion}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': getApiConfig().azure.apiKey
      },
      body: JSON.stringify({
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        n: 1,
        stream: false
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error?.innererror?.code === 'ResponsibleAIPolicyViolation') {
      return "I apologize, but I need to maintain professional boundaries. Please rephrase your message to focus on work-related topics.";
    }
    throw new Error(`Azure OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const result = data.choices[0]?.message?.content ?? '';
  cache.set(cacheKey, result);
  return result;
}

async function callOpenAI(messages: any[], cache: ResponseCache, cacheKey: string): Promise<string> {
  const response = await fetch(`${getApiConfig().openai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiConfig().openai.apiKey}`
    },
    body: JSON.stringify({
      model: getApiConfig().openai.model || 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      n: 1,
      stream: false
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Azure OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const result = data.choices[0]?.message?.content ?? '';
  cache.set(cacheKey, result);
  return result;
}

export const submitChatMessage = async (
  message: string,
  initialContent: string, 
  context: ChatMessage[]
): Promise<string> => {
  const contentCheck = filterContent(message);
  if (!contentCheck.isAllowed) {
    return contentCheck.reason ?? "I need to stay focused on work-related topics.";
  }

  const cache = ResponseCache.getInstance();
  const cacheKey = generateCacheKey([
    ...context,
    {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);


  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {

    const cleanMessage = message.replace(/[^\w\s.,?!-]/g, ' ').trim();
    const [searchResults, ddatInfo] = await Promise.all([
      performWebSearch(cleanMessage, 'technical_architect', 'general'),
      fetchDDaTFrameworkInfo('technical_architect')
    ]);

    const systemMessage = buildSystemMessage(initialContent, ddatInfo, searchResults);

    const messages = [
      { role: 'system', content: systemMessage },
      ...context.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: cleanMessage }
    ];

    if (getApiConfig().azure.apiKey && getApiConfig().azure.endpoint) {
      return await callAzureOpenAI(messages, cache, cacheKey);
    }
    if (getApiConfig().openai.apiKey) {
      return await callOpenAI(messages, cache, cacheKey);
    }
    throw new Error('No API keys configured');
  } catch (error) {
    console.error("Error in submitChatMessage:", error);
    throw error;
  }
};
