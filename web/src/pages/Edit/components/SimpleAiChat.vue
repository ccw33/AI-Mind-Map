<!-- 简化版AI聊天浮窗 - 避免复杂依赖，先实现基础功能 -->
<template>
  <div class="simple-ai-chat" v-if="visible">
    <!-- 聊天窗口头部 -->
    <div class="chat-header" @click="toggleMinimize">
      <div class="header-left">
        <span class="ai-icon">🤖</span>
        <span class="title">AI助手</span>
        <span v-if="selectedNodeText" class="context-info">
          - {{ selectedNodeText }}
        </span>
      </div>
      <div class="header-actions">
        <button @click.stop="clearMessages" title="清除记录">🗑️</button>
        <button @click.stop="showConfig" title="设置">⚙️</button>
        <button @click.stop="toggleMinimize" :title="isMinimized ? '展开' : '最小化'">
          {{ isMinimized ? '⬆️' : '⬇️' }}
        </button>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div v-show="!isMinimized" class="chat-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-content">
          <span class="ai-icon">🤖</span>
          <h3>AI思维导图助手</h3>
          <p>{{ selectedNodeText ? `当前选中：${selectedNodeText}` : '点击思维导图节点开始对话' }}</p>
          <div v-if="selectedNodeText" class="quick-actions">
            <button @click="sendQuickMessage('扩展这个节点')">扩展节点</button>
            <button @click="sendQuickMessage('解释这个概念')">解释概念</button>
            <button @click="sendQuickMessage('相关应用场景')">应用场景</button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-item"
        :class="message.role"
      >
        <div class="message-avatar">
          <span>{{ message.role === 'user' ? '👤' : '🤖' }}</span>
        </div>
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>

          <!-- AI建议按钮 -->
          <div v-if="message.role === 'assistant' && message.suggestions && message.suggestions.length > 0"
               class="suggestions">
            <div class="suggestions-title">建议添加到思维导图：</div>
            <div class="suggestions-list">
              <button
                v-for="suggestion in message.suggestions"
                :key="suggestion.text"
                @click="addSuggestionToMindMap(suggestion)"
                class="suggestion-btn"
              >
                ➕ {{ suggestion.text }}
              </button>
            </div>
          </div>

          <!-- 消息时间 -->
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- 加载指示器 -->
      <div v-if="isLoading" class="loading-message">
        <div class="message-avatar">
          <span class="loading-icon">🤖</span>
        </div>
        <div class="message-content">
          <div class="loading-text">AI正在思考中...</div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div v-show="!isMinimized" class="chat-input">
      <div class="input-container">
        <textarea
          v-model="inputMessage"
          ref="messageInput"
          class="message-input"
          :placeholder="selectedNodeText ? `询问关于"${selectedNodeText}"的问题...` : '请先选择思维导图节点'"
          @keydown="handleKeyDown"
          :disabled="isLoading"
          rows="2"
        ></textarea>
        <div class="input-actions">
          <button
            @click="sendMessage"
            :disabled="!inputMessage.trim() || isLoading"
            class="send-btn"
          >
            {{ isLoading ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <div v-if="showConfigPanel" class="config-panel">
      <div class="config-header">
        <h4>AI配置</h4>
        <button @click="showConfigPanel = false">❌</button>
      </div>
      <div class="config-content">
        <div class="config-item">
          <label>AI提供商:</label>
          <select v-model="aiConfig.provider">
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="ollama">Ollama</option>
          </select>
        </div>
        <div class="config-item">
          <label>API Key:</label>
          <input v-model="aiConfig.apiKey" type="password" placeholder="请输入API Key">
        </div>
        <div class="config-item">
          <label>模型:</label>
          <input v-model="aiConfig.model" placeholder="gpt-3.5-turbo">
        </div>
        <div class="config-actions">
          <button @click="saveConfig">保存配置</button>
          <button @click="testConnection">测试连接</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleAiChat',
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    selectedNodeText: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      messages: [],
      inputMessage: '',
      isLoading: false,
      isMinimized: false,
      showConfigPanel: false,
      aiConfig: {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo',
        baseURL: 'https://api.openai.com/v1'
      }
    }
  },
  watch: {
    selectedNodeText(newText, oldText) {
      if (newText && newText !== oldText) {
        this.addSystemMessage(`已选中节点：${newText}`)
      }
    }
  },
  mounted() {
    this.loadConfig()
  },
  methods: {
    // 发送消息
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return

      const userMessage = this.inputMessage.trim()
      this.inputMessage = ''

      // 添加用户消息
      this.addMessage({
        role: 'user',
        content: userMessage
      })

      this.isLoading = true

      try {
        // 模拟AI回复（实际项目中这里会调用真实的AI API）
        const response = await this.callAI(userMessage)

        // 添加AI回复
        this.addMessage({
          role: 'assistant',
          content: response.content,
          suggestions: response.suggestions || []
        })

      } catch (error) {
        console.error('AI回复失败:', error)
        this.addMessage({
          role: 'assistant',
          content: '抱歉，我现在无法回复。请检查AI配置或稍后再试。'
        })
      } finally {
        this.isLoading = false
      }
    },

    // 模拟AI调用（简化版本）
    async callAI(message) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 简单的模拟回复逻辑
      let content = ''
      let suggestions = []

      if (message.includes('扩展')) {
        content = `关于"${this.selectedNodeText}"的扩展建议：\n\n这是一个很好的主题，可以从多个角度来扩展。`
        suggestions = [
          { text: '定义和概念', type: 'child' },
          { text: '应用场景', type: 'child' },
          { text: '相关技术', type: 'child' }
        ]
      } else if (message.includes('解释')) {
        content = `"${this.selectedNodeText}"的解释：\n\n这是一个重要的概念，让我为您详细解释。`
        suggestions = [
          { text: '核心特点', type: 'child' },
          { text: '工作原理', type: 'child' }
        ]
      } else {
        content = `关于"${this.selectedNodeText}"，我理解您的问题。这是一个很有趣的话题。`
        suggestions = [
          { text: '深入了解', type: 'child' },
          { text: '实践应用', type: 'child' }
        ]
      }

      return { content, suggestions }
    },

    // 快速发送消息
    sendQuickMessage(message) {
      this.inputMessage = message
      this.sendMessage()
    },

    // 添加消息
    addMessage(message) {
      const newMessage = {
        id: Date.now() + Math.random(),
        timestamp: new Date(),
        ...message
      }
      this.messages.push(newMessage)
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },

    // 添加系统消息
    addSystemMessage(content) {
      this.addMessage({
        role: 'system',
        content: content
      })
    },

    // 清除消息
    clearMessages() {
      this.messages = []
    },

    // 显示配置
    showConfig() {
      this.showConfigPanel = true
    },

    // 切换最小化状态
    toggleMinimize() {
      this.isMinimized = !this.isMinimized
    },

    // 添加建议到思维导图
    addSuggestionToMindMap(suggestion) {
      // 触发事件，让父组件处理
      this.$emit('add-suggestion', {
        text: suggestion.text,
        type: suggestion.type || 'child'
      })

      // 简单的成功提示
      alert(`已添加"${suggestion.text}"到思维导图`)
    },

    // 处理键盘事件
    handleKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    },

    // 滚动到底部
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    // 格式化时间
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 加载配置
    loadConfig() {
      try {
        const saved = localStorage.getItem('simple_ai_config')
        if (saved) {
          this.aiConfig = { ...this.aiConfig, ...JSON.parse(saved) }
        }
      } catch (error) {
        console.error('加载配置失败:', error)
      }
    },

    // 保存配置
    saveConfig() {
      try {
        localStorage.setItem('simple_ai_config', JSON.stringify(this.aiConfig))
        alert('配置保存成功')
        this.showConfigPanel = false
      } catch (error) {
        console.error('保存配置失败:', error)
        alert('保存配置失败')
      }
    },

    // 测试连接
    async testConnection() {
      alert('连接测试功能待实现')
    }
  }
}
</script>

