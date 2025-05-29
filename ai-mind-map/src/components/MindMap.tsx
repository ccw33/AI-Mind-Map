'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// 思维导图节点数据类型
export interface MindMapNode {
  data: {
    text: string
    [key: string]: any
  }
  children?: MindMapNode[]
}

// 思维导图组件属性
interface MindMapProps {
  onNodeSelect?: (node: any) => void
  onDataChange?: (data: MindMapNode) => void
  initialData?: MindMapNode
}

// 思维导图组件 - 基于simple-mind-map库实现的核心思维导图功能
export default function MindMap({
  onNodeSelect,
  onDataChange,
  initialData
}: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mindMapContainerRef = useRef<HTMLDivElement>(null)
  const mindMapRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // 默认思维导图数据
  const defaultData: MindMapNode = {
    data: {
      text: 'AI思维导图'
    },
    children: [
      {
        data: { text: '功能特性' },
        children: [
          { data: { text: 'AI智能对话' } },
          { data: { text: '节点快速扩展' } },
          { data: { text: '上下文理解' } }
        ]
      },
      {
        data: { text: '使用场景' },
        children: [
          { data: { text: '学习笔记' } },
          { data: { text: '项目规划' } },
          { data: { text: '创意构思' } }
        ]
      }
    ]
  }

  useEffect(() => {
    if (!containerRef.current) return

    // 动态导入 simple-mind-map 以避免 SSR 问题
    const initMindMap = async () => {
      try {
        // 动态导入 simple-mind-map
        const MindMapLib = (await import('simple-mind-map')).default

        // 初始化思维导图
        const mindMap = new MindMapLib({
          el: containerRef.current,
          data: initialData || defaultData,
          layout: 'logicalStructure', // 逻辑结构图
          theme: 'default',
          // 基础配置
          readonly: false,
          enableFreeDrag: true,
          watermark: {
            show: false
          },
          // 节点配置
          nodeConfig: {
            useCustomNodeContent: false,
            textAutoWrap: {
              enabled: true,
              maxWidth: 200
            }
          }
        })

        mindMapRef.current = mindMap
        setIsLoaded(true)

        // 监听节点点击事件
        mindMap.on('node_click', (node: any) => {
          console.log('节点被点击:', node)
          if (onNodeSelect) {
            onNodeSelect({
              id: node.uid,
              text: node.nodeData.data.text,
              data: node.nodeData,
              hierarchy: getNodeHierarchy(node)
            })
          }
        })

        // 监听数据变化
        mindMap.on('data_change', (data: any) => {
          console.log('思维导图数据变化:', data)
          if (onDataChange) {
            onDataChange(data)
          }
        })

        // 监听节点激活事件
        mindMap.on('node_active', (node: any, activeNodeList: any[]) => {
          console.log('节点激活:', node, activeNodeList)
        })

      } catch (error) {
        console.error('思维导图初始化失败:', error)
      }
    }

    initMindMap()

    // 清理函数
    return () => {
      if (mindMapRef.current) {
        mindMapRef.current.destroy()
      }
    }
  }, [])

  // 获取节点层级关系
  const getNodeHierarchy = (node: any): string[] => {
    const hierarchy: string[] = []
    let currentNode = node

    while (currentNode) {
      hierarchy.unshift(currentNode.nodeData.data.text)
      currentNode = currentNode.parent
    }

    return hierarchy
  }

  // 添加子节点
  const addChildNode = (text: string, parentNodeId?: string) => {
    if (!mindMapRef.current) return null

    try {
      // 获取当前思维导图数据
      const currentData = mindMapRef.current.getData()

      // 递归查找目标节点并添加子节点
      const addNodeToData = (node: any, targetId?: string): boolean => {
        if (!targetId || (node.data && node.data.uid === targetId)) {
          // 如果没有指定目标ID或找到了目标节点，添加子节点
          if (!node.children) {
            node.children = []
          }
          node.children.push({
            data: {
              text,
              uid: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            children: []
          })
          return true
        }

        // 递归查找子节点
        if (node.children) {
          for (let child of node.children) {
            if (addNodeToData(child, targetId)) {
              return true
            }
          }
        }
        return false
      }

      // 添加节点到数据
      if (addNodeToData(currentData, parentNodeId)) {
        // 更新思维导图数据
        mindMapRef.current.setData(currentData)
        console.log('子节点添加成功:', text)
        return `node_${Date.now()}`
      }
    } catch (error) {
      console.error('添加子节点失败:', error)
    }
    return null
  }

  // 添加带备注的子节点
  const addChildNodeWithNote = (text: string, note: string, parentNodeId?: string) => {
    if (!mindMapRef.current) return null

    try {
      // 获取当前思维导图数据
      const currentData = mindMapRef.current.getData()

      // 递归查找目标节点并添加子节点
      const addNodeToData = (node: any, targetId?: string): boolean => {
        if (!targetId || (node.data && node.data.uid === targetId)) {
          // 如果没有指定目标ID或找到了目标节点，添加子节点
          if (!node.children) {
            node.children = []
          }
          node.children.push({
            data: {
              text,
              note, // 添加备注内容
              uid: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            children: []
          })
          return true
        }

        // 递归查找子节点
        if (node.children) {
          for (let child of node.children) {
            if (addNodeToData(child, targetId)) {
              return true
            }
          }
        }
        return false
      }

      // 添加节点到数据
      if (addNodeToData(currentData, parentNodeId)) {
        // 更新思维导图数据
        mindMapRef.current.setData(currentData)
        console.log('带备注的子节点添加成功:', text, '备注:', note)
        return `node_${Date.now()}`
      }
    } catch (error) {
      console.error('添加带备注的子节点失败:', error)
    }
    return null
  }

  // 添加同级节点
  const addSiblingNode = (text: string, nodeId?: string) => {
    if (!mindMapRef.current) return

    try {
      const activeNodes = mindMapRef.current.renderer.activeNodeList
      const targetNode = nodeId
        ? mindMapRef.current.renderer.findNodeByUid(nodeId)
        : activeNodes.length > 0 ? activeNodes[0] : null

      if (targetNode && targetNode.parent) {
        mindMapRef.current.execCommand('INSERT_NODE', targetNode, {
          data: { text }
        })
      }
    } catch (error) {
      console.error('添加同级节点失败:', error)
    }
  }

  // 更新节点文本
  const updateNodeText = (nodeId: string, text: string) => {
    if (!mindMapRef.current) return

    try {
      const node = mindMapRef.current.renderer.findNodeByUid(nodeId)
      if (node) {
        mindMapRef.current.execCommand('SET_NODE_TEXT', node, text)
      }
    } catch (error) {
      console.error('更新节点文本失败:', error)
    }
  }

  // 暴露方法给父组件
  useEffect(() => {
    if (isLoaded && mindMapRef.current && mindMapContainerRef.current) {
      // 将方法挂载到data-mindmap-container元素上，供外部调用
      ;(mindMapContainerRef.current as any)._mindMapMethods = {
        addChildNode,
        addChildNodeWithNote,
        addSiblingNode,
        updateNodeText,
        getMindMapData: () => mindMapRef.current?.getData(),
        setMindMapData: (data: MindMapNode) => mindMapRef.current?.setData(data)
      }
      console.log('思维导图方法已挂载')
    }
  }, [isLoaded])

  return (
    <div
      className="w-full h-full relative"
      data-mindmap-container
      ref={mindMapContainerRef}
    >
      <div
        ref={containerRef}
        className="w-full h-full bg-white"
        style={{ minHeight: '600px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">思维导图加载中...</div>
        </div>
      )}
    </div>
  )
}

// 导出类型
export type { MindMapProps }
