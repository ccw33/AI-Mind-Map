// AI服务接口 - 统一的AI调用接口，支持多种AI提供商
// 移植自ai-mind-map项目，适配Vue.js环境

import { getCurrentAIConfig, validateAIConfig, debugLog, getMindMapAIConfig, AI_PROVIDERS, buildSystemPrompt } from './ai-config.js'

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

    // 使用新的系统提示词构建逻辑
    let systemPrompt = buildSystemPrompt()

    if (context && context.selectedNode) {
      const { text, hierarchy, hierarchyWithNotes } = context.selectedNode
      systemPrompt += `\n\n当前用户选中的节点是："${text}"，位于思维导图的层级：${hierarchy.join(' > ')}。`

      // 添加节点链路的详细信息（包括备注）
      if (hierarchyWithNotes && hierarchyWithNotes.length > 0) {
        systemPrompt += `\n\n节点链路详细信息：`
        hierarchyWithNotes.forEach((nodeInfo, index) => {
          systemPrompt += `\n${index + 1}. 节点："${nodeInfo.text}"`
          if (nodeInfo.note && nodeInfo.note.trim()) {
            systemPrompt += `\n   备注：${nodeInfo.note.trim()}`
          }
        })
      }

      systemPrompt += `\n\n请基于这个节点的上下文和链路信息来回答用户的问题。`
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
    const { apiKey, baseURL, model } = this.config

    // 打印请求的prompt到控制台
    console.log('=== LLM API 请求 (Vue版本) ===');
    console.log('🔧 配置信息:', { provider: this.config.provider, model, baseURL: baseURL.replace(/\/+$/, '') });
    console.log('📝 完整请求消息:', JSON.stringify(messages, null, 2));
    console.log('🤖 系统提示词:', messages.find(m => m.role === 'system')?.content || '无');
    console.log('💬 用户消息:', messages.find(m => m.role === 'user')?.content || '无');
    console.log('==================');

    const requestBody = {
      model,
      messages,
      max_tokens: this.mindMapConfig.maxResponseLength,
      temperature: 0.7,
      stream: false
    }

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('❌ API请求失败:', response.status, response.statusText);
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0]) {
      throw new Error('API返回数据格式错误')
    }

    const content = data.choices[0].message.content
    const suggestions = this.extractSuggestions(content)

    // 检测并处理推理过程
    const reasoningResult = this.extractReasoningProcess(data, content)

    // 打印原始响应到控制台
    console.log('=== LLM API 响应 (Vue版本) ===');
    console.log('📊 完整响应数据:', JSON.stringify(data, null, 2));
    console.log('💭 原始回答内容:', content);

    // 如果是推理模型，单独显示推理过程
    if (reasoningResult.isReasoningModel) {
      console.log('🧠 推理模型检测: 是');
      if (reasoningResult.reasoning) {
        console.log('🤔 推理过程:');
        console.log('%c' + reasoningResult.reasoning, 'color: #888; font-style: italic;');
      }
      if (reasoningResult.finalAnswer) {
        console.log('✅ 最终回答:', reasoningResult.finalAnswer);
      }
    } else {
      console.log('🧠 推理模型检测: 否');
    }

    if (data.usage) {
      console.log('📈 Token使用情况:', data.usage);
    }
    console.log('💡 提取的建议:', suggestions);
    console.log('==================');

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
    const { baseURL, model } = this.config

    // 打印请求的prompt到控制台
    console.log('=== Ollama API 请求 (Vue版本) ===');
    console.log('🔧 配置信息:', { provider: this.config.provider, model, baseURL: baseURL.replace(/\/+$/, '') });
    console.log('📝 完整请求消息:', JSON.stringify(messages, null, 2));
    console.log('🤖 系统提示词:', messages.find(m => m.role === 'system')?.content || '无');
    console.log('💬 用户消息:', messages.find(m => m.role === 'user')?.content || '无');
    console.log('==================');

    const requestBody = {
      model,
      messages,
      stream: false
    }

    const response = await fetch(`${baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('❌ Ollama API请求失败:', response.status, response.statusText);
      throw new Error(`Ollama API请求失败: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.message.content
    const suggestions = this.extractSuggestions(content)

    // 检测并处理推理过程
    const reasoningResult = this.extractReasoningProcess(data, content)

    // 打印原始响应到控制台
    console.log('=== Ollama API 响应 (Vue版本) ===');
    console.log('📊 完整响应数据:', JSON.stringify(data, null, 2));
    console.log('💭 原始回答内容:', content);

    // 如果是推理模型，单独显示推理过程
    if (reasoningResult.isReasoningModel) {
      console.log('🧠 推理模型检测: 是');
      if (reasoningResult.reasoning) {
        console.log('🤔 推理过程:');
        console.log('%c' + reasoningResult.reasoning, 'color: #888; font-style: italic;');
      }
      if (reasoningResult.finalAnswer) {
        console.log('✅ 最终回答:', reasoningResult.finalAnswer);
      }
    } else {
      console.log('🧠 推理模型检测: 否');
    }

    console.log('💡 提取的建议:', suggestions);
    console.log('==================');

    return {
      content,
      suggestions
    }
  }

  // 检测并提取推理过程
  extractReasoningProcess(data, rawContent) {
    const result = {
      isReasoningModel: false,
      reasoning: null,
      finalAnswer: null
    }

    // 检测方法1: 检查模型名称是否包含推理相关关键词
    const modelName = (data.model || '').toLowerCase()
    const reasoningKeywords = ['reasoner', 'reasoning', 'think', 'cot', 'chain-of-thought']
    const isReasoningByModel = reasoningKeywords.some(keyword => modelName.includes(keyword))

    // 检测方法2: 检查响应结构是否包含推理字段（DeepSeek官方格式）
    const choice = data.choices && data.choices[0]
    const hasDeepSeekReasoningField = choice && choice.message && choice.message.reasoning_content

    // 检测方法3: 检查响应结构是否包含其他推理字段（兼容其他格式）
    const hasOtherReasoningField = choice && (choice.reasoning || choice.message?.reasoning)

    // 检测方法3: 检查内容格式是否符合推理模式
    const hasReasoningPattern = rawContent && (
      rawContent.includes('<thinking>') ||
      rawContent.includes('<reasoning>') ||
      rawContent.includes('让我思考一下') ||
      rawContent.includes('思考过程：') ||
      rawContent.includes('推理过程：') ||
      /^[\s\S]*?(?:思考|推理|分析)[\s\S]*?(?:结论|答案|回答)[\s\S]*$/i.test(rawContent)
    )

    result.isReasoningModel = isReasoningByModel || hasDeepSeekReasoningField || hasOtherReasoningField || hasReasoningPattern

    if (result.isReasoningModel) {
      // 提取推理过程
      if (choice && choice.message && choice.message.reasoning_content) {
        // 方法1: DeepSeek官方格式 - 从message.reasoning_content字段提取
        result.reasoning = choice.message.reasoning_content
        result.finalAnswer = rawContent // rawContent就是content字段的内容
      } else if (choice && choice.reasoning) {
        // 方法2: 从API响应的reasoning字段提取（其他格式）
        result.reasoning = choice.reasoning
        result.finalAnswer = rawContent
      } else if (choice && choice.message && choice.message.reasoning) {
        // 方法3: 从message.reasoning字段提取（其他格式）
        result.reasoning = choice.message.reasoning
        result.finalAnswer = rawContent
      } else if (rawContent) {
        // 方法3: 从内容中解析推理过程
        const reasoningPatterns = [
          // <thinking>标签格式
          /<thinking>([\s\S]*?)<\/thinking>/i,
          /<reasoning>([\s\S]*?)<\/reasoning>/i,
          // 中文格式
          /(?:思考过程：|推理过程：|让我思考一下[：:]?)([\s\S]*?)(?:结论：|答案：|回答：|最终答案：)/i,
          // 分段格式
          /^([\s\S]*?)(?:\n\n|^)(?:结论|答案|回答|最终答案)[：:]?([\s\S]*)$/i
        ]

        for (const pattern of reasoningPatterns) {
          const match = rawContent.match(pattern)
          if (match) {
            if (pattern.source.includes('thinking') || pattern.source.includes('reasoning')) {
              result.reasoning = match[1].trim()
              result.finalAnswer = rawContent.replace(match[0], '').trim()
            } else if (pattern.source.includes('思考过程') || pattern.source.includes('推理过程')) {
              result.reasoning = match[1].trim()
              const finalMatch = rawContent.match(/(?:结论：|答案：|回答：|最终答案：)([\s\S]*)$/i)
              result.finalAnswer = finalMatch ? finalMatch[1].trim() : rawContent
            } else {
              result.reasoning = match[1].trim()
              result.finalAnswer = match[2] ? match[2].trim() : rawContent
            }
            break
          }
        }

        // 如果没有找到明确的分隔，但检测到是推理模型，尝试智能分割
        if (!result.reasoning && result.isReasoningModel) {
          const lines = rawContent.split('\n')
          const thinkingLines = []
          const answerLines = []
          let isInAnswer = false

          for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.match(/^(?:结论|答案|回答|最终答案|总结)[：:]?/i)) {
              isInAnswer = true
            }

            if (isInAnswer) {
              answerLines.push(line)
            } else {
              thinkingLines.push(line)
            }
          }

          if (thinkingLines.length > 0 && answerLines.length > 0) {
            result.reasoning = thinkingLines.join('\n').trim()
            result.finalAnswer = answerLines.join('\n').trim()
          }
        }
      }
    }

    return result
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
