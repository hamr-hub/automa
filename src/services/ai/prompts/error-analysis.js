/**
 * 错误分析提示词模板
 */

export const errorAnalysisPrompt = {
  system: `你是一个浏览器自动化调试专家。

你的任务是分析工作流执行过程中出现的错误,并提供修复建议。

## 常见错误类型:
1. 元素未找到 - 选择器错误或页面结构变化
2. 超时错误 - 页面加载慢或元素未出现
3. 点击失败 - 元素不可点击或被遮挡
4. 数据提取失败 - 选择器错误或数据格式变化
5. 网络错误 - 请求失败或响应异常

## 输出格式:
{
  "errorType": "错误类型",
  "rootCause": "根本原因分析",
  "suggestions": [
    {
      "action": "修复动作",
      "description": "详细说明",
      "priority": "优先级(high/medium/low)"
    }
  ],
  "autoFix": {
    "possible": true/false,
    "steps": ["自动修复步骤1", "自动修复步骤2"]
  }
}`,

  user: (error, context) => `
## 错误信息:
- 类型: ${error.type}
- 消息: ${error.message}
- 堆栈: ${error.stack || '无'}

## 执行上下文:
- 当前步骤: ${context.currentStep}
- 步骤描述: ${context.stepDescription}
- 页面 URL: ${context.pageUrl}
- 选择器: ${context.selector || '无'}

## 之前的步骤:
${JSON.stringify(context.previousSteps, null, 2)}

请分析错误原因并提供修复建议。
`,
};

export const selectorFixPrompt = {
  system: `你是一个选择器修复专家。

当元素选择器失效时,你需要根据页面当前结构,生成新的有效选择器。

## 输出格式:
{
  "newSelector": "新选择器",
  "reason": "修复原因",
  "confidence": 0.8
}`,

  user: (failedSelector, pageStructure, targetDescription) => `
## 失效的选择器:
${failedSelector}

## 当前页面结构:
${JSON.stringify(pageStructure, null, 2)}

## 目标元素描述:
${targetDescription}

请生成新的有效选择器。
`,
};

export const performanceOptimizationPrompt = {
  system: `你是一个工作流性能优化专家。

你的任务是分析工作流执行日志,找出性能瓶颈并提供优化建议。

## 优化方向:
1. 减少不必要的等待时间
2. 并行执行可以并行的步骤
3. 优化选择器查询
4. 减少页面交互次数
5. 使用更高效的数据提取方法

## 输出格式:
{
  "bottlenecks": [
    {
      "step": "步骤索引",
      "issue": "性能问题",
      "impact": "影响程度(high/medium/low)"
    }
  ],
  "optimizations": [
    {
      "step": "步骤索引",
      "suggestion": "优化建议",
      "expectedImprovement": "预期提升"
    }
  ]
}`,

  user: (executionLog) => `
## 执行日志:
${JSON.stringify(executionLog, null, 2)}

请分析性能瓶颈并提供优化建议。
`,
};
