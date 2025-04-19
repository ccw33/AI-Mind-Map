import { MemoryStorage } from '../Storage/MemoryStorage';
import { NodeCRUDService } from '../CRUD/NodeCRUDService';
import { SVGRenderer } from '../Render/SVGRenderer';

// 依赖注入配置
export const nodeDIConfig = {
  storage: new MemoryStorage(),
  crudService: new NodeCRUDService(),
  renderEngine: new SVGRenderer({
    theme: 'light',
    lineStyle: 'straight'
  }),

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
