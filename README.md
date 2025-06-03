# AI Mind Map - 智能思维导图

## 运行方式

### 方式一：直接打开文件
直接打开 `index.html` 文件

### 方式二：Docker 部署（推荐）

#### 构建并运行
```bash
# 1. 构建 Docker 镜像
docker build -t mind-map-nginx .

# 2. 运行容器（默认9090端口）
docker run -d -p 9090:9090 --name mind-map-app mind-map-nginx

# 3. 访问应用
# 浏览器打开: http://localhost:9090
```

#### 自定义端口运行
```bash
# 运行在其他端口（例如8080）
docker run -d -p 8080:9090 --name mind-map-app-8080 mind-map-nginx

# 访问: http://localhost:8080
```


#### Docker 配置说明
- **基础镜像**: nginx:latest
- **默认端口**: 9090
- **文件路径**: `/app/index.html` 和 `/app/dist/`
- **配置文件**: `nginx.conf` (已配置SPA路由支持)




## 功能特性

- 🤖 支持多种 AI 模型（OpenAI、DeepSeek、Ollama 等）
- 🧠 特别优化了 DeepSeek-Reasoner 推理模型支持
- 💬 智能对话界面，支持流式响应
- 🎯 基于选中节点的上下文感知
- 📝 Markdown 格式支持
- 🔄 实时思维导图更新

## 使用说明

1. 打开 `index.html` 文件
2. 配置 AI 提供商和 API Key
3. 选择思维导图节点
4. 与 AI 对话获取扩展建议
5. 一键添加建议到思维导图


### 项目结构
- `index.html` - 主应用入口
- `web/` - Vue 版本组件
- `simple-mind-map/` - 思维导图核心库
- `scripts/` - 工具脚本
- `docs/` - 文档