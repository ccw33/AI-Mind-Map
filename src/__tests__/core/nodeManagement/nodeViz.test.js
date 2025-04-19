import { renderNodeTree, highlightNodePath, toggleNodeCollapse } from '../../../core/nodeManagement/visualization';

describe('节点可视化测试', () => {
  const mockNodes = {
    '1': { id: '1', content: '根节点', children: ['2', '3'], parentId: null, x: 20, y: 100 },
    '2': { id: '2', content: '子节点1', children: [], parentId: '1', x: 170, y: 100 },
    '3': { id: '3', content: '子节点2', children: ['4'], parentId: '1', x: 170, y: 100 },
    '4': { id: '4', content: '孙子节点', children: [], parentId: '3', x: 320, y: 100 }
  };

  // 单元测试
  test('渲染节点树', () => {
    const result = renderNodeTree(mockNodes);
    expect(result).toHaveProperty('svg');
    expect(result.svg).toContain('<g class="node"');
    expect(result.svg).toContain('<line');
  });

  test('高亮节点路径', () => {
    const result = highlightNodePath('4', mockNodes);
    expect(result.highlightedNodes).toEqual(['1', '3', '4']);
    expect(result.svg).toContain('class="node highlighted"');
  });

  // 集成测试
  test('交互式展开/折叠', () => {
    const initialRender = renderNodeTree(mockNodes);
    expect(initialRender.svg).toContain('node-3'); // 初始应显示
    
    const collapsed = toggleNodeCollapse('3', mockNodes);
    expect(collapsed.svg).not.toContain('node-4'); // 折叠后应隐藏
    
    const expanded = toggleNodeCollapse('3', mockNodes);
    expect(expanded.svg).toContain('node-4'); // 再次展开应显示
  });

  // TODO: 添加E2E测试用例
});