<style scoped>
.simple-ai-chat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 380px;
  max-height: 600px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.ai-icon {
  font-size: 18px;
  margin-right: 8px;
}

.title {
  font-weight: 600;
  color: #333;
  margin-right: 8px;
}

.context-info {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
}

.header-actions button:hover {
  background: rgba(0, 0, 0, 0.1);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  max-height: 400px;
  background: #fff;
}

.welcome-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.welcome-content .ai-icon {
  font-size: 32px;
  margin-bottom: 12px;
  display: block;
}

.welcome-content h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.welcome-content p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.quick-actions button {
  padding: 6px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
}

.quick-actions button:hover {
  background: #337ecc;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-item.user .message-content {
  background: #409eff;
  color: #fff;
  margin-right: 12px;
  margin-left: 0;
}

.message-item.assistant .message-content {
  background: #f5f5f5;
  color: #333;
  margin-left: 12px;
}

.message-item.system {
  justify-content: center;
}

.message-item.system .message-content {
  background: #e8f4fd;
  color: #409eff;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 16px;
  margin: 0;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.message-content {
  max-width: 280px;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.suggestions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.suggestions-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.suggestion-btn {
  font-size: 12px;
  padding: 4px 8px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}

.suggestion-btn:hover {
  background: #337ecc;
}

.message-time {
  font-size: 10px;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 4px;
  text-align: right;
}

.loading-message {
  display: flex;
  align-items: flex-start;
}

.loading-message .message-avatar {
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-message .message-content {
  margin-left: 12px;
  background: #f5f5f5;
  color: #666;
  padding: 12px 16px;
  border-radius: 12px;
}

.loading-text {
  font-size: 14px;
}

.chat-input {
  border-top: 1px solid #e8e8e8;
  padding: 12px 16px;
  background: #fff;
  border-radius: 0 0 12px 12px;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-input {
  width: 100%;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  font-family: inherit;
}

.message-input:focus {
  border-color: #409eff;
}

.message-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
}

.send-btn {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.send-btn:hover:not(:disabled) {
  background: #337ecc;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.config-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border-radius: 12px;
  z-index: 10;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.config-header h4 {
  margin: 0;
  color: #333;
}

.config-header button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.config-content {
  padding: 16px;
}

.config-item {
  margin-bottom: 16px;
}

.config-item label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #333;
}

.config-item input,
.config-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 14px;
}

.config-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.config-actions button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.config-actions button:first-child {
  background: #409eff;
  color: white;
}

.config-actions button:last-child {
  background: #f5f5f5;
  color: #333;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
