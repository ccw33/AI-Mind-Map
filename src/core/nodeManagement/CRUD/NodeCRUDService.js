// 节点CRUD核心服务
export class NodeCRUDService {
  constructor(storage) {
    this.nodes = storage || {};
  }

  createNode(content, parentId = null) {
    const node = {
      id: this._generateId(),
      content,
      children: [],
      collapsed: false
    };
    
    this.nodes[node.id] = node;
    
    if (parentId) {
      const parent = this.getNode(parentId);
      parent.children.push(node.id);
    }
    
    return node;
  }

  deleteNode(nodeId, parentId) {
    const parent = this.getNode(parentId);
    parent.children = parent.children.filter(id => id !== nodeId);
    delete this.nodes[nodeId];
  }

  updateNode(nodeId, newContent) {
    const node = this.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    node.content = newContent;
    return node;
  }

  getNode(nodeId) {
    if (!this.nodes.hasOwnProperty(nodeId)) {
      return null;
    }
    return this.nodes[nodeId];
  }

  _generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}
