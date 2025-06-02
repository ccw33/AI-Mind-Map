#!/usr/bin/env node

/**
 * 测试JSON清理功能的脚本
 * 验证流式响应中JSON片段的正确清理
 */

// 模拟cleanResponseContentForDisplay函数
function cleanResponseContentForDisplay(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  let cleaned = content;

  // 1. 移除完整的JSON代码块
  cleaned = cleaned.replace(/```json[\s\S]*?```/g, '');

  // 2. 移除不完整的JSON代码块（可能因为流式响应中断）
  // 查找```json开始但没有结束的部分
  const jsonStartIndex = cleaned.lastIndexOf('```json');
  if (jsonStartIndex !== -1) {
    const afterJsonStart = cleaned.substring(jsonStartIndex);
    // 如果没有找到对应的结束标记，说明JSON块不完整
    if (!afterJsonStart.includes('```', 7)) { // 7是'```json'的长度
      cleaned = cleaned.substring(0, jsonStartIndex);
    }
  }

  // 3. 移除可能的JSON片段（以{开始的行）
  const lines = cleaned.split('\n');
  const filteredLines = [];
  let inJsonBlock = false;
  let jsonBraceCount = 0;
  let jsonStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 检测JSON块开始 - 更严格的检测
    if (!inJsonBlock && (trimmed === '{' || trimmed.startsWith('{"') || trimmed.includes('"structuredPoints"'))) {
      inJsonBlock = true;
      jsonStartLine = i;
      jsonBraceCount = (trimmed.match(/\{/g) || []).length - (trimmed.match(/\}/g) || []).length;
      continue;
    }

    // 如果在JSON块中
    if (inJsonBlock) {
      // 更新括号计数
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;
      jsonBraceCount += openBraces - closeBraces;

      // 检测JSON块结束 - 当括号平衡时
      if (jsonBraceCount <= 0) {
        inJsonBlock = false;
        jsonBraceCount = 0;
        jsonStartLine = -1;
        continue;
      }

      // 检测是否是不完整的JSON块的多种情况
      const shouldExitJsonBlock = (
        // 1. 超过10行还没结束，可能是误判
        (i - jsonStartLine > 10) ||
        // 2. 遇到明显的非JSON内容（如中文段落、Markdown标题等）
        (trimmed && !trimmed.includes('"') && !trimmed.includes('{') && !trimmed.includes('}') &&
         !trimmed.includes('[') && !trimmed.includes(']') && !trimmed.includes(',') &&
         (trimmed.length > 10 || /^[#\-*]/.test(trimmed) || /[\u4e00-\u9fa5]{3,}/.test(trimmed)))
      );

      if (shouldExitJsonBlock) {
        inJsonBlock = false;
        jsonBraceCount = 0;
        jsonStartLine = -1;
        // 将当前行作为正常内容处理
        filteredLines.push(line);
        continue;
      }

      // 跳过JSON块中的内容
      continue;
    }

    // 额外检查：跳过明显的JSON属性行
    if (trimmed.includes('"id":') || trimmed.includes('"title":') ||
        trimmed.includes('"content":') || trimmed.includes('"keywords":') ||
        trimmed.includes('structuredPoints')) {
      continue;
    }

    // 保留非JSON内容
    filteredLines.push(line);
  }

  cleaned = filteredLines.join('\n');

  // 4. 清理多余的空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // 最多保留两个连续换行
  cleaned = cleaned.trim();

  return cleaned;
}

// 测试用例
function runTests() {
  console.log('🧪 开始测试JSON清理功能\n');

  let passCount = 0;
  let failCount = 0;

  // 测试1: 完整的JSON代码块
  console.log('测试1: 完整的JSON代码块');
  const test1Input = `这是正常内容

\`\`\`json
{
  "structuredPoints": [
    {
      "id": "point_1",
      "title": "测试标题",
      "content": "测试内容"
    }
  ]
}
\`\`\`

这是后续内容`;

  const test1Result = cleanResponseContentForDisplay(test1Input);
  const test1Expected = `这是正常内容

这是后续内容`;

  if (test1Result.trim() === test1Expected.trim()) {
    console.log('✅ 测试1通过');
    passCount++;
  } else {
    console.log('❌ 测试1失败');
    console.log('期望:', test1Expected);
    console.log('实际:', test1Result);
    failCount++;
  }

  // 测试2: 不完整的JSON代码块（流式响应中断）
  console.log('\n测试2: 不完整的JSON代码块');
  const test2Input = `这是正常内容

\`\`\`json
{
  "structuredPoints": [
    {
      "id": "point_1",
      "title": "测试标题",
      "content": "测试内容但是被中断了`;

  const test2Result = cleanResponseContentForDisplay(test2Input);
  const test2Expected = `这是正常内容`;

  if (test2Result.trim() === test2Expected.trim()) {
    console.log('✅ 测试2通过');
    passCount++;
  } else {
    console.log('❌ 测试2失败');
    console.log('期望:', test2Expected);
    console.log('实际:', test2Result);
    failCount++;
  }

  // 测试3: 裸JSON片段（没有代码块标记）
  console.log('\n测试3: 裸JSON片段');
  const test3Input = `这是正常内容

{
  "id": "point_1",
  "title": "测试标题",
  "content": "测试内容"
}

这是后续内容`;

  const test3Result = cleanResponseContentForDisplay(test3Input);
  const test3Expected = `这是正常内容

这是后续内容`;

  if (test3Result.trim() === test3Expected.trim()) {
    console.log('✅ 测试3通过');
    passCount++;
  } else {
    console.log('❌ 测试3失败');
    console.log('期望:', test3Expected);
    console.log('实际:', test3Result);
    failCount++;
  }

  // 测试4: 混合内容（正常文本中包含JSON片段）
  console.log('\n测试4: 混合内容');
  const test4Input = `## 风险控制价值

基于企业抵御经济衰退或行业危机的能力强，它们有存活能力。

{
  "id": "point_2",
  "title": "增强抗周期能力",
  "content": "龙头企业抵御经济衰退或行业危机的能力强，具有更强的生存能力和抗风险能力。",
  "keywords": ["抗周期", "经济衰退", "护城河"]
}

这是后续的正常内容`;

  const test4Result = cleanResponseContentForDisplay(test4Input);
  const test4Expected = `## 风险控制价值

基于企业抵御经济衰退或行业危机的能力强，它们有存活能力。

这是后续的正常内容`;

  if (test4Result.trim() === test4Expected.trim()) {
    console.log('✅ 测试4通过');
    passCount++;
  } else {
    console.log('❌ 测试4失败');
    console.log('期望:', test4Expected);
    console.log('实际:', test4Result);
    failCount++;
  }

  // 测试5: 不完整的JSON块（流式响应中断导致的不完整JSON）
  console.log('\n测试5: 不完整的JSON块（流式响应中断）');
  const test5Input = `## 风险控制价值

基于企业抵御经济衰退或行业危机的能力强，它们有存活能力。

{
  "id": "point_2",
  "title": "增强抗周期能力",
  "content": "龙头企业抵御经济衰退或行业危机的能力强，具有更强的生存能力和抗风险能力。",
  "keywords": ["抗周期", "经济衰退", "护城河"]
},
{
  "id": "point_3",
  "title": "减少投资损失",
  "content": "通过止损策略和分散投资，限制最大回撤，防范投资风险。"

这是后续的正常内容，应该被保留`;

  const test5Result = cleanResponseContentForDisplay(test5Input);
  const test5Expected = `## 风险控制价值

基于企业抵御经济衰退或行业危机的能力强，它们有存活能力。

这是后续的正常内容，应该被保留`;

  if (test5Result.trim() === test5Expected.trim()) {
    console.log('✅ 测试5通过');
    passCount++;
  } else {
    console.log('❌ 测试5失败');
    console.log('期望:', test5Expected);
    console.log('实际:', test5Result);
    failCount++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`测试完成! 通过: ${passCount}, 失败: ${failCount}`);

  if (failCount === 0) {
    console.log('🎉 所有测试通过！JSON清理功能修复成功');
    console.log('\n📋 修复内容总结:');
    console.log('1. ✅ 完整JSON代码块清理');
    console.log('2. ✅ 不完整JSON代码块清理');
    console.log('3. ✅ 裸JSON片段清理');
    console.log('4. ✅ 混合内容中的JSON清理');
    console.log('5. ✅ 括号平衡检测');
    console.log('6. ✅ JSON属性行识别');
  } else {
    console.log('⚠️  部分测试失败，需要进一步优化');
  }
}

// 执行测试
runTests();
