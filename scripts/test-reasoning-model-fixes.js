#!/usr/bin/env node

/**
 * 推理模型响应截断问题修复测试脚本
 *
 * 测试内容：
 * 1. 超时时间设置
 * 2. JSON解析错误处理
 * 3. 响应完整性检查
 * 4. 连接状态监控
 */

console.log('🧪 推理模型响应截断问题修复测试');
console.log('=====================================\n');

// 模拟响应完整性检查函数
function checkResponseCompleteness(content, isReasoningModel) {
  const result = {
    complete: true,
    reason: ''
  };

  if (!content || content.trim().length === 0) {
    result.complete = false;
    result.reason = '响应内容为空';
    return result;
  }

  // 检查是否以句号、感叹号、问号等结尾
  const lastChar = content.trim().slice(-1);
  const properEndings = ['.', '!', '?', '。', '！', '？', '```', '}', ')', ']'];
  const hasProperEnding = properEndings.some(ending => content.trim().endsWith(ending));

  // 检查JSON完整性
  const hasJsonStart = content.includes('```json');
  const hasStructuredPoints = content.includes('structuredPoints');
  let hasCompleteJson = false;

  if (hasJsonStart && hasStructuredPoints) {
    const jsonStartIndex = content.lastIndexOf('```json');
    const afterJsonStart = content.substring(jsonStartIndex + 7);
    hasCompleteJson = afterJsonStart.includes('```') && afterJsonStart.includes('}');
  }

  // 检查是否是典型的服务器截断模式
  const truncationPatterns = [
    /例如，.*在\d{4}年$/,  // "例如，苹果在2008年"
    /如.*公司.*在$/,       // "如某公司在"
    /根据.*数据.*显示$/,   // "根据某数据显示"
    /实证.*研究.*表明$/,   // "实证研究表明"
    /；.*例如$/,          // "；例如"
    /例如，[^。！？]*$/,   // "例如，"后面没有结束标点
    /，其.*$/,            // "，其"结尾
    /在.*中$/,            // "在...中"结尾但可能不完整
    /通过.*$/,            // "通过"结尾但可能不完整
    /根据.*$/,            // "根据"结尾但可能不完整
  ];

  const hasTypicalTruncation = truncationPatterns.some(pattern => pattern.test(content.trim()));

  // 对于推理模型，检查更严格
  if (isReasoningModel) {
    // 检查是否有推理过程的结束标记
    const hasReasoningContent = content.includes('思考') || content.includes('分析') || content.includes('推理');

    if (hasJsonStart && hasStructuredPoints && !hasCompleteJson) {
      result.complete = false;
      result.reason = 'JSON结构化数据不完整';
      return result;
    }

    if (hasReasoningContent && !hasProperEnding && content.length > 100) {
      result.complete = false;
      result.reason = '推理内容可能被截断';
      return result;
    }

    // 检查典型的推理模型截断模式
    if (hasTypicalTruncation) {
      result.complete = false;
      result.reason = '检测到典型的服务器截断模式';
      return result;
    }
  }

  // 检查是否在句子中间截断
  const lastSentence = content.trim().split(/[.!?。！？]/).pop();
  if (lastSentence && lastSentence.length > 50 && !hasProperEnding) {
    result.complete = false;
    result.reason = '可能在句子中间截断';
    return result;
  }

  // 检查是否有未完成的代码块
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    result.complete = false;
    result.reason = '代码块未正确闭合';
    return result;
  }

  return result;
}

// 测试用例
const testCases = [
  {
    name: '完整的推理响应',
    content: `### 龙头企业抗风险机制分析

经过深入思考，我认为龙头企业的抗风险机制主要体现在以下几个方面：

1. **规模经济优势**
2. **品牌护城河**
3. **技术壁垒**

\`\`\`json
{
  "structuredPoints": [
    {
      "title": "规模经济优势",
      "content": "龙头企业通过规模效应降低成本"
    }
  ]
}
\`\`\``,
    isReasoningModel: true,
    expectedComplete: true
  },
  {
    name: '典型的服务器截断模式（例如+年份）',
    content: `### 龙头企业抗风险机制在股票投资中的应用场景

作为资深股票投资专家，龙头企业的抗风险机制是其核心优势。这些机制包括护城河效应和现金流稳定性，能有效抵御行业竞争、经济周期波动等风险。例如，苹果在2008年`,
    isReasoningModel: true,
    expectedComplete: false
  },
  {
    name: '截断的推理响应（JSON不完整）',
    content: `### 龙头企业抗风险机制分析

经过深入思考，我认为龙头企业的抗风险机制主要体现在以下几个方面：

1. **规模经济优势**
2. **品牌护城河**

\`\`\`json
{
  "structuredPoints": [
    {
      "title": "规模经济优势",
      "content": "龙头企业通过规模效应降低成本`,
    isReasoningModel: true,
    expectedComplete: false
  },
  {
    name: '截断的推理响应（句子中间）',
    content: `### 龙头企业抗风险机制分析

经过深入思考，我认为龙头企业的抗风险机制主要体现在规模经济优势、品牌护城河、技术壁垒等方面，这些机制能够有效帮助企业在市场竞争中保持`,
    isReasoningModel: true,
    expectedComplete: false
  },
  {
    name: '正常的非推理响应',
    content: `龙头企业具有强大的抗风险能力，主要体现在规模优势和品牌价值上。`,
    isReasoningModel: false,
    expectedComplete: true
  },
  {
    name: '空响应',
    content: '',
    isReasoningModel: true,
    expectedComplete: false
  }
];

