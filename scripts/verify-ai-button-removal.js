#!/usr/bin/env node

/**
 * 验证AI按钮移除脚本
 * 检查工具栏配置中是否已成功移除AI按钮
 */

const fs = require('fs');
const path = require('path');

function verifyAIButtonRemoval() {
  console.log('🔍 开始验证AI按钮移除...\n');
  
  let allTestsPassed = true;
  
  // 测试1: 检查Toolbar.vue文件中的defaultBtnList
  console.log('📋 测试1: 检查工具栏配置文件...');
  
  try {
    const toolbarPath = path.join(__dirname, '../web/src/pages/Edit/components/Toolbar.vue');
    const toolbarContent = fs.readFileSync(toolbarPath, 'utf8');
    
    // 检查defaultBtnList是否包含'ai'
    const defaultBtnListMatch = toolbarContent.match(/const defaultBtnList = \[([\s\S]*?)\]/);
    
    if (defaultBtnListMatch) {
      const btnListContent = defaultBtnListMatch[1];
      
      // 检查是否包含未注释的'ai'
      const hasActiveAI = btnListContent.includes("'ai'") && !btnListContent.includes("// 'ai'");
      
      if (!hasActiveAI) {
        console.log('✅ AI按钮已从defaultBtnList中移除');
      } else {
        console.log('❌ AI按钮仍在defaultBtnList中');
        allTestsPassed = false;
      }
      
      // 检查是否有注释说明
      if (btnListContent.includes("// 'ai'") || btnListContent.includes('// 移除AI按钮')) {
        console.log('✅ 找到AI按钮移除的注释说明');
      } else {
        console.log('⚠️  未找到AI按钮移除的注释说明');
      }
    } else {
      console.log('❌ 无法找到defaultBtnList配置');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ 读取Toolbar.vue文件失败:', error.message);
    allTestsPassed = false;
  }
  
  // 测试2: 检查btnLit计算属性是否已更新
  console.log('\n📋 测试2: 检查计算属性逻辑...');
  
  try {
    const toolbarPath = path.join(__dirname, '../web/src/pages/Edit/components/Toolbar.vue');
    const toolbarContent = fs.readFileSync(toolbarPath, 'utf8');
    
    // 检查btnLit计算属性
    const btnLitMatch = toolbarContent.match(/btnLit\(\)\s*\{([\s\S]*?)\}/);
    
    if (btnLitMatch) {
      const btnLitContent = btnLitMatch[1];
      
      // 检查是否还有AI相关的过滤逻辑
      const hasAIFilter = btnLitContent.includes("item !== 'ai'");
      
      if (!hasAIFilter) {
        console.log('✅ AI按钮过滤逻辑已移除');
      } else {
        console.log('❌ AI按钮过滤逻辑仍然存在');
        allTestsPassed = false;
      }
      
      // 检查是否有相关注释
      if (btnLitContent.includes('AI按钮已从defaultBtnList中移除')) {
        console.log('✅ 找到相关的注释说明');
      } else {
        console.log('⚠️  未找到相关的注释说明');
      }
    } else {
      console.log('❌ 无法找到btnLit计算属性');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ 检查计算属性失败:', error.message);
    allTestsPassed = false;
  }
  
  // 测试3: 检查ToolbarNodeBtnList.vue中的AI按钮模板
  console.log('\n📋 测试3: 检查按钮列表组件...');
  
  try {
    const btnListPath = path.join(__dirname, '../web/src/pages/Edit/components/ToolbarNodeBtnList.vue');
    const btnListContent = fs.readFileSync(btnListPath, 'utf8');
    
    // 检查是否仍有AI按钮的模板代码
    const hasAITemplate = btnListContent.includes("v-if=\"item === 'ai'\"");
    
    if (hasAITemplate) {
      console.log('ℹ️  AI按钮模板代码仍然存在（这是正常的，因为可能需要保留以备将来使用）');
    } else {
      console.log('ℹ️  AI按钮模板代码不存在');
    }
    
    // 检查AI相关的方法
    const hasAIMethod = btnListContent.includes('aiCrate()');
    
    if (hasAIMethod) {
      console.log('ℹ️  AI相关方法仍然存在（这是正常的，因为可能需要保留以备将来使用）');
    } else {
      console.log('ℹ️  AI相关方法不存在');
    }
    
  } catch (error) {
    console.log('❌ 检查按钮列表组件失败:', error.message);
    allTestsPassed = false;
  }
  
  // 测试4: 检查是否有语法错误
  console.log('\n📋 测试4: 检查语法完整性...');
  
  try {
    const toolbarPath = path.join(__dirname, '../web/src/pages/Edit/components/Toolbar.vue');
    const toolbarContent = fs.readFileSync(toolbarPath, 'utf8');
    
    // 简单的语法检查
    const openBrackets = (toolbarContent.match(/\[/g) || []).length;
    const closeBrackets = (toolbarContent.match(/\]/g) || []).length;
    
    if (openBrackets === closeBrackets) {
      console.log('✅ 数组括号匹配正确');
    } else {
      console.log('❌ 数组括号不匹配');
      allTestsPassed = false;
    }
    
    // 检查是否有未闭合的注释
    const commentStart = (toolbarContent.match(/\/\*/g) || []).length;
    const commentEnd = (toolbarContent.match(/\*\//g) || []).length;
    
    if (commentStart === commentEnd) {
      console.log('✅ 注释语法正确');
    } else {
      console.log('❌ 注释语法错误');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ 语法检查失败:', error.message);
    allTestsPassed = false;
  }
  
  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 AI按钮移除验证通过！');
    console.log('✨ 工具栏中的AI按钮已成功移除');
    console.log('📝 建议：');
    console.log('   - 重新构建项目以确保更改生效');
    console.log('   - 在浏览器中测试确认AI按钮不再显示');
  } else {
    console.log('❌ AI按钮移除验证失败，请检查修改');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
}

// 运行验证
if (require.main === module) {
  verifyAIButtonRemoval().then ? 
    verifyAIButtonRemoval().then(success => {
      process.exit(success ? 0 : 1);
    }).catch(error => {
      console.error('验证执行失败:', error);
      process.exit(1);
    }) :
    (() => {
      const success = verifyAIButtonRemoval();
      process.exit(success ? 0 : 1);
    })();
}

module.exports = { verifyAIButtonRemoval };
