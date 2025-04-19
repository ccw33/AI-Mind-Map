// 内存存储适配器
export class MemoryStorage {
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
      throw new Error(`Key ${key} already exists`);
    }
    this.data[key] = value;
  }

  delete(key) {
    delete this.data[key];
  }

  getAll() {
    return {...this.data};
  }
}
