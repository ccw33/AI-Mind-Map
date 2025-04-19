// 全局节点存储
let nodes = {}; // 临时存储节点，后续替换为store集成

export function createNode(content, parentId = null) {
  const node = {
    id: generateId(),
    content,
    children: [],
    collapsed: false
  };
  
  nodes[node.id] = node;
  
  if (parentId) {
    const parent = getNode(parentId);
    parent.children.push(node.id);
  }
  
  return node;
}

export function deleteNode(nodeId, parentId) {
  const parent = getNode(parentId);
  parent.children = parent.children.filter(id => id !== nodeId);
  delete nodes[nodeId];
}

export function updateNode(nodeId, newContent) {
  const node = getNode(nodeId);
  node.content = newContent;
}

// 可视化相关操作
export * from './visualization';

// 私有方法
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// 导出getNode供可视化模块使用
export function getNode(nodeId, externalNodes = null) {
  // 如果传入了外部nodes参数，优先使用
  if (externalNodes) {
    if (Array.isArray(externalNodes)) {
      return externalNodes.find(n => n.id === nodeId);
    }
    return externalNodes[nodeId];
  }
  // 否则使用全局nodes
  return nodes[nodeId];
}
