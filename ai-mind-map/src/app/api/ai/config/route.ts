// AI配置API路由 - 获取AI配置信息

import { NextResponse } from 'next/server'
import { getAvailableProviders, getCurrentAIConfig } from '@/lib/ai-config'

export async function GET() {
  try {
    const currentConfig = getCurrentAIConfig()
    const availableProviders = getAvailableProviders()

    return NextResponse.json({
      success: true,
      data: {
        currentProvider: currentConfig.provider,
        currentModel: currentConfig.model,
        availableProviders,
        debugMode: currentConfig.debugMode
      }
    })

  } catch (error) {
    console.error('获取AI配置失败:', error)
    
    return NextResponse.json(
      { 
        error: '获取配置失败',
        success: false 
      },
      { status: 500 }
    )
  }
}
