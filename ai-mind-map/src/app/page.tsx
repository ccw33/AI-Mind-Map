'use client'

import { useState } from 'react'
import MindMap, { MindMapNode } from '@/components/MindMap'
import ChatBot, { SelectedNodeContext, NodeSuggestion } from '@/components/ChatBot'
import AIConfigPanel from '@/components/AIConfigPanel'

// AI思维导图主页面 - 整合思维导图和AI聊天功能的核心页面
export default function Home() {
  const [selectedNode, setSelectedNode] = useState<SelectedNodeContext | undefined>()
  const [mindMapData, setMindMapData] = useState<MindMapNode | undefined>()

  // 处理节点选择
  const handleNodeSelect = (node: any) => {
    console.log('选中节点:', node)
    setSelectedNode({
      id: node.id,
      text: node.text,
      hierarchy: node.hierarchy,
      data: node.data
    })
  }

  // 处理思维导图数据变化
  const handleDataChange = (data: MindMapNode) => {
    console.log('思维导图数据变化:', data)
    setMindMapData(data)
  }

  // 处理AI建议添加节点
  const handleAddNode = (suggestion: NodeSuggestion, nodeId?: string) => {
    console.log('添加节点建议:', suggestion, '目标节点ID:', nodeId)

    // 获取思维导图组件的方法
    const mindMapContainer = document.querySelector('[data-mindmap-container]') as any
    const mindMapMethods = mindMapContainer?._mindMapMethods

    if (mindMapMethods) {
      if (suggestion.type === 'child') {
        mindMapMethods.addChildNode(suggestion.text, nodeId)
      } else if (suggestion.type === 'sibling') {
        mindMapMethods.addSiblingNode(suggestion.text, nodeId)
      }
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      {/* 头部导航 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">AI思维导图</h1>
          <div className="text-sm text-gray-500">
            智能思维导图 + AI助手
          </div>
        </div>

        <div className="flex items-center gap-4">
          {selectedNode && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              已选中: {selectedNode.text}
            </div>
          )}
          <div className="text-xs text-gray-400">
            点击节点开始AI对话
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="h-[calc(100vh-4rem)] relative">
        {/* 思维导图区域 */}
        <div
          className="w-full h-full"
          data-mindmap-container
        >
          <MindMap
            onNodeSelect={handleNodeSelect}
            onDataChange={handleDataChange}
            initialData={mindMapData}
          />
        </div>

        {/* AI聊天浮窗 */}
        <ChatBot
          selectedNode={selectedNode}
          onAddNode={handleAddNode}
        />

        {/* AI配置面板 */}
        <AIConfigPanel />
      </main>

      {/* 使用说明浮窗 */}
      {!selectedNode && (
        <div className="fixed top-20 left-6 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
          <h3 className="font-medium text-gray-800 mb-2">使用指南</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 点击思维导图中的任意节点</li>
            <li>• 在右下角AI助手中提问</li>
            <li>• AI会基于选中节点提供建议</li>
            <li>• 一键添加AI建议到思维导图</li>
          </ul>
        </div>
      )}
    </div>
  )
}
