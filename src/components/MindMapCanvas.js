import React, { useEffect } from 'react';
import ReactFlow from 'react-flow';
import useMindMapStore from '../store/mindMapStore';

const MindMapCanvas = () => {
  const {
    nodes,
    edges,
    isSaving,
    lastSaved,
    addNode,
    updateNode,
    autoSave,
    startAutoSave
  } = useMindMapStore();

  // 初始化自动保存
  useEffect(() => {
    const cleanup = startAutoSave();
    return cleanup;
  }, [startAutoSave]);

  // 创建根节点
  const createRootNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'default',
      data: { label: '中心主题' },
      position: { x: 250, y: 250 }
    };
    addNode(newNode);
    autoSave();
  };

  // 节点变化处理
  const onNodesChange = (changes) => {
    changes.forEach(change => {
      if (change.type === 'position' || change.type === 'dimensions') {
        updateNode(change.id, change);
      }
    });
    autoSave();
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* 状态提示 */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        padding: 8,
        background: isSaving ? '#ffeb3b' : '#4caf50',
        color: '#000',
        borderRadius: 4
      }}>
        {isSaving ? '保存中...' : 
          lastSaved ? `最后保存: ${new Date(lastSaved).toLocaleTimeString()}` : '未保存'}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onNodeDragStop={autoSave}
        onSelectionChange={({ nodes }) => {
          if (nodes.length > 0) {
            // 选中节点处理
          }
        }}
        fitView
      />
      <button 
        onClick={createRootNode}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000
        }}
      >
        创建中心节点
      </button>
    </div>
  );
};

export default MindMapCanvas;
