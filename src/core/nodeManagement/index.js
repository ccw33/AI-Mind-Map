// 主入口文件 - 重构后版本
import { nodeDIConfig } from './config/nodeDIConfig';

const { crudService, renderEngine } = nodeDIConfig;

// 对外暴露的API保持不变
export function createNode(content, parentId = null) {
  return crudService.createNode(content, parentId);
}

export function deleteNode(nodeId, parentId) {
  return crudService.deleteNode(nodeId, parentId);
}

export function updateNode(nodeId, newContent) {
  return crudService.updateNode(nodeId, newContent);
}

export function getNode(nodeId) {
  return crudService.getNode(nodeId);
}

// 可视化相关操作
export * from './visualization';

// 测试辅助函数
export function __testResetNodes() {
  if (crudService.reset) {
    crudService.reset();
  }
}

export function __testResetAutoSave() {
  if (crudService.resetAutoSave) {
    crudService.resetAutoSave();
  }
}
