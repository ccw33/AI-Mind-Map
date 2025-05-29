'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Plus, Minimize2, Maximize2 } from 'lucide-react'

// 消息类型
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  nodeContext?: {
    nodeId: string
    text: string
    hierarchy: string[]
  }
  suggestions?: NodeSuggestion[]
}

// 节点建议类型
export interface NodeSuggestion {
  text: string
  type: 'child' | 'sibling'
  description?: string
}

// 选中节点上下文
export interface SelectedNodeContext {
  id: string
  text: string
  hierarchy: string[]
  data: any
}

// 聊天组件属性
interface ChatBotProps {
  selectedNode?: SelectedNodeContext
  onAddNode?: (suggestion: NodeSuggestion, nodeId?: string) => void
  className?: string
}

// AI聊天机器人组件 - 实现与思维导图的智能对话交互
export default function ChatBot({ selectedNode, onAddNode, className = '' }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 客户端初始化消息，避免 hydration 不匹配
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: '你好！我是AI思维导图助手。选择一个节点，我可以帮你扩展想法、提供建议或回答相关问题。',
          timestamp: new Date()
        }
      ])
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 调用真实的AI API
  const callAIService = async (userMessage: string, context?: SelectedNodeContext): Promise<ChatMessage> => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context ? {
            selectedNode: {
              id: context.id,
              text: context.text,
              hierarchy: context.hierarchy
            },
            conversationHistory: messages.slice(-10) // 发送最近10条消息作为上下文
          } : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'AI服务返回错误')
      }

      const aiResponse = result.data

      // 解析AI回复中的建议（如果有的话）
      let suggestions: NodeSuggestion[] = []
      if (aiResponse.suggestions) {
        suggestions = aiResponse.suggestions
      } else if (userMessage.includes('扩展') || userMessage.includes('建议') || userMessage.includes('添加')) {
        // 如果用户询问扩展建议但AI没有返回结构化建议，尝试生成一些默认建议
        if (context) {
          suggestions = [
            {
              text: `${context.text}的详细说明`,
              type: 'child',
              description: '添加更详细的解释'
            },
            {
              text: `${context.text}的应用场景`,
              type: 'child',
              description: '说明具体应用'
            },
            {
              text: `相关概念`,
              type: 'sibling',
              description: '添加相关的概念'
            }
          ]
        }
      }

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        nodeContext: context ? {
          nodeId: context.id,
          text: context.text,
          hierarchy: context.hierarchy
        } : undefined,
        suggestions
      }

    } catch (error) {
      console.error('AI服务调用失败:', error)

      // 如果AI服务失败，回退到模拟回复
      return simulateAIResponse(userMessage, context)
    }
  }

  // 模拟AI回复（作为备用方案）
  const simulateAIResponse = async (userMessage: string, context?: SelectedNodeContext): Promise<ChatMessage> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    let content = ''
    let suggestions: NodeSuggestion[] = []

    if (context) {
      const nodeText = context.text
      const hierarchy = context.hierarchy.join(' > ')

      if (userMessage.includes('扩展') || userMessage.includes('展开') || userMessage.includes('子节点')) {
        content = `基于"${nodeText}"节点，我建议添加以下子节点：`
        suggestions = [
          { text: `${nodeText}的定义`, type: 'child', description: '添加定义说明' },
          { text: `${nodeText}的特点`, type: 'child', description: '列举主要特征' },
          { text: `${nodeText}的应用`, type: 'child', description: '实际应用场景' }
        ]
      } else {
        content = `关于"${nodeText}"（位置：${hierarchy}），${generateContextualResponse(userMessage, nodeText)}`
      }
    } else {
      content = generateGeneralResponse(userMessage)
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      nodeContext: context ? {
        nodeId: context.id,
        text: context.text,
        hierarchy: context.hierarchy
      } : undefined,
      suggestions
    }
  }

  // 生成基于上下文的回复
  const generateContextualResponse = (message: string, nodeText: string): string => {
    const responses = [
      `这是一个很好的问题。${nodeText}确实是一个重要的概念，让我为你详细分析一下...`,
      `从${nodeText}的角度来看，${message}涉及到几个关键方面...`,
      `关于${nodeText}，我建议从以下几个维度来思考...`,
      `${nodeText}的相关内容很丰富，我来帮你梳理一下思路...`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 生成通用回复
  const generateGeneralResponse = (message: string): string => {
    const responses = [
      '我理解你的问题。建议你先选择一个思维导图节点，这样我能提供更精准的帮助。',
      '这是个有趣的话题！如果你能选择相关的思维导图节点，我可以给出更具体的建议。',
      '让我来帮你分析这个问题。选择一个相关节点会让我的回答更有针对性。',
      '好问题！结合思维导图的具体节点，我能为你提供更详细的解答。'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      nodeContext: selectedNode ? {
        nodeId: selectedNode.id,
        text: selectedNode.text,
        hierarchy: selectedNode.hierarchy
      } : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const aiResponse = await callAIService(userMessage.content, selectedNode)
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('AI回复失败:', error)
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '抱歉，我现在无法回复。请稍后再试。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 添加建议节点到思维导图
  const handleAddSuggestion = (suggestion: NodeSuggestion) => {
    if (onAddNode && selectedNode) {
      onAddNode(suggestion, selectedNode.id)
    }
  }

  if (isMinimized) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col ${className}`}>
      {/* 头部 - 更现代的设计 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-800">AI助手</span>
            <div className="text-xs text-gray-500">智能思维导图助手</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 选中节点显示 - 更精致的样式 */}
      {selectedNode && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">当前选中节点</span>
          </div>
          <div className="text-blue-700 font-medium mb-1">{selectedNode.text}</div>
          <div className="text-blue-500 text-xs flex items-center gap-1">
            <span>路径:</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded-full">
              {selectedNode.hierarchy.join(' › ')}
            </span>
          </div>
        </div>
      )}

      {/* 消息列表 - chatbot-ui风格 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* 头像 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-600'
                  : 'bg-white border-2 border-gray-200'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>

              {/* 消息内容 */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                <div className="text-sm leading-relaxed">{message.content}</div>

                {/* 建议按钮 */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium text-gray-500 mb-2">💡 AI建议</div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleAddSuggestion(suggestion)}
                        className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 rounded-lg p-3 transition-colors border border-blue-200"
                      >
                        <div className="font-medium text-blue-800">{suggestion.text}</div>
                        <div className="text-blue-600 mt-1">
                          {suggestion.type === 'child' ? '📎 添加为子节点' : '🔗 添加为同级节点'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 时间戳 */}
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 - chatbot-ui风格 */}
      <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedNode ? `询问关于"${selectedNode.text}"的问题...` : "选择一个节点开始对话..."}
              className="w-full resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* 输入提示 */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>按 Enter 发送，Shift + Enter 换行</span>
          {selectedNode && (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              已选中节点
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// 导出类型
export type { ChatBotProps, ChatMessage, NodeSuggestion, SelectedNodeContext }
