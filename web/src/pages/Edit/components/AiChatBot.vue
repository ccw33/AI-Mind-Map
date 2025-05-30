<!-- AI聊天机器人浮窗组件 - 实现与思维导图的智能对话交互 -->
<template>
  <div
    class="ai-chatbot-container"
    :class="{
      'is-minimized': isMinimized,
      'is-dark': isDark
    }"
  >
    <!-- 聊天窗口头部 -->
    <div class="chatbot-header" @click="toggleMinimize">
      <div class="header-left">
        <span class="icon iconfont iconAIshengcheng"></span>
        <span class="title">AI助手</span>
        <span v-if="selectedNode" class="context-info">
          - {{ selectedNode.text }}
        </span>
      </div>
      <div class="header-actions">
        <el-button
          size="mini"
          type="text"
          @click.stop="clearMessages"
          :title="$t('ai.clearRecords')"
        >
          <span class="el-icon-delete"></span>
        </el-button>
        <el-button
          size="mini"
          type="text"
          @click.stop="showConfigDialog"
          :title="$t('ai.modifyAIConfiguration')"
        >
          <span class="el-icon-setting"></span>
        </el-button>
        <el-button
          size="mini"
          type="text"
          @click.stop="toggleMinimize"
          :title="isMinimized ? '展开' : '最小化'"
        >
          <span :class="isMinimized ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></span>
        </el-button>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div v-show="!isMinimized" class="chatbot-messages" ref="messagesContainer">
      <!-- 欢迎消息 -->
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-content">
          <span class="icon iconfont iconAIshengcheng"></span>
          <h3>AI思维导图助手</h3>
          <p>{{ selectedNode ? `当前选中：${selectedNode.text}` : '点击思维导图节点开始对话' }}</p>
          <div v-if="selectedNode" class="quick-actions">
            <el-button size="mini" @click="sendQuickMessage('扩展这个节点')">
              扩展节点
            </el-button>
            <el-button size="mini" @click="sendQuickMessage('解释这个概念')">
              解释概念
            </el-button>
            <el-button size="mini" @click="sendQuickMessage('相关应用场景')">
              应用场景
            </el-button>
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
          <span
            class="icon"
            :class="message.role === 'user' ? 'el-icon-user' : 'iconfont iconAIshengcheng'"
          ></span>
        </div>
        <div class="message-content">
          <div class="message-text" v-html="message.content"></div>

          <!-- AI建议按钮 -->
          <div v-if="message.role === 'assistant' && message.suggestions && message.suggestions.length > 0"
               class="suggestions">
            <div class="suggestions-title">建议添加到思维导图：</div>
            <div class="suggestions-list">
              <el-button
                v-for="suggestion in message.suggestions"
                :key="suggestion.text"
                size="mini"
                type="primary"
                plain
                @click="addSuggestionToMindMap(suggestion)"
                class="suggestion-btn"
              >
                <span class="el-icon-plus"></span>
                {{ suggestion.text }}
              </el-button>
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
          <span class="icon iconfont iconAIshengcheng loading-icon"></span>
        </div>
        <div class="message-content">
          <div class="loading-text">AI正在思考中...</div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div v-show="!isMinimized" class="chatbot-input">
      <div class="input-container">
        <textarea
          v-model="inputMessage"
          ref="messageInput"
          class="message-input"
          :placeholder="selectedNode ? `询问关于"${selectedNode.text}"的问题...` : '请先选择思维导图节点'"
          @keydown="handleKeyDown"
          :disabled="isLoading"
          rows="2"
        ></textarea>
        <div class="input-actions">
          <el-button
            size="mini"
            type="primary"
            @click="sendMessage"
            :loading="isLoading"
            :disabled="!inputMessage.trim()"
          >
            <span class="el-icon-position"></span>
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { sendAIMessage, clearAIHistory } from '@/lib/ai-service.js'
import { createUid } from 'simple-mind-map/src/utils'
// import MarkdownIt from 'markdown-it'

// let md = null

export default {
  name: 'AiChatBot',
  props: {
    selectedNode: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      messages: [],
      inputMessage: '',
      isLoading: false,
      isMinimized: false
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark
    })
  },
  watch: {
    selectedNode(newNode, oldNode) {
      if (newNode && (!oldNode || newNode.id !== oldNode.id)) {
        this.addSystemMessage(`已选中节点：${newNode.text}`)
      }
    }
  },
  mounted() {
    // this.initMarkdown()
  },
  methods: {
    initMarkdown() {
      if (!md) {
        md = new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true
        })
      }
    },

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
        // 构建上下文
        const context = this.selectedNode ? {
          selectedNode: {
            id: this.selectedNode.id,
            text: this.selectedNode.text,
            hierarchy: this.selectedNode.hierarchy || []
          }
        } : null

        // 调用AI服务
        const response = await sendAIMessage(userMessage, context)

        // 添加AI回复
        this.addMessage({
          role: 'assistant',
          content: response.content, // 暂时不使用markdown渲染
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

    // 快速发送消息
    sendQuickMessage(message) {
      this.inputMessage = message
      this.sendMessage()
    },

    // 添加消息
    addMessage(message) {
      const newMessage = {
        id: createUid(),
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
        content: `<div class="system-message">${content}</div>`
      })
    },

    // 清除消息
    clearMessages() {
      this.messages = []
      clearAIHistory()
    },

    // 显示配置对话框
    showConfigDialog() {
      this.$bus.$emit('showAiConfigDialog')
    },

    // 切换最小化状态
    toggleMinimize() {
      this.isMinimized = !this.isMinimized
    },

    // 添加建议到思维导图
    addSuggestionToMindMap(suggestion) {
      if (!this.selectedNode) {
        this.$message.warning('请先选择一个节点')
        return
      }

      // 触发添加节点事件
      this.$bus.$emit('addNodeFromAI', {
        parentNodeId: this.selectedNode.id,
        text: suggestion.text,
        type: suggestion.type || 'child'
      })

      this.$message.success(`已添加"${suggestion.text}"到思维导图`)
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
    }
  }
}
</script>

