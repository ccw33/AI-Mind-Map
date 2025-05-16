import { StorageFactory } from '../Storage/StorageFactory';
import { NodeCRUDService } from '../CRUD/NodeCRUDService';
import { SVGRenderer } from '../Render/SVGRenderer';

// 依赖注入配置
export const nodeDIConfig = {
  storage: null,
  crudService: null,
  renderEngine: null,

  async init() {
    this.storage = await StorageFactory.createStorage();
    this.crudService = new NodeCRUDService();
    this.renderEngine = new SVGRenderer({
      theme: 'light', 
      lineStyle: 'straight'
    });
    await this.crudService.init();
  },

  getNodeManager() {
    return new NodeManager({
      crudService: this.crudService,
      renderEngine: this.renderEngine
    });
  }
};

class NodeManager {
  constructor({ crudService, renderEngine }) {
    this.crud = crudService;
    this.renderer = renderEngine;
  }

  createAndRender(content) {
    const node = this.crud.createNode(content);
    return this.renderer.render([node]);
  }
}
