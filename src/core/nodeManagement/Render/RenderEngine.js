// 渲染引擎抽象接口
export class RenderEngine {
  constructor(implementation) {
    if (new.target === RenderEngine) {
      throw new Error('RenderEngine is abstract and cannot be instantiated');
    }
    this.implementation = implementation;
  }

  render(nodes) {
    throw new Error('render() must be implemented');
  }

  highlightPath(nodeId, nodes) {
    throw new Error('highlightPath() must be implemented');
  }

  toggleCollapse(nodeId, nodes) {
    throw new Error('toggleCollapse() must be implemented');
  }

  registerPlugin(plugin) {
    if (!this.plugins) {
      this.plugins = [];
    }
    this.plugins.push(plugin);
  }
}
