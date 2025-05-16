import { NodeCRUDService } from '../../../core/nodeManagement/CRUD/NodeCRUDService';

describe('节点CRUD操作测试', () => {
  let crudService;
  
  beforeAll(async () => {
    crudService = new NodeCRUDService();
    await crudService.init();
  });

  // 单元测试
  test('创建节点', async () => {
    const node = await crudService.createNode({content: '测试节点'});
    expect(node).toHaveProperty('id');
    expect(node.content).toBe('测试节点');
    expect(node.children).toEqual([]);
  });

  test('删除节点', async () => {
    const parent = await crudService.createNode({content: '父节点'});
    const child = await crudService.createNode({content: '子节点'});
    
    await crudService.updateNode(parent.id, {
      children: [child.id]
    });
    
    await crudService.deleteNode(child.id, parent.id);
    const updatedParent = await crudService.getNode(parent.id);
    expect(updatedParent.children).not.toContain(child.id);
  });

  test('更新节点内容', async () => {
    const node = await crudService.createNode({content: '原始内容'});
    const updated = await crudService.updateNode(node.id, {content: '更新内容'});
    expect(updated.content).toBe('更新内容');
  });

  test('更新不存在的节点应报错', async () => {
    await expect(crudService.updateNode('invalid-id', {content: '内容'}))
      .rejects.toThrow('Node invalid-id not found');
  });

  test('获取不存在的节点应返回null', async () => {
    const node = await crudService.getNode('invalid-id');
    expect(node).toBeNull();
  });

  // 批量操作性能测试
  test('批量创建100个节点', async () => {
    const startTime = performance.now();
    const nodes = await Promise.all(
      Array.from({length: 100}, (_, i) => 
        crudService.createNode({content: `节点${i}`})
      )
    );
    const duration = performance.now() - startTime;
    
    expect(nodes).toHaveLength(100);
    expect(duration).toBeLessThan(100);
  });

  // 边界条件测试
  test('空内容节点创建', async () => {
    const node = await crudService.createNode({content: ''});
    expect(node.content).toBe('');
  });

  test('重复ID节点创建应报错', async () => {
    const node = await crudService.createNode({content: '测试'});
    await expect(crudService.createNode({content: '测试', id: node.id}))
      .rejects.toThrow('Duplicate node ID');
  });
});
