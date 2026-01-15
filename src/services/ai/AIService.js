/**
 * AI Service 统一门面
 * 所有 Ollama 调用统一通过 LangGraphService,不直接使用 OllamaClient
 * 
 * 架构设计:
 * - 工作流生成: LangGraphAgent → LangGraphService.run() (复杂状态图)
 * - 简单 AI 调用: LangGraphService.simpleChat() (直接透传给 OllamaClient)
 */

import LangGraphAgent from './LangGraphAgent.js';
import aiConfig from '../../config/ai.config.js';

class AIService {
  constructor() {
    this.langGraphAgent = null;
    this.initialized = false;
  }

  /**
   * 初始化 AI 服务
   * @param {Object} config - 配置对象
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize(config = {}) {
    try {
      // 初始化 LangGraph Agent
      this.langGraphAgent = new LangGraphAgent(config);
      const isHealthy = await this.langGraphAgent.initialize();
      
      if (!isHealthy) {
        throw new Error('Ollama 服务不可用,请确保 Ollama 已启动');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[AIService] 初始化失败:', error);
      this.initialized = false;
      throw error;
    }
  }

  /**
   * 确保服务已初始化
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('AIService 未初始化,请先调用 initialize()');
    }
  }

  /**
   * 获取 LangGraphService 实例 (通过 LangGraphAgent)
   * @returns {LangGraphService}
   */
  getLangGraphService() {
    this.ensureInitialized();
    return this.langGraphAgent.langGraphService;
  }

  /**
   * 生成工作流 (通过 LangGraph 复杂状态图)
   * @param {string} userInput - 用户输入
   * @param {string} targetUrl - 目标 URL
   * @param {Function} onProgress - 进度回调
   * @param {string} pageContext - 页面上下文
   * @returns {Promise<Object>} 工作流对象
   */
  async generateWorkflow(userInput, targetUrl = '', onProgress, pageContext = null) {
    this.ensureInitialized();
    return await this.langGraphAgent.chat(userInput, targetUrl, onProgress, pageContext);
  }

  /**
   * 简单 AI 聊天 (通过 LangGraphService.simpleChat)
   * 适用于 AI Block、一次性查询等场景
   * 
   * @param {Array} messages - 消息数组 [{role: 'user'|'assistant'|'system', content: '...'}]
   * @param {Object} options - 可选配置
   * @returns {Promise<Object>} AI 响应
   */
  async chat(messages, options = {}) {
    const langGraphService = this.getLangGraphService();
    return await langGraphService.simpleChat(messages, options);
  }

  /**
   * 简单 AI 生成 (通过 LangGraphService.simpleGenerate)
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选配置
   * @returns {Promise<Object>} AI 响应
   */
  async generate(prompt, options = {}) {
    const langGraphService = this.getLangGraphService();
    return await langGraphService.simpleGenerate(prompt, options);
  }

  /**
   * 流式聊天 (通过 LangGraphService.simpleChatStream)
   * @param {Array} messages - 消息数组
   * @param {Function} onChunk - 接收文本块的回调
   * @param {Object} options - 可选配置
   */
  async chatStream(messages, onChunk, options = {}) {
    const langGraphService = this.getLangGraphService();
    return await langGraphService.simpleChatStream(messages, onChunk, options);
  }

  /**
   * 流式生成 (通过 LangGraphService.simpleGenerateStream)
   * @param {string} prompt - 提示词
   * @param {Function} onChunk - 接收文本块的回调
   * @param {Object} options - 可选配置
   */
  async generateStream(prompt, onChunk, options = {}) {
    const langGraphService = this.getLangGraphService();
    return await langGraphService.simpleGenerateStream(prompt, onChunk, options);
  }

  /**
   * 检查 Ollama 服务健康状态
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    if (!this.langGraphAgent) {
      const tempAgent = new LangGraphAgent();
      return await tempAgent.initialize();
    }
    return this.initialized;
  }

  /**
   * 获取可用模型列表
   * @returns {Promise<Array>}
   */
  async listModels() {
    if (!this.langGraphAgent) {
      const tempAgent = new LangGraphAgent();
      await tempAgent.initialize();
      return await tempAgent.langGraphService.ollama.listModels();
    }
    const langGraphService = this.getLangGraphService();
    return await langGraphService.ollama.listModels();
  }

  /**
   * 更新配置
   * @param {Object} config - 新配置
   */
  async updateConfig(config) {
    this.initialized = false;
    await this.initialize(config);
  }

  /**
   * 清除历史记录 (LangGraph)
   */
  clearHistory() {
    if (this.langGraphAgent) {
      this.langGraphAgent.clearHistory();
    }
  }

  /**
   * 获取调用指标
   */
  getMetrics() {
    if (!this.langGraphAgent) {
      return null;
    }
    const langGraphService = this.getLangGraphService();
    return langGraphService.ollama.getMetrics();
  }
}

// 导出单例实例
const aiService = new AIService();

export default aiService;
export { AIService };
