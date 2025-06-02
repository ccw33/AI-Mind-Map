# 提示词重构总结

## 概述

本次重构主要针对 `mind-map/index.html` 文件中的重复提示词内容进行了抽取和优化，提高了代码的可维护性和一致性。

## 主要改进

### 1. 提示词常量抽取

创建了 `AI_PROMPTS` 常量对象，包含：

- `DEFAULT_SYSTEM_PROMPT`: 默认系统提示词
- `JSON_EXAMPLE`: JSON格式示例
- `JSON_FORMAT_INSTRUCTION`: JSON格式要求说明

**优化前**：
- 在 `getSystemPrompt()` 函数中硬编码提示词
- 在 `previewFullPrompt()` 函数中重复相同的提示词
- JSON格式示例和说明在两个地方重复

**优化后**：
- 统一的常量定义，便于维护
- 两个函数都使用相同的常量，确保一致性

### 2. 辅助函数创建

#### `buildFullSystemPrompt(customPrompt)`
- 统一构建完整系统提示词的逻辑
- 处理自定义提示词和默认提示词的选择
- 自动添加JSON格式要求

#### `Utils` 工具对象
包含以下通用工具函数：

- `getNodeText(node)`: 从节点获取清理后的文本内容
- `getNodeNote(node)`: 从节点获取备注内容
- `cleanHtmlText(rawText)`: 清理HTML标签，只保留纯文本
- `setMindMapInstance(instance)`: 设置思维导图实例到全局

### 3. 重复代码消除

#### 节点文本获取逻辑优化
**优化前**：多个函数中都有相同的节点文本获取和HTML清理代码
- `updateSelectedNode()`
- `getNodeHierarchy()`
- `getNodeHierarchyWithNotes()`
- `checkActiveNodes()`
- `syncCurrentActiveNode()`

**优化后**：统一使用 `Utils.getNodeText()` 和 `Utils.getNodeNote()`

#### 思维导图实例设置优化
**优化前**：多处重复的实例设置代码
```javascript
mindMapInstance = instance;
window.mindMapInstance = instance;
```

**优化后**：统一使用 `Utils.setMindMapInstance(instance)`

## 代码质量提升

### 1. 可维护性
- 提示词内容集中管理，修改时只需要更新一个地方
- 工具函数复用，减少代码重复

### 2. 一致性
- 确保所有地方使用相同的提示词内容
- 统一的节点文本处理逻辑

### 3. 可读性
- 代码结构更清晰
- 函数职责更明确
- 减少了代码冗余

## 文件变更统计

- 新增常量定义：`AI_PROMPTS`
- 新增辅助函数：`buildFullSystemPrompt()`
- 新增工具对象：`Utils`
- 优化函数数量：8个
- 减少重复代码行数：约100行

## 向后兼容性

本次重构完全保持向后兼容：
- 所有现有功能保持不变
- API接口没有变化
- 用户体验没有影响

## 建议

1. 后续如需修改提示词内容，请直接修改 `AI_PROMPTS` 常量
2. 新增节点操作功能时，建议使用 `Utils` 工具函数
3. 考虑将更多重复的UI模板也抽取为常量或函数
