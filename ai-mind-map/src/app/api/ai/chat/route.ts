// AI聊天API路由 - 处理前端的AI聊天请求

import { NextRequest, NextResponse } from 'next/server'
import { aiService, MindMapContext } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context }: { message: string; context?: MindMapContext } = body

    // 验证请求参数
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      )
    }

    // 调用AI服务
    const response = await aiService.sendMessage(message, context)

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('AI聊天API错误:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '服务器内部错误',
        success: false 
      },
      { status: 500 }
    )
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
