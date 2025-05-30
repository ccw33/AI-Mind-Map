#!/usr/bin/env node

/**
 * DeepSeek Reasoner 模型测试脚本
 * 用于验证 deepseek-reasoner 模型是否正确集成到AI配置中
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

// 动态导入AI配置模块
async function loadAIConfig() {
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
    const tempPath = path.join(__dirname, 'temp-ai-config.js');
    fs.writeFileSync(tempPath, configContent);
    
    const aiConfig = require(tempPath);
    
    // 清理临时文件
    fs.unlinkSync(tempPath);
    
    return aiConfig;
  } catch (error) {
    console.error('加载AI配置失败:', error);
    return null;
  }
}

// 测试函数
async function testDeepSeekReasoner() {
  console.log('🚀 开始测试 DeepSeek Reasoner 模型集成...\n');
  
  const aiConfig = await loadAIConfig();
  if (!aiConfig) {
    console.error('❌ 无法加载AI配置模块');
    return false;
  }
  
  let allTestsPassed = true;
  
  // 测试1: 检查AI_PROVIDERS是否包含DEEPSEEK
  console.log('📋 测试1: 检查AI提供商配置...');
  if (aiConfig.AI_PROVIDERS.DEEPSEEK === 'deepseek') {
    console.log('✅ DEEPSEEK提供商配置正确');
  } else {
    console.log('❌ DEEPSEEK提供商配置错误');
    allTestsPassed = false;
  }
  
  // 测试2: 检查DeepSeek提供商配置
  console.log('\n📋 测试2: 检查DeepSeek提供商详细配置...');
  const deepseekConfig = aiConfig.getProviderConfig('deepseek');
  
  if (deepseekConfig.name === 'DeepSeek') {
    console.log('✅ DeepSeek名称配置正确');
  } else {
    console.log('❌ DeepSeek名称配置错误:', deepseekConfig.name);
    allTestsPassed = false;
  }
  
  if (deepseekConfig.baseURL === 'https://api.deepseek.com/v1') {
    console.log('✅ DeepSeek API URL配置正确');
  } else {
    console.log('❌ DeepSeek API URL配置错误:', deepseekConfig.baseURL);
    allTestsPassed = false;
  }
  
  if (deepseekConfig.requiresApiKey === true) {
    console.log('✅ DeepSeek API Key要求配置正确');
  } else {
    console.log('❌ DeepSeek API Key要求配置错误');
    allTestsPassed = false;
  }
  
  // 测试3: 检查deepseek-reasoner模型是否在模型列表中
  console.log('\n📋 测试3: 检查deepseek-reasoner模型...');
  const models = deepseekConfig.models;
  console.log('可用模型:', models);
  
  if (models.includes('deepseek-reasoner')) {
    console.log('✅ deepseek-reasoner模型已正确添加到模型列表');
  } else {
    console.log('❌ deepseek-reasoner模型未在模型列表中找到');
    allTestsPassed = false;
  }
  
  if (models.includes('deepseek-chat')) {
    console.log('✅ deepseek-chat模型存在（向后兼容）');
  } else {
    console.log('⚠️  deepseek-chat模型不存在');
  }
  
  if (models.includes('deepseek-coder')) {
    console.log('✅ deepseek-coder模型存在（向后兼容）');
  } else {
    console.log('⚠️  deepseek-coder模型不存在');
  }
  
  // 测试4: 测试配置验证
  console.log('\n📋 测试4: 测试配置验证功能...');
  
  const validConfig = {
    provider: 'deepseek',
    apiKey: 'test-key',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-reasoner',
    timeout: 30000,
    debugMode: false
  };
  
  if (aiConfig.validateAIConfig(validConfig)) {
    console.log('✅ 有效的deepseek-reasoner配置验证通过');
  } else {
    console.log('❌ 有效的deepseek-reasoner配置验证失败');
    allTestsPassed = false;
  }
  
  const invalidConfig = {
    provider: 'deepseek',
    // 缺少apiKey
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-reasoner',
    timeout: 30000,
    debugMode: false
  };
  
  if (!aiConfig.validateAIConfig(invalidConfig)) {
    console.log('✅ 无效配置（缺少API Key）正确被拒绝');
  } else {
    console.log('❌ 无效配置（缺少API Key）错误地通过验证');
    allTestsPassed = false;
  }
  
  // 测试5: 测试配置保存和读取
  console.log('\n📋 测试5: 测试配置保存和读取...');
  
  const testConfig = {
    provider: 'deepseek',
    apiKey: 'sk-test-key-12345',
    baseURL: 'https://api.deepseek.com/v1',
    model: 'deepseek-reasoner',
    timeout: 45000,
    debugMode: true
  };
  
  if (aiConfig.saveLocalAIConfig(testConfig)) {
    console.log('✅ 配置保存成功');
    
    const savedConfig = aiConfig.getCurrentAIConfig();
    if (savedConfig.model === 'deepseek-reasoner' && savedConfig.provider === 'deepseek') {
      console.log('✅ 配置读取成功，deepseek-reasoner模型配置正确');
    } else {
      console.log('❌ 配置读取失败或模型配置错误');
      console.log('保存的配置:', savedConfig);
      allTestsPassed = false;
    }
  } else {
    console.log('❌ 配置保存失败');
    allTestsPassed = false;
  }
  
  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 所有测试通过！deepseek-reasoner模型已成功集成');
    console.log('✨ 用户现在可以在AI配置中选择deepseek-reasoner模型');
  } else {
    console.log('❌ 部分测试失败，请检查配置');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
}

// 运行测试
if (require.main === module) {
  testDeepSeekReasoner().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { testDeepSeekReasoner };
