import { createNode, deleteNode, updateNode, getNode, __testResetNodes } from '../../../core/nodeManagement';
import { NodeCRUDService } from '../../../core/nodeManagement/CRUD/NodeCRUDService';

describe('节点CRUD操作测试', () => {
  let testNode;
  let crudService;
  
  beforeEach(() => {
    __testResetNodes(); // 重置节点状态
    crudService = new NodeCRUDService();
    testNode = createNode('测试节点');
  });

  // 单元测试
  test('创建节点', () => {
    expect(testNode).toHaveProperty('id');
    expect(testNode).toHaveProperty('content', '测试节点');
    expect(testNode).toHaveProperty('children', []);
  });

  test('删除节点', () => {
    const parent = createNode('父节点');
    parent.children.push(testNode.id);
    
    deleteNode(testNode.id, parent.id);
    expect(parent.children).not.toContain(testNode.id);
  });

  test('更新节点内容', () => {
    updateNode(testNode.id, '更新内容');
    expect(testNode.content).toBe('更新内容');
  });

  test('更新不存在的节点应报错', () => {
    expect(() => updateNode('invalid-id', '内容')).toThrow('Node invalid-id not found');
  });

  test('获取不存在的节点应返回null', () => {
    expect(getNode('invalid-id')).toBeNull();
  });

  // 集成测试
  test('节点父子关系维护', () => {
    const parent = createNode('父节点');
    const child = createNode('子节点');
    
    parent.children.push(child.id);
    expect(parent.children).toContain(child.id);
    
    deleteNode(child.id, parent.id);
    expect(parent.children).not.toContain(child.id);
  });

  // 服务层直接测试
  describe('NodeCRUDService测试', () => {
    test('服务层创建节点', () => {
      const node = crudService.createNode('服务测试');
      expect(node).toHaveProperty('id');
      expect(node.content).toBe('服务测试');
    });
  });
});
