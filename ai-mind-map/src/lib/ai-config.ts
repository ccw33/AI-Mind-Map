// AI配置管理 - 统一管理各种AI服务的配置和初始化

export interface AIConfig {
  provider: 'openai' | 'azure' | 'anthropic' | 'google' | 'deepseek' | 'ollama'
  apiKey?: string
  baseURL?: string
  model: string
  timeout: number
  maxRetries: number
  debugMode: boolean
}

export interface MindMapAIConfig {
  suggestionCount: number
  maxResponseLength: number
  enableContextMemory: boolean
  contextMemoryRounds: number
}

// 获取环境变量的辅助函数
function getEnvVar(key: string, defaultValue?: string): string {
  if (typeof window !== 'undefined') {
    // 客户端环境，只能访问 NEXT_PUBLIC_ 前缀的变量
    return (window as any).__ENV__?.[key] || defaultValue || ''
  }
  // 服务端环境
  return process.env[key] || defaultValue || ''
}

// OpenAI配置
export const openaiConfig: AIConfig = {
  provider: 'openai',
  apiKey: getEnvVar('OPENAI_API_KEY'),
  baseURL: getEnvVar('OPENAI_API_BASE_URL', 'https://api.openai.com/v1'),
  model: getEnvVar('OPENAI_DEFAULT_MODEL', 'gpt-3.5-turbo'),
  timeout: parseInt(getEnvVar('AI_REQUEST_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES', '3')),
  debugMode: getEnvVar('AI_DEBUG_MODE', 'false') === 'true'
}

// Azure OpenAI配置
export const azureConfig: AIConfig = {
  provider: 'azure',
  apiKey: getEnvVar('AZURE_OPENAI_API_KEY'),
  baseURL: getEnvVar('AZURE_OPENAI_ENDPOINT'),
  model: getEnvVar('AZURE_OPENAI_DEPLOYMENT_NAME', 'gpt-35-turbo'),
  timeout: parseInt(getEnvVar('AI_REQUEST_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES', '3')),
  debugMode: getEnvVar('AI_DEBUG_MODE', 'false') === 'true'
}

// Anthropic配置
export const anthropicConfig: AIConfig = {
  provider: 'anthropic',
  apiKey: getEnvVar('ANTHROPIC_API_KEY'),
  baseURL: 'https://api.anthropic.com',
  model: getEnvVar('ANTHROPIC_DEFAULT_MODEL', 'claude-3-sonnet-20240229'),
  timeout: parseInt(getEnvVar('AI_REQUEST_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES', '3')),
  debugMode: getEnvVar('AI_DEBUG_MODE', 'false') === 'true'
}

// Google AI配置
export const googleConfig: AIConfig = {
  provider: 'google',
  apiKey: getEnvVar('GOOGLE_AI_API_KEY'),
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  model: getEnvVar('GOOGLE_DEFAULT_MODEL', 'gemini-pro'),
  timeout: parseInt(getEnvVar('AI_REQUEST_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES', '3')),
  debugMode: getEnvVar('AI_DEBUG_MODE', 'false') === 'true'
}

// DeepSeek配置
export const deepseekConfig: AIConfig = {
  provider: 'deepseek',
  apiKey: getEnvVar('DEEPSEEK_API_KEY'),
  baseURL: getEnvVar('DEEPSEEK_API_BASE_URL', 'https://api.deepseek.com'),
  model: getEnvVar('DEEPSEEK_DEFAULT_MODEL', 'deepseek-chat'),
  timeout: parseInt(getEnvVar('AI_REQUEST_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES', '3')),
  debugMode: getEnvVar('AI_DEBUG_MODE', 'false') === 'true'
}

// Ollama配置
export const ollamaConfig: AIConfig = {
  provider: 'ollama',
  baseURL: getEnvVar('OLLAMA_API_BASE_URL', 'http://localhost:11434'),
  model: getEnvVar('OLLAMA_DEFAULT_MODEL', 'llama2'),
  timeout: parseInt(getEnvVar('AI_REQUEST_TIMEOUT', '30000')),
  maxRetries: parseInt(getEnvVar('AI_MAX_RETRIES', '3')),
  debugMode: getEnvVar('AI_DEBUG_MODE', 'false') === 'true'
}

// 思维导图AI配置
export const mindMapAIConfig: MindMapAIConfig = {
  suggestionCount: parseInt(getEnvVar('AI_SUGGESTION_COUNT', '3')),
  maxResponseLength: parseInt(getEnvVar('AI_MAX_RESPONSE_LENGTH', '1000')),
  enableContextMemory: getEnvVar('AI_ENABLE_CONTEXT_MEMORY', 'true') === 'true',
  contextMemoryRounds: parseInt(getEnvVar('AI_CONTEXT_MEMORY_ROUNDS', '5'))
}

// 获取当前AI配置
export function getCurrentAIConfig(): AIConfig {
  const provider = getEnvVar('DEFAULT_AI_PROVIDER', 'openai') as AIConfig['provider']

  switch (provider) {
    case 'azure':
      return azureConfig
    case 'anthropic':
      return anthropicConfig
    case 'google':
      return googleConfig
    case 'deepseek':
      return deepseekConfig
    case 'ollama':
      return ollamaConfig
    case 'openai':
    default:
      return openaiConfig
  }
}

// 验证配置是否完整
export function validateAIConfig(config: AIConfig): boolean {
  if (config.provider === 'ollama') {
    // Ollama不需要API Key
    return !!config.baseURL && !!config.model
  }

  return !!config.apiKey && !!config.model
}

// 获取可用的AI提供商列表
export function getAvailableProviders(): Array<{ id: string; name: string; available: boolean }> {
  return [
    {
      id: 'openai',
      name: 'OpenAI',
      available: validateAIConfig(openaiConfig)
    },
    {
      id: 'azure',
      name: 'Azure OpenAI',
      available: validateAIConfig(azureConfig)
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      available: validateAIConfig(anthropicConfig)
    },
    {
      id: 'google',
      name: 'Google Gemini',
      available: validateAIConfig(googleConfig)
    },
    {
      id: 'deepseek',
      name: 'DeepSeek',
      available: validateAIConfig(deepseekConfig)
    },
    {
      id: 'ollama',
      name: 'Ollama (本地)',
      available: validateAIConfig(ollamaConfig)
    }
  ]
}

// 调试日志
export function debugLog(message: string, data?: any) {
  const config = getCurrentAIConfig()
  if (config.debugMode) {
    console.log(`[AI Debug] ${message}`, data)
  }
}
