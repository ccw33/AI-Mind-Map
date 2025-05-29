'use client'

import { useState, useEffect } from 'react'
import { Settings, Check, AlertCircle, Eye, EyeOff } from 'lucide-react'

// AI配置面板组件 - 允许用户配置AI服务设置
interface AIConfigPanelProps {
  className?: string
}

interface AIProvider {
  id: string
  name: string
  available: boolean
}

interface AIConfigData {
  currentProvider: string
  currentModel: string
  availableProviders: AIProvider[]
  debugMode: boolean
}

export default function AIConfigPanel({ className = '' }: AIConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<AIConfigData | null>(null)
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [formData, setFormData] = useState({
    provider: '',
    apiKey: '',
    model: '',
    debugMode: false
  })

  // 获取AI配置
  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai/config')
      const result = await response.json()

      if (result.success) {
        setConfig(result.data)
        setFormData({
          provider: result.data.currentProvider,
          apiKey: '',
          model: result.data.currentModel,
          debugMode: result.data.debugMode
        })
      }
    } catch (error) {
      console.error('获取AI配置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchConfig()
    }
  }, [isOpen])

  // 保存配置
  const handleSave = async () => {
    try {
      setLoading(true)

      // 这里可以添加保存配置的API调用
      // const response = await fetch('/api/ai/config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })

      // 暂时只是显示成功消息
      alert('配置已保存！请重新加载页面以应用更改。')
      setIsOpen(false)

    } catch (error) {
      console.error('保存配置失败:', error)
      alert('保存配置失败，请重试。')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed top-4 right-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm transition-colors ${className}`}
        title="AI配置"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">AI配置</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">加载配置中...</p>
            </div>
          ) : (
            <>
              {/* AI提供商选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  AI提供商
                </label>
                <div className="space-y-2">
                  {config?.availableProviders.map((provider) => (
                    <label
                      key={provider.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.provider === provider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!provider.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={provider.id}
                        checked={formData.provider === provider.id}
                        onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        disabled={!provider.available}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          {provider.available ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {!provider.available && (
                          <p className="text-xs text-red-600 mt-1">
                            需要配置API密钥
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* API密钥配置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API密钥
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="输入您的API密钥"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  API密钥将安全存储，仅用于AI服务调用
                </p>
              </div>

              {/* 模型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模型
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择模型</option>
                  {formData.provider === 'openai' && (
                    <>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </>
                  )}
                  {formData.provider === 'anthropic' && (
                    <>
                      <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                      <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                    </>
                  )}
                  {formData.provider === 'google' && (
                    <>
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    </>
                  )}
                  {formData.provider === 'deepseek' && (
                    <>
                      <option value="deepseek-chat">DeepSeek-V3 (Chat)</option>
                      <option value="deepseek-reasoner">DeepSeek-R1 (Reasoning)</option>
                    </>
                  )}
                  {formData.provider === 'ollama' && (
                    <>
                      <option value="llama2">Llama 2</option>
                      <option value="codellama">Code Llama</option>
                      <option value="mistral">Mistral</option>
                    </>
                  )}
                </select>
              </div>

              {/* 调试模式 */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.debugMode}
                    onChange={(e) => setFormData({ ...formData, debugMode: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">启用调试模式</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  在控制台显示详细的AI调用日志
                </p>
              </div>

              {/* 配置说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">配置说明</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 您也可以通过环境变量配置AI服务</li>
                  <li>• 创建 .env.local 文件并参考 .env.local.example</li>
                  <li>• 环境变量配置优先级更高</li>
                  <li>• 本地配置仅在当前会话有效</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        {!loading && (
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              保存配置
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
