/**
 * AI 服务配置
 * 包含 Ollama、Playwright MCP、工作流执行等配置
 */

export default {
  // Ollama 配置
  ollama: {
    baseUrl: 'http://wsl.hamr.top:11434',
    model: 'gemma3:12b', // 默认模型,可选: mistral, llama2, codellama
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 60000, // 60秒超时
  },

  // Playwright MCP Server 配置
  playwright: {
    mcp: {
      command: 'npx',
      args: ['@playwright/mcp@latest', '--extension'],
      env: {
        PLAYWRIGHT_MCP_EXTENSION_TOKEN:
          'P1YJCpGabgF6_mL6KVSn92_dxdKrnusK8AQSoYsJhBo',
      },
    },
    timeout: 30000, // 30秒超时
    headless: false, // 调试时显示浏览器
  },

  // 工作流执行配置
  workflow: {
    maxRetries: 3, // 最大重试次数
    timeout: 300000, // 5分钟超时
    debugMode: true, // 默认开启调试模式
    stepDelay: 1000, // 步骤间延迟(毫秒)
  },

  // 数据导出配置
  export: {
    defaultFormat: 'json', // 默认导出格式: json, csv, excel
    apiEndpoint: '', // API 上报地址(用户配置)
    apiKey: '', // API 密钥(用户配置)
    localPath: 'downloads/automa-data', // 本地存储路径
    maxFileSize: 10 * 1024 * 1024, // 最大文件大小 10MB
  },

  // LangGraph Agent 配置
  agent: {
    maxIterations: 10, // 最大迭代次数
    verbose: true, // 详细日志
    returnIntermediateSteps: true, // 返回中间步骤
  },

  // 提示词配置
  prompts: {
    systemRole: '你是一个浏览器自动化专家,擅长分析网页结构并生成数据抓取流程。',
    language: 'zh-CN', // 默认语言
  },
};
