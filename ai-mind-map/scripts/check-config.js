#!/usr/bin/env node

// AI配置检查脚本 - 验证AI服务配置是否正确

const fs = require('fs')
const path = require('path')

console.log('🔍 AI配置检查工具')
console.log('==================')

// 检查环境变量文件
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), '.env.local.example')

if (!fs.existsSync(envPath)) {
  console.log('❌ 未找到 .env.local 文件')

  if (fs.existsSync(envExamplePath)) {
    console.log('💡 建议: 运行以下命令创建配置文件:')
    console.log('   cp .env.local.example .env.local')
  }

  process.exit(1)
}

console.log('✅ 找到 .env.local 文件')

// 读取环境变量
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key] = valueParts.join('=')
    }
  }
})

console.log('\n📋 配置检查结果:')
console.log('================')

// 检查默认提供商
const defaultProvider = envVars.DEFAULT_AI_PROVIDER || 'openai'
console.log(`🎯 默认AI提供商: ${defaultProvider}`)

// 检查各个提供商的配置
const providers = {
  openai: {
    name: 'OpenAI',
    required: ['OPENAI_API_KEY'],
    optional: ['OPENAI_DEFAULT_MODEL', 'OPENAI_API_BASE_URL']
  },
  azure: {
    name: 'Azure OpenAI',
    required: ['AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT', 'AZURE_OPENAI_DEPLOYMENT_NAME'],
    optional: ['AZURE_OPENAI_API_VERSION']
  },
  anthropic: {
    name: 'Anthropic Claude',
    required: ['ANTHROPIC_API_KEY'],
    optional: ['ANTHROPIC_DEFAULT_MODEL']
  },
  google: {
    name: 'Google Gemini',
    required: ['GOOGLE_AI_API_KEY'],
    optional: ['GOOGLE_DEFAULT_MODEL']
  },
  deepseek: {
    name: 'DeepSeek',
    required: ['DEEPSEEK_API_KEY'],
    optional: ['DEEPSEEK_DEFAULT_MODEL', 'DEEPSEEK_API_BASE_URL']
  },
  ollama: {
    name: 'Ollama (本地)',
    required: [],
    optional: ['OLLAMA_API_BASE_URL', 'OLLAMA_DEFAULT_MODEL']
  }
}

let hasValidConfig = false

Object.entries(providers).forEach(([id, config]) => {
  console.log(`\n${config.name}:`)

  const isCurrentProvider = defaultProvider === id
  const requiredMissing = config.required.filter(key => !envVars[key] || envVars[key].trim() === '')
  const hasRequired = requiredMissing.length === 0

  if (hasRequired) {
    console.log(`  ✅ 配置完整${isCurrentProvider ? ' (当前使用)' : ''}`)
    if (isCurrentProvider) {
      hasValidConfig = true
    }
  } else {
    console.log(`  ❌ 缺少必需配置${isCurrentProvider ? ' (当前使用)' : ''}`)
    requiredMissing.forEach(key => {
      console.log(`     - ${key}`)
    })
  }

  // 显示可选配置
  const optionalConfigured = config.optional.filter(key => envVars[key] && envVars[key].trim() !== '')
  if (optionalConfigured.length > 0) {
    console.log(`  📝 可选配置: ${optionalConfigured.join(', ')}`)
  }
})

// 检查通用配置
console.log('\n⚙️  通用配置:')
const generalConfigs = [
  'AI_REQUEST_TIMEOUT',
  'AI_MAX_RETRIES',
  'AI_DEBUG_MODE',
  'AI_SUGGESTION_COUNT',
  'AI_MAX_RESPONSE_LENGTH',
  'AI_ENABLE_CONTEXT_MEMORY',
  'AI_CONTEXT_MEMORY_ROUNDS'
]

generalConfigs.forEach(key => {
  const value = envVars[key]
  if (value) {
    console.log(`  ✅ ${key}: ${value}`)
  } else {
    console.log(`  ⚪ ${key}: 使用默认值`)
  }
})

// 总结
console.log('\n📊 配置总结:')
console.log('============')

if (hasValidConfig) {
  console.log('✅ AI服务配置正确，可以正常使用')
} else {
  console.log('❌ 当前AI提供商配置不完整')
  console.log('💡 建议:')
  console.log('   1. 检查 .env.local 文件中的配置')
  console.log('   2. 参考 AI_CONFIG_GUIDE.md 获取详细说明')
  console.log('   3. 运行设置脚本: ./scripts/setup.sh (Linux/macOS) 或 scripts\\setup.bat (Windows)')
}

// 检查API连接（可选）
if (hasValidConfig && process.argv.includes('--test-connection')) {
  console.log('\n🔗 测试API连接...')
  console.log('(此功能需要启动应用后在浏览器中测试)')
}

console.log('\n🚀 准备就绪！运行 npm run dev 启动应用')
