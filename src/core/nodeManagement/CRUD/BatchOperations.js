import { StorageFactory } from '../Storage/StorageFactory';

export class BatchOperations {
  constructor() {
    this.storage = null;
    this.pendingOperations = [];
    this.isProcessing = false;
    this.concurrencyLimit = 5;
  }

  async init() {
    this.storage = await StorageFactory.createStorage();
  }

  async batchCreate(nodes) {
    return this._processBatch(nodes, async (node) => {
      await this.storage.set(`node_${node.id}`, node);
      return node;
    });
  }

  async batchUpdate(updates) {
    return this._processBatch(updates, async ({id, changes}) => {
      const node = await this.storage.get(`node_${id}`);
      if (!node) throw new Error(`Node ${id} not found`);
      
      const updated = { ...node, ...changes };
      await this.storage.set(`node_${id}`, updated);
      return updated;
    });
  }

  async batchDelete(ids) {
    return this._processBatch(ids, async (id) => {
      await this.storage.delete(`node_${id}`);
      return id;
    });
  }

  async _processBatch(items, operation) {
    return new Promise((resolve, reject) => {
      this.pendingOperations.push({ items, operation, resolve, reject });
      this._processQueue();
    });
  }

  async _processQueue() {
    if (this.isProcessing || this.pendingOperations.length === 0) return;
    this.isProcessing = true;

    try {
      const { items, operation, resolve, reject } = this.pendingOperations.shift();
      
      // 并发控制
      const chunks = [];
      for (let i = 0; i < items.length; i += this.concurrencyLimit) {
        chunks.push(items.slice(i, i + this.concurrencyLimit));
      }

      const results = [];
      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(item => operation(item))
        );
        results.push(...chunkResults);
      }

      resolve(results);
    } catch (error) {
      this.pendingOperations[0].reject(error);
    } finally {
      this.isProcessing = false;
      this._processQueue();
    }
  }
}
