// AI服务接口 - 统一的AI调用接口，支持多种AI提供商
// 移植自ai-mind-map项目，适配Vue.js环境

import { getCurrentAIConfig, validateAIConfig, debugLog, getMindMapAIConfig, AI_PROVIDERS } from './ai-config.js'

// AI服务类
export class AIService {
  constructor() {
    this.config = getCurrentAIConfig()
    this.conversationHistory = []
    this.mindMapConfig = getMindMapAIConfig()

    if (!validateAIConfig(this.config)) {
      console.warn('AI配置不完整，某些功能可能无法正常工作')
    }
  }

  // 发送聊天消息
  async sendMessage(message, context = null) {
    try {
      debugLog('发送AI消息', { message, context, config: this.config })

      // 构建消息历史
      const messages = this.buildMessages(message, context)

      // 根据提供商调用相应的API
      const response = await this.callAI(messages)

      // 更新对话历史
      if (this.mindMapConfig.enableContextMemory) {
        this.updateConversationHistory(message, response.content)
      }

      debugLog('AI响应', response)
      return response

    } catch (error) {
      console.error('AI服务调用失败:', error)
      throw new Error('AI服务暂时不可用，请稍后重试')
    }
  }

  // 构建消息列表
  buildMessages(userMessage, context) {
    const messages = []

    // 系统提示词
    let systemPrompt = '你是一个专业的思维导图助手，帮助用户扩展和完善思维导图内容。'

    if (context && context.selectedNode) {
      const { text, hierarchy } = context.selectedNode
      systemPrompt += `\n\n当前用户选中的节点是："${text}"，位于思维导图的层级：${hierarchy.join(' > ')}。请基于这个节点的上下文来回答用户的问题。`
    }

    messages.push({
      role: 'system',
      content: systemPrompt
    })

    // 添加对话历史（如果启用了上下文记忆）
    if (this.mindMapConfig.enableContextMemory && this.conversationHistory.length > 0) {
      const recentHistory = this.conversationHistory.slice(-this.mindMapConfig.contextMemoryRounds * 2)
      messages.push(...recentHistory)
    }

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content: userMessage
    })

    return messages
  }

  // 调用AI API
  async callAI(messages) {
    const { provider } = this.config

    switch (provider) {
      case AI_PROVIDERS.OPENAI:
      case AI_PROVIDERS.DEEPSEEK:
        return await this.callOpenAICompatibleAPI(messages)
      case AI_PROVIDERS.ANTHROPIC:
        return await this.callAnthropicAPI(messages)
      case AI_PROVIDERS.OLLAMA:
        return await this.callOllamaAPI(messages)
      default:
        throw new Error(`不支持的AI提供商: ${provider}`)
    }
  }

  // 调用OpenAI兼容的API（包括OpenAI、DeepSeek等）
  async callOpenAICompatibleAPI(messages) {
    const { apiKey, baseURL, model, timeout } = this.config

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: this.mindMapConfig.maxResponseLength,
        temperature: 0.7,
        stream: false
      }),
      // signal: AbortSignal.timeout(timeout) // 暂时注释掉，兼容性问题
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0]) {
      throw new Error('API返回数据格式错误')
    }

    const content = data.choices[0].message.content
    const suggestions = this.extractSuggestions(content)

    return {
      content,
      suggestions,
      usage: data.usage
    }
  }

  // 调用Anthropic API
  async callAnthropicAPI(messages) {
    // 实现Anthropic API调用逻辑
    throw new Error('Anthropic API暂未实现')
  }

  // 调用Ollama API
  async callOllamaAPI(messages) {
    const { baseURL, model, timeout } = this.config

    const response = await fetch(`${baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      }),
      // signal: AbortSignal.timeout(timeout) // 暂时注释掉，兼容性问题
    })

    if (!response.ok) {
      throw new Error(`Ollama API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.message.content
    const suggestions = this.extractSuggestions(content)

    return {
      content,
      suggestions
    }
  }

  // 从AI回复中提取建议
  extractSuggestions(content) {
    const suggestions = []

    // 简单的建议提取逻辑，可以根据需要优化
    const lines = content.split('\n')
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const text = trimmed.substring(2).trim()
        if (text.length > 0 && text.length < 50) {
          suggestions.push({
            text,
            type: 'child',
            description: '来自AI的建议'
          })
        }
      }
    })

    return suggestions.slice(0, this.mindMapConfig.suggestionCount)
  }

  // 更新对话历史
  updateConversationHistory(userMessage, aiResponse) {
    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    )

    // 限制历史记录长度
    const maxHistory = this.mindMapConfig.contextMemoryRounds * 2
    if (this.conversationHistory.length > maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-maxHistory)
    }
  }

  // 清除对话历史
  clearHistory() {
    this.conversationHistory = []
  }

  // 更新配置
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.mindMapConfig = getMindMapAIConfig()
  }
}

// 创建全局AI服务实例
export const aiService = new AIService()

// 导出便捷方法
export async function sendAIMessage(message, context = null) {
  return await aiService.sendMessage(message, context)
}

export function clearAIHistory() {
  aiService.clearHistory()
}

export function updateAIConfig(config) {
  aiService.updateConfig(config)
}
