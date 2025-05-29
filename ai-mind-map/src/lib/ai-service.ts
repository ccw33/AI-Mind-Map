// AI服务接口 - 统一的AI调用接口，支持多种AI提供商

import { getCurrentAIConfig, validateAIConfig, debugLog, mindMapAIConfig } from './ai-config'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface NodeSuggestion {
  text: string
  type: 'child' | 'sibling'
  description?: string
}

// 结构化分点接口
export interface StructuredPoint {
  id: string
  title: string // 关键词标题
  content: string // 详细内容
  keywords: string[] // 提取的关键词
}

export interface AIResponse {
  content: string
  suggestions?: NodeSuggestion[]
  structuredPoints?: StructuredPoint[] // 结构化分点
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface MindMapContext {
  selectedNode?: {
    id: string
    text: string
    hierarchy: string[]
  }
  conversationHistory?: ChatMessage[]
}

// AI服务类
export class AIService {
  private config = getCurrentAIConfig()
  private conversationHistory: ChatMessage[] = []

  constructor() {
    if (!validateAIConfig(this.config)) {
      console.warn('AI配置不完整，某些功能可能无法正常工作')
    }
  }

  // 发送聊天消息
  async sendMessage(
    message: string,
    context?: MindMapContext
  ): Promise<AIResponse> {
    try {
      debugLog('发送AI消息', { message, context, config: this.config })

      // 构建消息历史
      const messages = this.buildMessages(message, context)

      // 根据提供商调用相应的API
      const response = await this.callAI(messages)

      // 更新对话历史
      if (mindMapAIConfig.enableContextMemory) {
        this.updateConversationHistory(message, response.content)
      }

      debugLog('AI响应', response)
      return response

    } catch (error) {
      console.error('AI服务调用失败:', error)
      throw new Error('AI服务暂时不可用，请稍后重试')
    }
  }

  // 构建消息数组
  private buildMessages(message: string, context?: MindMapContext): ChatMessage[] {
    const messages: ChatMessage[] = []

    // 系统提示词
    messages.push({
      role: 'system',
      content: this.getSystemPrompt(context)
    })

    // 添加对话历史（如果启用）
    if (mindMapAIConfig.enableContextMemory && context?.conversationHistory) {
      const recentHistory = context.conversationHistory.slice(-mindMapAIConfig.contextMemoryRounds * 2)
      messages.push(...recentHistory)
    }

    // 当前用户消息
    messages.push({
      role: 'user',
      content: message
    })

    return messages
  }

  // 获取系统提示词
  private getSystemPrompt(context?: MindMapContext): string {
    const jsonExample = '```json\n{\n  "structuredPoints": [\n    {\n      "id": "point_1",\n      "title": "关键词标题",\n      "content": "详细解释内容",\n      "keywords": ["关键词1", "关键词2"]\n    }\n  ]\n}\n```'

    let prompt = `你是一个专业的思维导图AI助手。你的任务是帮助用户扩展和完善思维导图。

核心能力：
1. 分析思维导图节点内容
2. 提供相关的子节点和同级节点建议
3. 回答与节点内容相关的问题
4. 帮助用户理清思路和逻辑关系

回复要求：
- 首先提供一个简洁的总体回答（100-200字）
- 然后提供结构化的分点供用户选择添加到思维导图
- 保持逻辑性和条理性
- 回复长度控制在${mindMapAIConfig.maxResponseLength}字符以内

重要：请按以下格式回复：
1. 先给出一个简洁的总体回答
2. 然后在回答的最后，用以下JSON格式提供结构化分点：
${jsonExample}

每个分点应该：
- 有一个简洁的关键词标题（3-8个字）
- 包含详细的解释内容
- 可以作为思维导图的节点添加
- 具有实际价值，帮助用户扩展思维导图`

    if (context?.selectedNode) {
      prompt += `

当前选中节点信息：
- 节点内容: "${context.selectedNode.text}"
- 节点路径: ${context.selectedNode.hierarchy.join(' > ')}

请基于这个节点的内容和位置来回答用户的问题。`
    }

    return prompt
  }

