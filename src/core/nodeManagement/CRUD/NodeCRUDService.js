// 节点CRUD核心服务
import { randomUUID } from 'crypto';
import { StorageFactory } from '../Storage/StorageFactory';
import { BatchOperations } from './BatchOperations';

export class NodeCRUDService {
  constructor() {
    this.storage = null;
    this.batchOps = new BatchOperations();
  }

  resetAutoSave() {
    // 重置自动保存状态
    this.autoSaveQueue = [];
    this.lastSaveTime = 0;
  }

  async init() {
    try {
      this.storage = await StorageFactory.createStorage();
      console.log('Storage initialized:', this.storage.constructor.name);
      await this.batchOps.init();
      return this; // 返回实例以支持链式调用
    } catch (error) {
      console.error('初始化存储失败:', error);
      throw error;
    }
  }

  async createNode(nodeData) {
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }

    const node = {
      id: randomUUID(),
      ...nodeData,
      children: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await this.storage.set(`node_${node.id}`, node);
    return node;
  }

  async batchCreateNodes(nodes) {
    return this.batchOps.batchCreate(nodes.map(node => ({
      ...node,
      id: node.id || this._generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })));
  }

  async deleteNode(nodeId, parentId = null) {
    await this.storage.delete(`node_${nodeId}`);
    
    if (parentId) {
      const parent = await this.getNode(parentId);
      if (parent) {
        const updatedParent = {
          ...parent,
          children: parent.children.filter(id => id !== nodeId),
          updatedAt: Date.now()
        };
        await this.storage.update(`node_${parentId}`, updatedParent);
      }
    }
  }

  async batchDeleteNodes(nodeIds) {
    return this.batchOps.batchDelete(nodeIds);
  }

  async updateNode(nodeId, changes) {
    const node = await this.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }
    
    const updated = {
      ...node,
      ...changes,
      updatedAt: Date.now()
    };
    
    await this.storage.update(`node_${nodeId}`, updated);
    return updated;
  }

  async batchUpdateNodes(updates) {
    return this.batchOps.batchUpdate(
      updates.map(({id, changes}) => ({
        id: `node_${id}`,
        changes: {
          ...changes,
          updatedAt: Date.now()
        }
      }))
    );
  }

  async getNode(nodeId) {
    return this.storage.get(`node_${nodeId}`);
  }

  async getNodes(nodeIds) {
    const results = {};
    for (const id of nodeIds) {
      results[id] = await this.getNode(id);
    }
    return results;
  }

}
