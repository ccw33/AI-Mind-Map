#!/usr/bin/env node

/**
 * 测试JSON解析功能的脚本
 * 验证cleanResponseContentForParsing和parseStructuredPoints函数
 */

// 模拟cleanResponseContentForParsing函数
function cleanResponseContentForParsing(content) {
  if (!content || typeof content !== 'string') {
    return content;
  }

  // 对于解析用途，我们只做最小化的清理
  // 主要是移除明显的重复JSON块，但保留完整的结构化数据

  let cleaned = content;

  // 1. 移除重复的JSON代码块（保留最后一个完整的）
  const jsonBlocks = content.match(/```json[\s\S]*?```/g);
  if (jsonBlocks && jsonBlocks.length > 1) {
    // 移除前面的JSON块，保留最后一个
    for (let i = 0; i < jsonBlocks.length - 1; i++) {
      cleaned = cleaned.replace(jsonBlocks[i], '');
    }
  }

  // 2. 清理多余的空行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.trim();

  return cleaned;
}

// 模拟parseStructuredPoints函数
function parseStructuredPoints(content) {
  console.log('🔍 parseStructuredPoints 开始解析内容:', content.substring(0, 200) + '...');

  try {
    // 查找JSON代码块
    const jsonMatch = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    console.log('🔍 JSON匹配结果:', jsonMatch ? '找到JSON块' : '未找到JSON块');

    if (!jsonMatch) {
      console.log('❌ 未找到JSON代码块');
      return [];
    }

    const jsonString = jsonMatch[1];
    console.log('🔍 提取的JSON字符串:', jsonString);

    const jsonData = JSON.parse(jsonString);
    console.log('🔍 解析后的JSON数据:', jsonData);

    if (jsonData.structuredPoints && Array.isArray(jsonData.structuredPoints)) {
      const result = jsonData.structuredPoints.map((point, index) => ({
        id: point.id || `point_${index + 1}`,
        title: point.title || `要点${index + 1}`,
        content: point.content || '',
        keywords: Array.isArray(point.keywords) ? point.keywords : []
      }));
      console.log('✅ 成功解析结构化分点:', result);
      return result;
    } else {
      console.log('❌ JSON数据中没有有效的structuredPoints数组');
    }
  } catch (error) {
    console.error('❌ 解析结构化分点失败:', error);
    console.error('错误详情:', error.message);
  }
  return [];
}

// 测试用例
function runParsingTests() {
  console.log('🧪 开始测试JSON解析功能\n');

  let passCount = 0;
  let failCount = 0;

  // 测试1: 完整的JSON结构化分点解析
  console.log('测试1: 完整的JSON结构化分点解析');
  const test1Input = `## 风险控制价值

基于企业抵御经济衰退或行业危机的能力强，它们有存活能力。

\`\`\`json
{
  "structuredPoints": [
    {
      "id": "point_1",
      "title": "增强抗周期能力",
      "content": "龙头企业抵御经济衰退或行业危机的能力强，具有更强的生存能力和抗风险能力。",
      "keywords": ["抗周期", "经济衰退", "护城河"]
    },
    {
      "id": "point_2",
      "title": "减少投资损失",
      "content": "通过止损策略和分散投资，限制最大回撤，防范投资风险。",
      "keywords": ["止损", "分散投资", "风险控制"]
    }
  ]
}
\`\`\`

这是后续的正常内容`;

  const test1Cleaned = cleanResponseContentForParsing(test1Input);
  const test1Result = parseStructuredPoints(test1Cleaned);

  if (test1Result.length === 2 &&
      test1Result[0].title === '增强抗周期能力' &&
      test1Result[1].title === '减少投资损失') {
    console.log('✅ 测试1通过 - 成功解析2个结构化分点');
    passCount++;
  } else {
    console.log('❌ 测试1失败');
    console.log('期望: 2个结构化分点');
    console.log('实际:', test1Result);
    failCount++;
  }

  // 测试2: 多个JSON块，保留最后一个
  console.log('\n测试2: 多个JSON块处理');
  const test2Input = `## 分析结果

第一个JSON块（应该被移除）：
\`\`\`json
{
  "structuredPoints": [
    {
      "id": "old_1",
      "title": "旧的分点",
      "content": "这个应该被移除"
    }
  ]
}
\`\`\`

最终的JSON块（应该被保留）：
\`\`\`json
{
  "structuredPoints": [
    {
      "id": "new_1",
      "title": "新的分点",
      "content": "这个应该被保留",
      "keywords": ["保留", "最新"]
    }
  ]
}
\`\`\``;

  const test2Cleaned = cleanResponseContentForParsing(test2Input);
  const test2Result = parseStructuredPoints(test2Cleaned);

  if (test2Result.length === 1 && test2Result[0].title === '新的分点') {
    console.log('✅ 测试2通过 - 正确保留最后一个JSON块');
    passCount++;
  } else {
    console.log('❌ 测试2失败');
    console.log('期望: 1个结构化分点，标题为"新的分点"');
    console.log('实际:', test2Result);
    failCount++;
  }

  // 测试3: 没有JSON块的情况
  console.log('\n测试3: 没有JSON块的情况');
  const test3Input = `## 普通回答

这是一个普通的AI回答，没有结构化分点。

- 这是一个列表项
- 这是另一个列表项

没有JSON代码块。`;

  const test3Cleaned = cleanResponseContentForParsing(test3Input);
  const test3Result = parseStructuredPoints(test3Cleaned);

  if (test3Result.length === 0) {
    console.log('✅ 测试3通过 - 正确处理无JSON块的情况');
    passCount++;
  } else {
    console.log('❌ 测试3失败');
    console.log('期望: 0个结构化分点');
    console.log('实际:', test3Result);
    failCount++;
  }

  // 测试4: 格式错误的JSON
  console.log('\n测试4: 格式错误的JSON');
  const test4Input = `## 错误的JSON

\`\`\`json
{
  "structuredPoints": [
    {
      "id": "point_1",
      "title": "测试分点",
      "content": "缺少闭合括号"
    }
  // 这里缺少闭合括号
\`\`\``;

  const test4Cleaned = cleanResponseContentForParsing(test4Input);
  const test4Result = parseStructuredPoints(test4Cleaned);

  if (test4Result.length === 0) {
    console.log('✅ 测试4通过 - 正确处理格式错误的JSON');
    passCount++;
  } else {
    console.log('❌ 测试4失败');
    console.log('期望: 0个结构化分点（因为JSON格式错误）');
    console.log('实际:', test4Result);
    failCount++;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`解析测试完成! 通过: ${passCount}, 失败: ${failCount}`);

  if (failCount === 0) {
    console.log('🎉 所有解析测试通过！JSON解析功能正常工作');
    console.log('\n📋 解析功能总结:');
    console.log('1. ✅ 完整JSON结构化分点解析');
    console.log('2. ✅ 多个JSON块处理（保留最后一个）');
    console.log('3. ✅ 无JSON块情况处理');
    console.log('4. ✅ 错误JSON格式处理');
  } else {
    console.log('⚠️  部分解析测试失败，需要进一步优化');
  }
}

// 执行测试
runParsingTests();