<style lang="less" scoped>
.ai-chatbot-container {
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
  transition: all 0.3s ease;

  &.is-minimized {
    max-height: 50px;

    .chatbot-header {
      border-radius: 12px;
    }
  }

  &.is-dark {
    background: #2c2c2c;
    border-color: #404040;
    color: #fff;

    .chatbot-header {
      background: #363636;
      border-color: #404040;
    }

    .chatbot-messages {
      background: #2c2c2c;
    }

    .chatbot-input {
      background: #363636;
      border-color: #404040;
    }

    .message-input {
      background: #2c2c2c;
      color: #fff;
      border-color: #404040;
    }
  }

  .chatbot-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e8e8e8;
    border-radius: 12px 12px 0 0;
    cursor: pointer;
    user-select: none;

    .header-left {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;

      .icon {
        font-size: 18px;
        color: #409eff;
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
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .chatbot-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    max-height: 400px;
    background: #fff;

    .welcome-message {
      text-align: center;
      padding: 20px;
      color: #666;

      .welcome-content {
        .icon {
          font-size: 32px;
          color: #409eff;
          margin-bottom: 12px;
        }

        h3 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 16px;
        }

        p {
          margin: 0 0 16px 0;
          font-size: 14px;
        }

        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
      }
    }

    .message-item {
      display: flex;
      margin-bottom: 16px;
      align-items: flex-start;

      &.user {
        flex-direction: row-reverse;

        .message-content {
          background: #409eff;
          color: #fff;
          margin-right: 12px;
          margin-left: 0;
        }

        .message-avatar {
          .icon {
            color: #409eff;
          }
        }
      }

      &.assistant {
        .message-content {
          background: #f5f5f5;
          color: #333;
          margin-left: 12px;
        }

        .message-avatar {
          .icon {
            color: #409eff;
          }
        }
      }

      &.system {
        justify-content: center;

        .message-content {
          background: #e8f4fd;
          color: #409eff;
          font-size: 12px;
          padding: 8px 12px;
          border-radius: 16px;
          margin: 0;
        }
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

        .icon {
          font-size: 16px;
        }
      }

      .message-content {
        max-width: 280px;
        padding: 12px 16px;
        border-radius: 12px;
        position: relative;

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;

          /deep/ p {
            margin: 0 0 8px 0;

            &:last-child {
              margin-bottom: 0;
            }
          }

          /deep/ code {
            background: rgba(0, 0, 0, 0.1);
            padding: 2px 4px;
            border-radius: 4px;
            font-size: 12px;
          }

          /deep/ pre {
            background: rgba(0, 0, 0, 0.1);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;

            code {
              background: none;
              padding: 0;
            }
          }
        }

        .suggestions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);

          .suggestions-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }

          .suggestions-list {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;

            .suggestion-btn {
              font-size: 12px;
              padding: 4px 8px;
              height: auto;
              line-height: 1.2;
            }
          }
        }

        .message-time {
          font-size: 10px;
          color: rgba(0, 0, 0, 0.4);
          margin-top: 4px;
          text-align: right;
        }
      }
    }

    .loading-message {
      display: flex;
      align-items: flex-start;

      .message-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #fff;
        border: 1px solid #e8e8e8;
        display: flex;
        align-items: center;
        justify-content: center;

        .loading-icon {
          font-size: 16px;
          color: #409eff;
          animation: spin 1s linear infinite;
        }
      }

      .message-content {
        margin-left: 12px;
        background: #f5f5f5;
        color: #666;
        padding: 12px 16px;
        border-radius: 12px;

        .loading-text {
          font-size: 14px;
        }
      }
    }
  }

  .chatbot-input {
    border-top: 1px solid #e8e8e8;
    padding: 12px 16px;
    background: #fff;
    border-radius: 0 0 12px 12px;

    .input-container {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .message-input {
        width: 100%;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 14px;
        resize: none;
        outline: none;
        transition: border-color 0.3s ease;

        &:focus {
          border-color: #409eff;
        }

        &:disabled {
          background: #f5f5f5;
          color: #999;
        }
      }

      .input-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/deep/ .system-message {
  font-size: 12px;
  color: #409eff;
  text-align: center;
}
</style>