  // 调用AI API
  private async callAI(messages: ChatMessage[]): Promise<AIResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAI(messages)
      case 'azure':
        return this.callAzureOpenAI(messages)
      case 'anthropic':
        return this.callAnthropic(messages)
      case 'google':
        return this.callGoogle(messages)
      case 'deepseek':
        return this.callDeepSeek(messages)
      case 'ollama':
        return this.callOllama(messages)
      default:
        throw new Error(`不支持的AI提供商: ${this.config.provider}`)
    }
  }

  // OpenAI API调用
  private async callOpenAI(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const rawContent = data.choices[0].message.content

    return {
      content: this.cleanResponseContent(rawContent),
      structuredPoints: this.parseStructuredPoints(rawContent),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    }
  }

  // Azure OpenAI API调用
  private async callAzureOpenAI(messages: ChatMessage[]): Promise<AIResponse> {
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview'
    const url = `${this.config.baseURL}/openai/deployments/${this.config.model}/chat/completions?api-version=${apiVersion}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.config.apiKey!
      },
      body: JSON.stringify({
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`Azure OpenAI API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    }
  }

  // Anthropic API调用
  private async callAnthropic(messages: ChatMessage[]): Promise<AIResponse> {
    // 转换消息格式（Anthropic格式略有不同）
    const systemMessage = messages.find(m => m.role === 'system')
    const conversationMessages = messages.filter(m => m.role !== 'system')

    const response = await fetch(`${this.config.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 1000,
        system: systemMessage?.content,
        messages: conversationMessages
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.content[0].text,
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      } : undefined
    }
  }

  // Google AI API调用
  private async callGoogle(messages: ChatMessage[]): Promise<AIResponse> {
    // Google AI的消息格式转换
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))

    const response = await fetch(
      `${this.config.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Google AI API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.candidates[0].content.parts[0].text
    }
  }

  // DeepSeek API调用
  private async callDeepSeek(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // DeepSeek R1 推理模型会返回 reasoning_content 和 content
    // V3 模型只返回 content
    const rawContent = data.choices[0].message.content
    const reasoningContent = data.choices[0].message.reasoning_content

    // 如果是推理模型(deepseek-reasoner)，可以在调试模式下显示思维链
    if (reasoningContent && this.config.debugMode) {
      console.log('DeepSeek 思维链:', reasoningContent)
    }

    return {
      content: this.cleanResponseContent(rawContent),
      structuredPoints: this.parseStructuredPoints(rawContent),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined
    }
  }

  // Ollama API调用
  private async callOllama(messages: ChatMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.config.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama API错误: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return {
      content: data.message.content
    }
  }

  // 解析AI回复中的结构化分点
  private parseStructuredPoints(content: string): StructuredPoint[] {
    try {
      // 查找JSON代码块
      const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/)
      if (!jsonMatch) {
        return []
      }

      const jsonData = JSON.parse(jsonMatch[1])
      if (jsonData.structuredPoints && Array.isArray(jsonData.structuredPoints)) {
        return jsonData.structuredPoints.map((point: any, index: number) => ({
          id: point.id || `point_${index + 1}`,
          title: point.title || `要点${index + 1}`,
          content: point.content || '',
          keywords: Array.isArray(point.keywords) ? point.keywords : []
        }))
      }
    } catch (error) {
      debugLog('解析结构化分点失败', error)
    }
    return []
  }

  // 清理回复内容（移除JSON代码块）
  private cleanResponseContent(content: string): string {
    return content.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim()
  }

  // 更新对话历史
  private updateConversationHistory(userMessage: string, aiResponse: string) {
    this.conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: aiResponse }
    )

    // 限制历史记录长度
    const maxHistory = mindMapAIConfig.contextMemoryRounds * 2
    if (this.conversationHistory.length > maxHistory) {
      this.conversationHistory = this.conversationHistory.slice(-maxHistory)
    }
  }

  // 清除对话历史
  clearHistory() {
    this.conversationHistory = []
  }

  // 获取对话历史
  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }
}

// 导出单例实例
export const aiService = new AIService()
