const { get, set, del, keys } = require('idb-keyval');
const { LZMA } = require('lzma-web');

class IndexedDBStorage {
  constructor() {
    this.lzma = new LZMA.LZMA();
    this.transactionStack = [];
  }

  async get(key) {
    try {
      const compressed = await get(key);
      if (!compressed) return null;
      
      const decompressed = await this.lzma.decompress(compressed);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('IndexedDB读取失败:', error);
      throw error;
    }
  }

  async set(key, value) {
    try {
      // 开始事务
      this.transactionStack.push({ key, oldValue: await this.get(key) });

      const jsonStr = JSON.stringify(value);
      const compressed = await this.lzma.compress(jsonStr, 9);
      await set(key, compressed);
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async delete(key) {
    try {
      this.transactionStack.push({ key, oldValue: await this.get(key) });
      await del(key);
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async rollback() {
    while (this.transactionStack.length > 0) {
      const { key, oldValue } = this.transactionStack.pop();
      if (oldValue !== null) {
        await this.set(key, oldValue);
      } else {
        await this.delete(key);
      }
    }
  }

  async batchSet(items) {
    try {
      for (const { key, value } of items) {
        await this.set(key, value);
      }
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async getAll() {
    const allKeys = await keys();
    const result = {};
    
    for (const key of allKeys) {
      result[key] = await this.get(key);
    }
    
    return result;
  }
}
