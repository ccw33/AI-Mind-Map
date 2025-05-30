# Git仓库管理文档

## 项目概述

本项目是基于原开源项目 `wanglin2/mind-map` 开发的AI增强版思维导图，项目名称为 `AI-Mind-Map`。

## 仓库配置

### 远程仓库设置

- **origin**: `git@github.com:ccw33/AI-Mind-Map.git` (个人开发仓库)
- **upstream**: `git@github.com:wanglin2/mind-map.git` (原项目上游仓库)

### 配置历史

**初始状态：**
- 本地仓库原本指向 `wanglin2/mind-map.git`
- 本地有2个领先于原项目的提交：
  - `4e34680e` - 完成MVP，可源码运行
  - `ab9cdb6b` - 增加AI聊天窗口

**配置过程：**
1. 将原远程仓库重命名为upstream：`git remote rename origin upstream`
2. 添加个人仓库作为新的origin：`git remote add origin git@github.com:ccw33/AI-Mind-Map.git`
3. 强制推送到个人仓库：`git push -f origin main`

## 日常工作流程

### 1. 推送本地更改到个人仓库

```bash
# 提交本地更改
git add .
git commit -m "描述您的更改"

# 推送到个人仓库
git push origin main
```

### 2. 从上游同步原项目更新

```bash
# 获取上游更新
git fetch upstream

# 合并上游更新到本地
git merge upstream/main

# 如果有冲突，解决冲突后提交
git add .
git commit -m "解决合并冲突"

# 推送合并后的代码到个人仓库
git push origin main
```

### 3. 查看仓库状态

```bash
# 查看远程仓库配置
git remote -v

# 查看当前分支状态
git status

# 查看提交历史
git log --oneline --graph --all -10
```

## 分支管理策略

### 主分支
- **main**: 主开发分支，包含稳定的AI增强功能

### 功能开发
建议为新功能创建独立分支：

```bash
# 创建并切换到新功能分支
git checkout -b feature/新功能名称

# 开发完成后合并到main
git checkout main
git merge feature/新功能名称

# 删除功能分支
git branch -d feature/新功能名称
```

## 贡献代码回原项目

如果开发的AI功能有价值，可以考虑贡献回原项目：

1. **确保代码质量**：
   - 代码符合原项目规范
   - 功能稳定且经过测试
   - 文档完善

2. **创建Pull Request**：
   - 在GitHub上从 `ccw33/AI-Mind-Map` 创建PR到 `wanglin2/mind-map`
   - 详细描述新功能和改进
   - 提供使用示例和测试用例

3. **维护PR**：
   - 及时响应代码审查意见
   - 根据反馈调整代码
   - 保持与上游的同步

## 保留上游的优势

1. **持续同步原项目更新**：
   - 获取bug修复和安全补丁
   - 保持核心功能的最新状态

2. **便于贡献代码**：
   - 保持与原项目的兼容性
   - 便于创建Pull Request

3. **更好的版本管理**：
   - 清晰区分原项目代码和AI增强功能
   - 便于管理定制化改动

## 注意事项

1. **定期同步**：建议每周从上游同步一次更新
2. **冲突处理**：遇到合并冲突时，优先保持原项目核心功能的稳定性
3. **备份重要更改**：重要功能开发前创建分支备份
4. **文档更新**：每次重要更改后更新相关文档

## 常用命令速查

```bash
# 查看远程仓库
git remote -v

# 从上游获取更新
git fetch upstream

# 合并上游更新
git merge upstream/main

# 推送到个人仓库
git push origin main

# 查看分支状态
git status

# 查看提交历史
git log --oneline -10

# 创建新分支
git checkout -b 分支名

# 切换分支
git checkout 分支名

# 合并分支
git merge 分支名
```

## 项目特色

本项目在原思维导图基础上增加了以下AI功能：
- AI聊天窗口
- 智能内容生成
- 其他AI增强功能（持续开发中）

---

*最后更新时间：2024年12月*
*维护者：ccw33*