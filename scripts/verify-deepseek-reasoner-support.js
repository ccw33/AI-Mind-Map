#!/usr/bin/env node

/**
 * 验证deepseek-reasoner模型支持的综合测试脚本
 * 包括代码层面验证和浏览器环境验证
 */

const fs = require('fs');
const path = require('path');

// 模拟浏览器环境的localStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  
  getItem(key) {
    return this.store[key] || null;
  }
  
  setItem(key, value) {
    this.store[key] = value;
  }
  
  removeItem(key) {
    delete this.store[key];
  }
  
  clear() {
    this.store = {};
  }
}

// 设置全局变量模拟浏览器环境
global.localStorage = new MockLocalStorage();
global.console = console;

async function verifyDeepSeekReasonerSupport() {
  console.log('🔍 开始验证deepseek-reasoner模型支持...\n');
  
  let allTestsPassed = true;
  const testResults = [];
  
  // 测试1: 验证AI配置文件中的deepseek-reasoner模型
  console.log('📋 测试1: 验证AI配置文件中的deepseek-reasoner模型...');
  
  try {
    const configPath = path.join(__dirname, '../web/src/lib/ai-config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // 检查DeepSeek提供商配置
    const deepseekConfigMatch = configContent.match(/\[AI_PROVIDERS\.DEEPSEEK\]:\s*\{([\s\S]*?)\}/);
    
    if (deepseekConfigMatch) {
      const deepseekConfig = deepseekConfigMatch[1];
      
      // 检查是否包含deepseek-reasoner模型
      const hasDeepSeekReasoner = deepseekConfig.includes('deepseek-reasoner');
      
      if (hasDeepSeekReasoner) {
        console.log('✅ deepseek-reasoner模型已添加到DeepSeek提供商配置');
        testResults.push({ test: 'AI配置文件', status: 'PASS', details: 'deepseek-reasoner模型存在' });
      } else {
        console.log('❌ deepseek-reasoner模型未在DeepSeek提供商配置中找到');
        allTestsPassed = false;
        testResults.push({ test: 'AI配置文件', status: 'FAIL', details: 'deepseek-reasoner模型不存在' });
      }
      
      // 检查其他模型是否仍然存在
      const hasDeepSeekChat = deepseekConfig.includes('deepseek-chat');
      const hasDeepSeekCoder = deepseekConfig.includes('deepseek-coder');
      
      console.log(`   - deepseek-chat: ${hasDeepSeekChat ? '✅' : '❌'}`);
      console.log(`   - deepseek-coder: ${hasDeepSeekCoder ? '✅' : '❌'}`);
      console.log(`   - deepseek-reasoner: ${hasDeepSeekReasoner ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ 无法找到DeepSeek提供商配置');
      allTestsPassed = false;
      testResults.push({ test: 'AI配置文件', status: 'FAIL', details: 'DeepSeek提供商配置不存在' });
    }
    
  } catch (error) {
    console.log('❌ 读取AI配置文件失败:', error.message);
    allTestsPassed = false;
    testResults.push({ test: 'AI配置文件', status: 'ERROR', details: error.message });
  }
  
  // 测试2: 动态加载AI配置模块并测试
  console.log('\n📋 测试2: 动态加载AI配置模块并测试...');
  
  try {
    // 读取AI配置文件内容
    const configPath = path.join(__dirname, '../web/src/lib/ai-config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // 转换ES6模块为CommonJS（简单处理）
    configContent = configContent
      .replace(/export const/g, 'const')
      .replace(/export function/g, 'function')
      .replace(/export \{[^}]+\}/g, '');
    
    // 添加导出语句
    configContent += `
module.exports = {
  AI_PROVIDERS,
  DEFAULT_AI_CONFIG,
  DEFAULT_MINDMAP_AI_CONFIG,
  getLocalAIConfig,
  saveLocalAIConfig,
  getCurrentAIConfig,
  validateAIConfig,
  getProviderConfig,
  debugLog,
  getMindMapAIConfig,
  saveMindMapAIConfig
};
`;
    
    // 写入临时文件并导入
    const tempPath = path.join(__dirname, 'temp-ai-config-test.js');
    fs.writeFileSync(tempPath, configContent);
    
    const aiConfig = require(tempPath);
    
    // 清理临时文件
    fs.unlinkSync(tempPath);
    
    // 测试getProviderConfig函数
    const deepseekConfig = aiConfig.getProviderConfig('deepseek');
    
    if (deepseekConfig && deepseekConfig.models) {
      const hasDeepSeekReasoner = deepseekConfig.models.includes('deepseek-reasoner');
      
      if (hasDeepSeekReasoner) {
        console.log('✅ getProviderConfig函数返回的DeepSeek配置包含deepseek-reasoner');
        console.log('   可用模型:', deepseekConfig.models);
        testResults.push({ test: '动态模块加载', status: 'PASS', details: 'deepseek-reasoner在模型列表中' });
      } else {
        console.log('❌ getProviderConfig函数返回的DeepSeek配置不包含deepseek-reasoner');
        console.log('   可用模型:', deepseekConfig.models);
        allTestsPassed = false;
        testResults.push({ test: '动态模块加载', status: 'FAIL', details: 'deepseek-reasoner不在模型列表中' });
      }
    } else {
      console.log('❌ 无法获取DeepSeek提供商配置');
      allTestsPassed = false;
      testResults.push({ test: '动态模块加载', status: 'FAIL', details: '无法获取DeepSeek配置' });
    }
    
    // 测试配置验证
    const testConfig = {
      provider: 'deepseek',
      apiKey: 'sk-test-key',
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-reasoner',
      timeout: 30000,
      debugMode: false
    };
    
    const isValid = aiConfig.validateAIConfig(testConfig);
    
    if (isValid) {
      console.log('✅ deepseek-reasoner配置验证通过');
      testResults.push({ test: '配置验证', status: 'PASS', details: 'deepseek-reasoner配置有效' });
    } else {
      console.log('❌ deepseek-reasoner配置验证失败');
      allTestsPassed = false;
      testResults.push({ test: '配置验证', status: 'FAIL', details: 'deepseek-reasoner配置无效' });
    }
    
  } catch (error) {
    console.log('❌ 动态加载AI配置模块失败:', error.message);
    allTestsPassed = false;
    testResults.push({ test: '动态模块加载', status: 'ERROR', details: error.message });
  }
  
  // 测试3: 检查AI服务文件兼容性
  console.log('\n📋 测试3: 检查AI服务文件兼容性...');
  
  try {
    const servicePath = path.join(__dirname, '../web/src/lib/ai-service.js');
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    // 检查是否使用OpenAI兼容的API
    const hasOpenAICompatible = serviceContent.includes('openai') || 
                                serviceContent.includes('OpenAI') ||
                                serviceContent.includes('/v1/chat/completions');
    
    if (hasOpenAICompatible) {
      console.log('✅ AI服务使用OpenAI兼容API，支持DeepSeek');
      testResults.push({ test: 'AI服务兼容性', status: 'PASS', details: '使用OpenAI兼容API' });
    } else {
      console.log('⚠️  AI服务可能不使用OpenAI兼容API');
      testResults.push({ test: 'AI服务兼容性', status: 'WARNING', details: '可能不使用OpenAI兼容API' });
    }
    
  } catch (error) {
    console.log('❌ 读取AI服务文件失败:', error.message);
    testResults.push({ test: 'AI服务兼容性', status: 'ERROR', details: error.message });
  }
  
  // 测试4: 检查前端组件支持
  console.log('\n📋 测试4: 检查前端组件支持...');
  
  try {
    const dialogPath = path.join(__dirname, '../web/src/pages/Edit/components/AiConfigDialog.vue');
    const dialogContent = fs.readFileSync(dialogPath, 'utf8');
    
    // 检查是否动态显示模型列表
    const hasDynamicModels = dialogContent.includes('currentProviderConfig.models') ||
                             dialogContent.includes('providerConfig.models');
    
    if (hasDynamicModels) {
      console.log('✅ AI配置对话框支持动态模型列表');
      testResults.push({ test: '前端组件支持', status: 'PASS', details: '支持动态模型列表' });
    } else {
      console.log('⚠️  AI配置对话框可能不支持动态模型列表');
      testResults.push({ test: '前端组件支持', status: 'WARNING', details: '可能不支持动态模型列表' });
    }
    
  } catch (error) {
    console.log('❌ 读取AI配置对话框文件失败:', error.message);
    testResults.push({ test: '前端组件支持', status: 'ERROR', details: error.message });
  }
  
  // 输出测试结果摘要
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果摘要:');
  console.log('='.repeat(60));
  
  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  const errorCount = testResults.filter(r => r.status === 'ERROR').length;
  const warningCount = testResults.filter(r => r.status === 'WARNING').length;
  
  testResults.forEach(result => {
    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '💥',
      'WARNING': '⚠️'
    }[result.status];
    
    console.log(`${statusIcon} ${result.test}: ${result.details}`);
  });
  
  console.log('\n' + '-'.repeat(60));
  console.log(`总计: ${testResults.length} 项测试`);
  console.log(`通过: ${passCount} | 失败: ${failCount} | 错误: ${errorCount} | 警告: ${warningCount}`);
  
  if (allTestsPassed && failCount === 0 && errorCount === 0) {
    console.log('\n🎉 所有关键测试通过！deepseek-reasoner模型支持已成功集成');
    console.log('✨ 用户现在可以在AI配置中选择deepseek-reasoner模型');
    console.log('\n📝 使用说明:');
    console.log('1. 在AI配置对话框中选择"DeepSeek"作为提供商');
    console.log('2. 在模型下拉菜单中选择"deepseek-reasoner"');
    console.log('3. 输入有效的DeepSeek API Key');
    console.log('4. 保存配置并开始使用');
  } else {
    console.log('\n❌ 部分测试失败，deepseek-reasoner支持可能不完整');
    if (failCount > 0 || errorCount > 0) {
      console.log('⚠️  建议检查失败的测试项目并修复相关问题');
    }
  }
  
  console.log('='.repeat(60));
  
  return allTestsPassed && failCount === 0 && errorCount === 0;
}

// 运行验证
if (require.main === module) {
  verifyDeepSeekReasonerSupport().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('验证执行失败:', error);
    process.exit(1);
  });
}

module.exports = { verifyDeepSeekReasonerSupport };
