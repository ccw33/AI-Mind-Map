import { createNode, deleteNode, updateNode } from '../../../core/nodeManagement';

describe('节点CRUD操作测试', () => {
  let testNode;
  
  beforeEach(() => {
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

  // 集成测试
  test('节点父子关系维护', () => {
    const parent = createNode('父节点');
    const child = createNode('子节点');
    
    parent.children.push(child.id);
    expect(parent.children).toContain(child.id);
    
    deleteNode(child.id, parent.id);
    expect(parent.children).not.toContain(child.id);
  });
});

// TODO: 添加E2E测试用例