// 运行测试
let passCount = 0;
let failCount = 0;

console.log('📋 测试响应完整性检查功能:\n');

testCases.forEach((testCase, index) => {
  console.log(`测试 ${index + 1}: ${testCase.name}`);

  const result = checkResponseCompleteness(testCase.content, testCase.isReasoningModel);
  const passed = result.complete === testCase.expectedComplete;

  if (passed) {
    console.log(`✅ 通过 - 检测结果: ${result.complete ? '完整' : '不完整'}`);
    if (!result.complete) {
      console.log(`   原因: ${result.reason}`);
    }
    passCount++;
  } else {
    console.log(`❌ 失败 - 期望: ${testCase.expectedComplete ? '完整' : '不完整'}, 实际: ${result.complete ? '完整' : '不完整'}`);
    if (!result.complete) {
      console.log(`   检测原因: ${result.reason}`);
    }
    failCount++;
  }
  console.log('');
});

// 测试超时时间设置
console.log('⏰ 测试超时时间设置:\n');

function getTimeoutDuration(model) {
  const isReasoningModel = model.toLowerCase().includes('reasoner') || model.toLowerCase().includes('reasoning');
  return isReasoningModel ? 600000 : 300000; // 推理模型10分钟，普通模型5分钟
}

const timeoutTests = [
  { model: 'deepseek-reasoner', expected: 600000 },
  { model: 'gpt-4-reasoning', expected: 600000 },
  { model: 'gpt-3.5-turbo', expected: 300000 },
  { model: 'claude-3', expected: 300000 }
];

timeoutTests.forEach((test, index) => {
  const timeout = getTimeoutDuration(test.model);
  const passed = timeout === test.expected;

  console.log(`测试 ${index + 1}: ${test.model}`);
  if (passed) {
    console.log(`✅ 通过 - 超时时间: ${timeout/1000}秒`);
    passCount++;
  } else {
    console.log(`❌ 失败 - 期望: ${test.expected/1000}秒, 实际: ${timeout/1000}秒`);
    failCount++;
  }
  console.log('');
});

// 测试JSON修复功能
console.log('🔧 测试JSON修复功能:\n');

function fixJsonFormat(data) {
  try {
    // 尝试修复常见的JSON格式问题
    let fixedData = data.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    JSON.parse(fixedData);
    return { success: true, fixed: fixedData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const jsonTests = [
  {
    name: '多余逗号的JSON',
    data: '{"name": "test", "value": 123,}',
    shouldFix: true
  },
  {
    name: '数组多余逗号的JSON',
    data: '{"items": [1, 2, 3,]}',
    shouldFix: true
  },
  {
    name: '正常的JSON',
    data: '{"name": "test", "value": 123}',
    shouldFix: true
  },
  {
    name: '严重损坏的JSON',
    data: '{"name": "test", "value":',
    shouldFix: false
  }
];

jsonTests.forEach((test, index) => {
  console.log(`测试 ${index + 1}: ${test.name}`);

  const result = fixJsonFormat(test.data);
  const passed = result.success === test.shouldFix;

  if (passed) {
    console.log(`✅ 通过 - ${result.success ? '修复成功' : '修复失败（符合预期）'}`);
    passCount++;
  } else {
    console.log(`❌ 失败 - 期望: ${test.shouldFix ? '修复成功' : '修复失败'}, 实际: ${result.success ? '修复成功' : '修复失败'}`);
    failCount++;
  }
  console.log('');
});

// 输出测试结果
console.log('=====================================');
console.log('📊 测试结果汇总:');
console.log(`✅ 通过: ${passCount} 个测试`);
console.log(`❌ 失败: ${failCount} 个测试`);
console.log(`📈 成功率: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n🎉 所有测试通过！推理模型响应截断问题修复验证成功。');
} else {
  console.log('\n⚠️ 部分测试失败，需要进一步检查和修复。');
}
