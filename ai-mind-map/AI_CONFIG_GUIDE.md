# AI思维导图 - LLM配置指南

本指南将帮助您配置AI思维导图应用的大语言模型(LLM)服务。

## 🚀 快速开始

### 1. 复制环境变量文件
```bash
cp .env.local.example .env.local
```

### 2. 选择AI提供商并配置

#### 选项A: OpenAI (推荐)
```bash
# 在 .env.local 中配置
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
DEFAULT_AI_PROVIDER=openai
```

#### 选项B: Azure OpenAI
```bash
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
DEFAULT_AI_PROVIDER=azure
```

#### 选项C: Anthropic Claude
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_DEFAULT_MODEL=claude-3-sonnet-20240229
DEFAULT_AI_PROVIDER=anthropic
```

#### 选项D: Google Gemini
```bash
GOOGLE_AI_API_KEY=your-google-ai-api-key
GOOGLE_DEFAULT_MODEL=gemini-pro
DEFAULT_AI_PROVIDER=google
```

#### 选项E: DeepSeek (V3/R1)
```bash
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_DEFAULT_MODEL=deepseek-chat
DEFAULT_AI_PROVIDER=deepseek
```

#### 选项F: 本地Ollama
```bash
OLLAMA_API_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama2
DEFAULT_AI_PROVIDER=ollama
```

### 3. 重启开发服务器
```bash
npm run dev
```

## 📋 详细配置说明

### OpenAI配置
1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 创建新的API密钥
3. 将密钥添加到 `.env.local` 文件

**支持的模型:**
- `gpt-3.5-turbo` (推荐，性价比高)
- `gpt-4` (更强大，成本更高)
- `gpt-4-turbo` (最新版本)

### Azure OpenAI配置
1. 在Azure门户创建OpenAI资源
2. 部署模型(如GPT-3.5或GPT-4)
3. 获取API密钥和端点URL
4. 配置部署名称

### Anthropic Claude配置
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建API密钥
3. 选择合适的Claude模型

**支持的模型:**
- `claude-3-haiku-20240307` (快速，低成本)
- `claude-3-sonnet-20240229` (平衡性能)
- `claude-3-opus-20240229` (最强性能)

### Google Gemini配置
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建API密钥
3. 启用Gemini API

### DeepSeek配置
1. 访问 [DeepSeek Platform](https://platform.deepseek.com/api_keys)
2. 注册账户并创建API密钥
3. 选择合适的模型

**支持的模型:**
- `deepseek-chat` (DeepSeek-V3，通用对话模型)
- `deepseek-reasoner` (DeepSeek-R1，推理模型，具有思维链功能)

**特色功能:**
- **DeepSeek-V3**: 高性能通用对话模型，支持64K上下文
- **DeepSeek-R1**: 推理模型，会先输出思维链再给出最终答案
- **错峰优惠**: 北京时间00:30-08:30享受优惠价格
- **上下文缓存**: 支持硬盘缓存，降低重复内容成本

### 本地Ollama配置
1. 安装Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`
2. 下载模型: `ollama pull llama2`
3. 启动服务: `ollama serve`

**推荐模型:**
- `llama2` (通用对话)
- `codellama` (代码相关)
- `mistral` (多语言支持)

## ⚙️ 高级配置

### 性能调优
```bash
# 请求超时时间(毫秒)
AI_REQUEST_TIMEOUT=30000

# 最大重试次数
AI_MAX_RETRIES=3

# 节点建议数量
AI_SUGGESTION_COUNT=3

# AI回复最大长度
AI_MAX_RESPONSE_LENGTH=1000
```

### 上下文记忆
```bash
# 启用对话历史记忆
AI_ENABLE_CONTEXT_MEMORY=true

# 记忆轮数
AI_CONTEXT_MEMORY_ROUNDS=5
```

### 调试模式
```bash
# 启用详细日志
AI_DEBUG_MODE=true
```

## 🔧 界面配置

应用提供了图形化配置界面：

1. 点击右上角的设置图标
2. 选择AI提供商
3. 输入API密钥
4. 选择模型
5. 保存配置

**注意:** 界面配置仅在当前会话有效，建议使用环境变量进行持久化配置。

## 🛠️ 故障排除

### 常见问题

#### 1. API密钥无效
- 检查密钥是否正确复制
- 确认密钥是否有足够权限
- 检查账户余额

#### 2. 网络连接问题
- 检查防火墙设置
- 确认代理配置
- 尝试不同的API端点

#### 3. 模型不可用
- 确认模型名称正确
- 检查模型是否已部署(Azure)
- 确认账户有模型访问权限

#### 4. 本地Ollama连接失败
- 确认Ollama服务正在运行
- 检查端口是否被占用
- 确认模型已下载

### 调试步骤

1. 启用调试模式:
```bash
AI_DEBUG_MODE=true
```

2. 查看浏览器控制台日志

3. 检查网络请求状态

4. 验证环境变量加载

## 📊 成本优化

### 模型选择建议
- **开发测试**: GPT-3.5 Turbo, Claude Haiku, DeepSeek-V3
- **生产环境**: GPT-4, Claude Sonnet, DeepSeek-V3
- **高质量需求**: GPT-4 Turbo, Claude Opus, DeepSeek-R1
- **推理任务**: DeepSeek-R1 (具有思维链功能)
- **本地部署**: Ollama + Llama2
- **性价比优选**: DeepSeek-V3 (错峰时段更优惠)

### 使用技巧
- 启用上下文记忆减少重复请求
- 合理设置回复长度限制
- 使用本地模型进行开发测试

## 🔒 安全注意事项

1. **API密钥安全**
   - 不要将密钥提交到版本控制
   - 定期轮换API密钥
   - 使用环境变量存储敏感信息

2. **访问控制**
   - 限制API密钥权限
   - 监控API使用情况
   - 设置使用限额

3. **数据隐私**
   - 了解各提供商的数据政策
   - 避免发送敏感信息
   - 考虑使用本地模型处理敏感数据

## 📞 获取帮助

如果您在配置过程中遇到问题：

1. 查看控制台错误日志
2. 检查环境变量配置
3. 参考各提供商的官方文档
4. 在项目Issues中寻求帮助

## 🔄 配置更新

当需要更新配置时：

1. 修改 `.env.local` 文件
2. 重启开发服务器
3. 或使用界面配置进行临时更改

配置生效后，您就可以享受AI驱动的智能思维导图体验了！
