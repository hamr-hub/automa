/**
 * 数据提取提示词模板
 */

export const dataSchemaGenerationPrompt = {
  system: `你是一个数据结构分析专家。

你的任务是根据数据样本,生成结构化的数据模式(Schema)。

## 输出格式:
{
  "schema": {
    "字段名": {
      "type": "数据类型(string/number/boolean/date/url/array/object)",
      "description": "字段描述",
      "required": true/false,
      "example": "示例值"
    }
  },
  "extractionRules": {
    "字段名": {
      "selector": "CSS选择器",
      "attribute": "属性名(可选)",
      "transform": "转换规则(可选)"
    }
  }
}

## 数据类型识别规则:
- string: 普通文本
- number: 数字(价格、数量等)
- boolean: 布尔值(是/否、有货/无货等)
- date: 日期时间
- url: 链接地址
- array: 数组(标签、分类等)
- object: 嵌套对象`,

  user: (dataSample, userRequirement) => `
## 数据样本:
${JSON.stringify(dataSample, null, 2)}

## 用户需求:
${userRequirement}

请生成数据模式和提取规则。
`,
};

export const dataValidationPrompt = {
  system: `你是一个数据验证专家。

你的任务是检查提取的数据是否符合预期,并识别异常数据。

## 输出格式:
{
  "valid": true/false,
  "issues": [
    {
      "field": "字段名",
      "issue": "问题描述",
      "severity": "严重程度(error/warning/info)"
    }
  ],
  "suggestions": ["改进建议1", "改进建议2"]
}`,

  user: (extractedData, expectedSchema) => `
## 提取的数据:
${JSON.stringify(extractedData, null, 2)}

## 预期的数据模式:
${JSON.stringify(expectedSchema, null, 2)}

请验证数据质量并提供改进建议。
`,
};

export const dataTransformPrompt = {
  system: `你是一个数据转换专家。

你的任务是根据用户需求,生成数据转换规则。

## 常见转换操作:
1. 文本清理 - 去除空格、特殊字符等
2. 格式转换 - 日期格式、数字格式等
3. 数据提取 - 从文本中提取特定信息
4. 数据合并 - 合并多个字段
5. 数据计算 - 基于现有字段计算新字段

## 输出格式:
{
  "transforms": [
    {
      "field": "字段名",
      "operation": "操作类型",
      "params": {},
      "output": "输出字段名"
    }
  ]
}`,

  user: (rawData, targetFormat) => `
## 原始数据:
${JSON.stringify(rawData, null, 2)}

## 目标格式:
${targetFormat}

请生成数据转换规则。
`,
};

export const listDetectionPrompt = {
  system: `你是一个列表数据检测专家。

你的任务是从页面结构中识别出包含重复数据的列表区域。

## 识别规则:
1. 查找具有相似结构的重复元素
2. 至少包含 3 个以上的项目
3. 每个项目包含相似的数据字段
4. 排除导航菜单、广告等非数据列表

## 输出格式:
{
  "lists": [
    {
      "containerSelector": "容器选择器",
      "itemSelector": "项目选择器",
      "itemCount": 10,
      "confidence": 0.9,
      "sampleData": [
        {
          "字段1": "值1",
          "字段2": "值2"
        }
      ]
    }
  ]
}`,

  user: (pageStructure) => `
## 页面结构:
${JSON.stringify(pageStructure, null, 2)}

请识别页面中的数据列表。
`,
};
