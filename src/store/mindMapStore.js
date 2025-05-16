import { create } from 'zustand';
import { MemoryStorage } from '../core/nodeManagement/Storage/MemoryStorage';

const storage = new MemoryStorage();

const useMindMapStore = create((set, get) => ({
  nodes: [],
  edges: [],
  lastSaved: null,
  isSaving: false,

  // 添加节点
  addNode: (node) => set((state) => ({ 
    nodes: [...state.nodes, node] 
  })),

  // 更新节点
  updateNode: (id, changes) => set((state) => ({
    nodes: state.nodes.map(node => 
      node.id === id ? { ...node, ...changes } : node
    )
  })),

  // 自动保存
  autoSave: debounce(async () => {
    set({ isSaving: true });
    const { nodes, edges } = get();
    await storage.set('mindmap', { nodes, edges });
    set({ 
      lastSaved: Date.now(),
      isSaving: false 
    });
  }, 300),

  // 定时保存
  startAutoSave: () => {
    const interval = setInterval(() => {
      get().autoSave();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }
}));

// 防抖函数
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

export default useMindMapStore;
