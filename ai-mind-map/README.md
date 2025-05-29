# AI思维导图 (AI Mind Map)

一个集成了AI智能对话功能的现代化思维导图应用，基于 Next.js 和 simple-mind-map 构建。

## ✨ 功能特性

- 🧠 **智能思维导图**: 基于 simple-mind-map 的强大思维导图功能
- 🤖 **AI智能助手**: 右下角浮窗式AI聊天机器人
- 🎯 **上下文感知**: AI能理解选中的思维导图节点
- ⚡ **一键扩展**: AI建议可直接添加到思维导图
- 🎨 **现代化UI**: 基于 Tailwind CSS 的美观界面
- 📱 **响应式设计**: 支持桌面和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 方式一：自动设置（推荐）

运行设置脚本，自动完成环境配置：

**Linux/macOS:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows:**
```cmd
scripts\setup.bat
```

### 方式二：手动设置

#### 安装依赖

```bash
npm install
```

#### 配置AI服务（可选）

复制环境变量示例文件：
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，配置您的AI服务：

```bash
# 选择AI提供商
DEFAULT_AI_PROVIDER=openai

# 配置OpenAI (推荐)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

# 或配置DeepSeek (性价比高)
# DEEPSEEK_API_KEY=your-deepseek-api-key
# DEEPSEEK_DEFAULT_MODEL=deepseek-chat
# DEFAULT_AI_PROVIDER=deepseek

# 或配置其他AI服务...
```

**详细配置说明请参考 [AI_CONFIG_GUIDE.md](./AI_CONFIG_GUIDE.md)**

#### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎯 使用方法

1. **选择节点**: 点击思维导图中的任意节点
2. **AI对话**: 在右下角AI助手中输入问题
3. **获取建议**: AI会基于选中节点提供相关建议
4. **一键添加**: 点击建议按钮直接添加到思维导图
5. **配置AI**: 点击右上角设置图标配置AI服务

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: Next.js 15 + React 18
- **思维导图**: simple-mind-map
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **类型**: TypeScript

### 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 主页面
├── components/         # React 组件
│   ├── MindMap.tsx     # 思维导图组件
│   └── ChatBot.tsx     # AI聊天组件
└── lib/                # 工具函数
    └── utils.ts        # 通用工具
```

## 🔧 核心组件

### MindMap 组件

基于 simple-mind-map 库实现的思维导图组件，提供：

- 节点创建、编辑、删除
- 多种布局模式
- 事件监听和回调
- 数据导入导出

### ChatBot 组件

AI聊天机器人组件，具备：

- 浮窗式界面
- 上下文感知对话
- 节点建议生成
- 一键添加功能

## 🎨 自定义配置

### 思维导图配置

在 `MindMap.tsx` 中可以自定义：

```typescript
const mindMap = new MindMapLib({
  el: containerRef.current,
  data: initialData || defaultData,
  layout: 'logicalStructure', // 布局模式
  theme: 'default',           // 主题
  readonly: false,            // 是否只读
  enableFreeDrag: true,       // 启用自由拖拽
  // 更多配置...
})
```

### AI 对话配置

在 `ChatBot.tsx` 中可以自定义：

- 模拟AI回复逻辑
- 建议生成规则
- 界面样式和交互

## 🔮 未来计划

- [x] 集成真实AI API (OpenAI, Claude, Gemini, Ollama等)
- [x] AI配置管理界面
- [ ] 支持多人协作编辑
- [ ] 数据云端同步
- [ ] 更多思维导图模板
- [ ] 导出为多种格式
- [ ] 移动端优化
- [ ] AI建议的智能化优化

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源。

## 🙏 致谢

- [simple-mind-map](https://github.com/wanglin2/mind-map) - 强大的思维导图库
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
