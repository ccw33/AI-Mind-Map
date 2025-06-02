# AI Mind Map - 智能思维导图

## 运行方式
直接打开 `index.html` 文件

## 最近更新

### 2024-12-19: DeepSeek-Reasoner 流式响应中断问题完全修复 🎉
- 🐛 **重大修复**: 彻底解决了 deepseek-reasoner 模型流式响应中断问题
- 🔄 **双轨制处理**: 实现显示和解析分离，既避免JSON显示又保证功能正常
- 🧹 **智能 JSON 清理**: 多层次清理机制，完美处理各种JSON片段场景
- 📋 **结构化分点恢复**: 修复了结构化分点解析功能，可正常添加到思维导图
- 🔄 **流式处理**: 修复了 `[DONE]` 标记处理逻辑，确保响应正常结束
- ⏰ **超时控制**: 添加了 5 分钟超时机制，防止连接挂起
- 📊 **详细日志**: 增加了流式响应处理的详细日志记录
- 🧪 **全面测试**: 创建了 9 个测试用例，验证显示清理和解析功能

**核心创新 - 双轨制处理**:
1. **显示轨道**: `cleanResponseContentForDisplay()` - 激进清理JSON，确保界面友好
2. **解析轨道**: `cleanResponseContentForParsing()` - 保守清理，保留JSON用于功能解析
3. **流式响应**: 实时使用显示轨道，最终使用解析轨道处理功能
4. **完美平衡**: 用户看不到JSON片段，但结构化分点功能正常工作

**技术修复内容**:
1. **流式响应结束逻辑修复** - 正确处理 `[DONE]` 标记
2. **双轨制JSON处理** - 分离显示清理和功能解析
3. **括号平衡算法** - 智能检测 JSON 块的开始和结束
4. **实时内容清理** - 避免 JSON 片段在流式响应中显示
5. **错误恢复机制** - 检测不完整 JSON 块并恢复正常处理

**测试验证**:
**显示清理测试** (5/5 通过):
- ✅ 完整 JSON 代码块清理
- ✅ 不完整 JSON 代码块清理
- ✅ 裸 JSON 片段清理
- ✅ 混合内容中的 JSON 清理
- ✅ 不完整 JSON 块的智能检测

**解析功能测试** (4/4 通过):
- ✅ 完整JSON结构化分点解析
- ✅ 多个JSON块处理（保留最后一个）
- ✅ 无JSON块情况处理
- ✅ 错误JSON格式处理

**相关文件**:
- `docs/deepseek-reasoner-fix-summary.md` - 完整修复总结
- `scripts/test-json-cleanup.js` - JSON 清理功能测试
- `scripts/test-json-parsing.js` - JSON 解析功能测试
- `scripts/test-deepseek-reasoner-fix.js` - DeepSeek 修复测试

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

## 开发相关

### 测试脚本
```bash
# 测试 JSON 清理功能（显示轨道）
node scripts/test-json-cleanup.js

# 测试 JSON 解析功能（解析轨道）
node scripts/test-json-parsing.js

# 测试 DeepSeek-Reasoner 修复效果
node scripts/test-deepseek-reasoner-fix.js

# 验证 DeepSeek-Reasoner 支持
node scripts/verify-deepseek-reasoner-support.js
```

### 项目结构
- `index.html` - 主应用入口
- `web/` - Vue 版本组件
- `simple-mind-map/` - 思维导图核心库
- `scripts/` - 工具脚本
- `docs/` - 文档