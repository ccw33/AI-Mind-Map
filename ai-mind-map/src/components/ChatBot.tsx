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

  // 模拟AI回复 - 实际项目中这里会调用真实的AI API
  const simulateAIResponse = async (userMessage: string, context?: SelectedNodeContext): Promise<ChatMessage> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    let content = ''
    let suggestions: NodeSuggestion[] = []

    if (context) {
      // 基于选中节点生成回复
      const nodeText = context.text
      const hierarchy = context.hierarchy.join(' > ')

      if (userMessage.includes('扩展') || userMessage.includes('展开') || userMessage.includes('子节点')) {
        content = `基于"${nodeText}"节点，我建议添加以下子节点：`
        suggestions = [
          { text: `${nodeText}的定义`, type: 'child', description: '添加定义说明' },
          { text: `${nodeText}的特点`, type: 'child', description: '列举主要特征' },
          { text: `${nodeText}的应用`, type: 'child', description: '实际应用场景' },
          { text: `${nodeText}的优势`, type: 'child', description: '优点分析' }
        ]
      } else if (userMessage.includes('同级') || userMessage.includes('并列') || userMessage.includes('兄弟节点')) {
        content = `与"${nodeText}"同级的节点建议：`
        suggestions = [
          { text: `相关概念A`, type: 'sibling', description: '同级相关概念' },
          { text: `相关概念B`, type: 'sibling', description: '同级相关概念' },
          { text: `对比项`, type: 'sibling', description: '用于对比分析' }
        ]
      } else {
        content = `关于"${nodeText}"（位置：${hierarchy}），${generateContextualResponse(userMessage, nodeText)}`
      }
    } else {
      // 没有选中节点时的通用回复
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
      const aiResponse = await simulateAIResponse(userMessage.content, selectedNode)
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
    <div className={`fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl border flex flex-col ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI助手</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 选中节点显示 */}
      {selectedNode && (
        <div className="p-3 bg-blue-50 border-b text-sm">
          <div className="text-blue-800 font-medium">当前选中节点:</div>
          <div className="text-blue-600">{selectedNode.text}</div>
          <div className="text-blue-500 text-xs">
            {selectedNode.hierarchy.join(' > ')}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && <Bot className="w-4 h-4 mt-0.5 text-blue-600" />}
                {message.role === 'user' && <User className="w-4 h-4 mt-0.5" />}
                <div className="flex-1">
                  <div className="text-sm">{message.content}</div>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-medium text-gray-600">建议添加:</div>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleAddSuggestion(suggestion)}
                          className="flex items-center gap-2 w-full text-left p-2 bg-white border rounded hover:bg-gray-50 transition-colors text-xs"
                        >
                          <Plus className="w-3 h-3 text-green-600" />
                          <div>
                            <div className="font-medium text-gray-800">{suggestion.text}</div>
                            {suggestion.description && (
                              <div className="text-gray-500">{suggestion.description}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <div className="text-sm text-gray-600">AI正在思考...</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={selectedNode ? `询问关于"${selectedNode.text}"的问题...` : "选择一个节点开始对话..."}
            className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 导出类型
export type { ChatBotProps, ChatMessage, NodeSuggestion, SelectedNodeContext }
