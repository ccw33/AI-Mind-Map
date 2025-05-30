#!/usr/bin/env node

/**
 * 验证"重要提示"弹窗移除脚本
 * 检查Edit.vue文件中的webTip()调用是否已被注释或移除
 */

const fs = require('fs');
const path = require('path');

function verifyImportantTipRemoval() {
  console.log('🔍 开始验证"重要提示"弹窗移除...\n');
  
  let allTestsPassed = true;
  
  // 测试1: 检查Edit.vue文件中的webTip()调用
  console.log('📋 测试1: 检查Edit.vue文件中的webTip()调用...');
  
  try {
    const editPath = path.join(__dirname, '../web/src/pages/Edit/components/Edit.vue');
    const editContent = fs.readFileSync(editPath, 'utf8');
    
    // 检查mounted生命周期中的webTip()调用
    const mountedMatch = editContent.match(/mounted\(\)\s*\{([\s\S]*?)\}/);
    
    if (mountedMatch) {
      const mountedContent = mountedMatch[1];
      
      // 检查是否有未注释的webTip()调用
      const hasActiveWebTip = mountedContent.includes('this.webTip()') && 
                              !mountedContent.includes('// this.webTip()');
      
      if (!hasActiveWebTip) {
        console.log('✅ webTip()调用已被注释或移除');
      } else {
        console.log('❌ webTip()调用仍然活跃');
        allTestsPassed = false;
      }
      
      // 检查是否有注释说明
      if (mountedContent.includes('// this.webTip()') || 
          mountedContent.includes('移除重要提示弹窗')) {
        console.log('✅ 找到webTip()移除的注释说明');
      } else {
        console.log('⚠️  未找到webTip()移除的注释说明');
      }
    } else {
      console.log('❌ 无法找到mounted生命周期方法');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ 读取Edit.vue文件失败:', error.message);
    allTestsPassed = false;
  }
  
  // 测试2: 检查webTip()方法是否仍然存在（保留以备将来使用）
  console.log('\n📋 测试2: 检查webTip()方法定义...');
  
  try {
    const editPath = path.join(__dirname, '../web/src/pages/Edit/components/Edit.vue');
    const editContent = fs.readFileSync(editPath, 'utf8');
    
    // 检查webTip方法定义
    const hasWebTipMethod = editContent.includes('webTip()');
    
    if (hasWebTipMethod) {
      console.log('ℹ️  webTip()方法定义仍然存在（这是正常的，保留以备将来使用）');
    } else {
      console.log('ℹ️  webTip()方法定义不存在');
    }
    
    // 检查showDownloadTip方法是否存在
    const hasShowDownloadTipMethod = editContent.includes('showDownloadTip(');
    
    if (hasShowDownloadTipMethod) {
      console.log('ℹ️  showDownloadTip()方法仍然存在（这是正常的，可能被其他地方使用）');
    } else {
      console.log('ℹ️  showDownloadTip()方法不存在');
    }
    
  } catch (error) {
    console.log('❌ 检查方法定义失败:', error.message);
    allTestsPassed = false;
  }
  
  // 测试3: 检查语言文件中的相关文本
  console.log('\n📋 测试3: 检查语言文件中的相关文本...');
  
  try {
    const langPath = path.join(__dirname, '../web/src/lang/zh_cn.js');
    const langContent = fs.readFileSync(langPath, 'utf8');
    
    // 检查是否包含"重要提示"相关的文本
    const hasImportantTipText = langContent.includes('重要提示') || 
                                langContent.includes('网页版已暂停更新');
    
    if (hasImportantTipText) {
      console.log('ℹ️  语言文件中仍包含"重要提示"相关文本（这是正常的，可能被其他功能使用）');
    } else {
      console.log('ℹ️  语言文件中不包含"重要提示"相关文本');
    }
    
  } catch (error) {
    console.log('⚠️  检查语言文件失败:', error.message);
    // 这不是关键错误，不影响整体测试结果
  }
  
  // 测试4: 检查localStorage相关逻辑
  console.log('\n📋 测试4: 检查localStorage相关逻辑...');
  
  try {
    const editPath = path.join(__dirname, '../web/src/pages/Edit/components/Edit.vue');
    const editContent = fs.readFileSync(editPath, 'utf8');
    
    // 检查webUseTip相关的localStorage逻辑
    const hasWebUseTipLogic = editContent.includes('webUseTip');
    
    if (hasWebUseTipLogic) {
      console.log('ℹ️  webUseTip相关的localStorage逻辑仍然存在（这是正常的，在webTip方法中）');
    } else {
      console.log('ℹ️  webUseTip相关的localStorage逻辑不存在');
    }
    
  } catch (error) {
    console.log('❌ 检查localStorage逻辑失败:', error.message);
    allTestsPassed = false;
  }
  
  // 测试5: 检查语法完整性
  console.log('\n📋 测试5: 检查语法完整性...');
  
  try {
    const editPath = path.join(__dirname, '../web/src/pages/Edit/components/Edit.vue');
    const editContent = fs.readFileSync(editPath, 'utf8');
    
    // 简单的语法检查
    const openBraces = (editContent.match(/\{/g) || []).length;
    const closeBraces = (editContent.match(/\}/g) || []).length;
    
    if (openBraces === closeBraces) {
      console.log('✅ 大括号匹配正确');
    } else {
      console.log('❌ 大括号不匹配');
      allTestsPassed = false;
    }
    
    const openParens = (editContent.match(/\(/g) || []).length;
    const closeParens = (editContent.match(/\)/g) || []).length;
    
    if (openParens === closeParens) {
      console.log('✅ 圆括号匹配正确');
    } else {
      console.log('❌ 圆括号不匹配');
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ 语法检查失败:', error.message);
    allTestsPassed = false;
  }
  
  // 输出测试结果
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 "重要提示"弹窗移除验证通过！');
    console.log('✨ 页面加载时不再显示"重要提示"弹窗');
    console.log('📝 建议：');
    console.log('   - 清除浏览器缓存以确保更改生效');
    console.log('   - 在浏览器中测试确认弹窗不再出现');
    console.log('   - 如果需要恢复弹窗，取消注释webTip()调用即可');
  } else {
    console.log('❌ "重要提示"弹窗移除验证失败，请检查修改');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
}

// 运行验证
if (require.main === module) {
  const success = verifyImportantTipRemoval();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyImportantTipRemoval };
