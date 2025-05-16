import React from 'react';
import { render } from '@testing-library/react';
import ReactFlow from 'react-flow';
import MindMapCanvas from '../../../../src/components/MindMapCanvas';

describe('React-Flow配置测试', () => {
  test('正确初始化React-Flow', () => {
    const { container } = render(<MindMapCanvas />);
    const flowElement = container.querySelector('.react-flow');
    expect(flowElement).toBeInTheDocument();
  });

  test('默认节点类型配置', () => {
    const { container } = render(<MindMapCanvas />);
    const defaultNode = container.querySelector('.react-flow__node-default');
    expect(defaultNode).toBeInTheDocument();
  });

  test('画布交互功能', () => {
    const { container } = render(<MindMapCanvas />);
    const controls = container.querySelector('.react-flow__controls');
    const background = container.querySelector('.react-flow__background');
    expect(controls).toBeInTheDocument();
    expect(background).toBeInTheDocument();
  });
});
