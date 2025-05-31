// AI配置管理 - 统一管理各种AI服务的配置和初始化
// 移植自ai-mind-map项目，适配Vue.js环境

// AI配置接口定义
export const AI_PROVIDERS = {
  OPENAI: 'openai',
  AZURE: 'azure',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  DEEPSEEK: 'deepseek',
  OLLAMA: 'ollama'
}

// 默认AI配置
export const DEFAULT_AI_CONFIG = {
  provider: AI_PROVIDERS.OPENAI,
  apiKey: '',
  baseURL: '',
  model: 'gpt-3.5-turbo',
  timeout: 30000,
  maxRetries: 3,
  debugMode: false,
  customPrompt: '' // 用户自定义提示词
}

// 思维导图AI配置
export const DEFAULT_MINDMAP_AI_CONFIG = {
  suggestionCount: 3,
  maxResponseLength: 1000,
  enableContextMemory: true,
  contextMemoryRounds: 5
}

// 获取本地存储的AI配置
export function getLocalAIConfig() {
  try {
    const config = localStorage.getItem('ai_config')
    return config ? JSON.parse(config) : DEFAULT_AI_CONFIG
  } catch (error) {
    console.error('获取AI配置失败:', error)
    return DEFAULT_AI_CONFIG
  }
}

// 保存AI配置到本地存储
export function saveLocalAIConfig(config) {
  try {
    localStorage.setItem('ai_config', JSON.stringify(config))
    return true
  } catch (error) {
    console.error('保存AI配置失败:', error)
    return false
  }
}

// 获取当前AI配置
export function getCurrentAIConfig() {
  const localConfig = getLocalAIConfig()
  return { ...DEFAULT_AI_CONFIG, ...localConfig }
}

// 验证AI配置
export function validateAIConfig(config) {
  if (!config) return false

  // 检查必需字段
  if (!config.provider || !config.model) {
    return false
  }

  // 根据提供商检查特定字段
  switch (config.provider) {
    case AI_PROVIDERS.OPENAI:
    case AI_PROVIDERS.DEEPSEEK:
    case AI_PROVIDERS.ANTHROPIC:
      return !!config.apiKey
    case AI_PROVIDERS.OLLAMA:
      return !!config.baseURL
    default:
      return false
  }
}

// 获取提供商配置
export function getProviderConfig(provider) {
  const configs = {
    [AI_PROVIDERS.OPENAI]: {
      name: 'OpenAI',
      baseURL: 'https://api.openai.com/v1',
      models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
      requiresApiKey: true
    },
    [AI_PROVIDERS.DEEPSEEK]: {
      name: 'DeepSeek',
      baseURL: 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-coder', 'deepseek-reasoner'],
      requiresApiKey: true
    },
    [AI_PROVIDERS.ANTHROPIC]: {
      name: 'Anthropic',
      baseURL: 'https://api.anthropic.com/v1',
      models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
      requiresApiKey: true
    },
    [AI_PROVIDERS.GOOGLE]: {
      name: 'Google Gemini',
      baseURL: 'https://generativelanguage.googleapis.com/v1',
      models: ['gemini-pro', 'gemini-pro-vision'],
      requiresApiKey: true
    },
    [AI_PROVIDERS.OLLAMA]: {
      name: 'Ollama',
      baseURL: 'http://localhost:11434',
      models: ['llama2', 'codellama', 'mistral'],
      requiresApiKey: false
    }
  }

  return configs[provider] || configs[AI_PROVIDERS.OPENAI]
}

// 调试日志
export function debugLog(message, data = null) {
  const config = getCurrentAIConfig()
  if (config.debugMode) {
    console.log(`[AI Debug] ${message}`, data)
  }
}

// 获取思维导图AI配置
export function getMindMapAIConfig() {
  try {
    const config = localStorage.getItem('mindmap_ai_config')
    return config ? { ...DEFAULT_MINDMAP_AI_CONFIG, ...JSON.parse(config) } : DEFAULT_MINDMAP_AI_CONFIG
  } catch (error) {
    console.error('获取思维导图AI配置失败:', error)
    return DEFAULT_MINDMAP_AI_CONFIG
  }
}

// 获取固定的JSON格式要求提示词
export function getFixedJSONPrompt() {
  return `

重要：请在回答的最后，使用以下JSON格式额外提供原答案的结构化分点，确保JSON中的内容与你的原始回答保持一致：
\`\`\`json
{
  "structuredPoints": [
    {
      "id": "point_1",
      "title": "概括性标题",
      "content": "详细解释内容",
      "keywords": ["关键词1", "关键词2"]
    }
  ]
}
\`\`\``
}

// 构建完整的系统提示词（用户自定义 + 固定JSON要求）
export function buildSystemPrompt(customPrompt = '') {
  // 获取当前AI配置中的自定义提示词
  const config = getCurrentAIConfig()
  const userPrompt = customPrompt || config.customPrompt || ''

  // 如果用户没有自定义提示词，使用默认提示词
  const defaultPrompt = `你是一个专业的思维导图AI助手。你的任务是帮助用户扩展和完善思维导图。

核心能力：
1. 分析思维导图节点内容
2. 提供相关的子节点建议
3. 回答与节点内容相关的问题
4. 帮助用户理清思路和逻辑关系

回复要求：
- 首先提供一个简洁的总体回答（100-200字）
- 然后提供结构化的分点供用户选择添加到思维导图
- 保持逻辑性和条理性`

  const basePrompt = userPrompt.trim() || defaultPrompt
  const fixedPrompt = getFixedJSONPrompt()

  return basePrompt + fixedPrompt
}

// 保存思维导图AI配置
export function saveMindMapAIConfig(config) {
  try {
    localStorage.setItem('mindmap_ai_config', JSON.stringify(config))
    return true
  } catch (error) {
    console.error('保存思维导图AI配置失败:', error)
    return false
  }
}
