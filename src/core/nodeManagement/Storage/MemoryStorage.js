// 内存存储适配器
class MemoryStorage {
  constructor() {
    this.data = {};
  }

  get(key) {
    if (!this.data.hasOwnProperty(key)) {
      return null;
    }
    return this.data[key];
  }

  set(key, value) {
    if (this.data.hasOwnProperty(key)) {
      throw new Error(`Duplicate node ID: ${key.replace('node_', '')}`);
    }
    this.data[key] = value;
  }

  update(key, value) {
    if (!this.data.hasOwnProperty(key)) {
      throw new Error(`Key ${key} not found`);
    }
    this.data[key] = value;
  }

  delete(key) {
    delete this.data[key];
  }
}

exports.MemoryStorage = MemoryStorage;
