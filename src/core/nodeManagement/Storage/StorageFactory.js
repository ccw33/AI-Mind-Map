const { IndexedDBStorage } = require('./IndexedDBStorage');
const MemoryStorage = require('./MemoryStorage').default || require('./MemoryStorage');

class StorageFactory {
  static async createStorage() {
    // 测试环境下默认使用内存存储
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      console.log('测试环境 - 使用MemoryStorage');
      return new MemoryStorage();
    }
    
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        throw new Error('IndexedDB not supported');
      }
      return new IndexedDBStorage();
    } catch (error) {
      console.warn('使用内存存储作为回退:', error);
      return new MemoryStorage();
    }
  }
}

module.exports = { StorageFactory };
