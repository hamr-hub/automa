/**
 * LangGraph Agent 核心
 * 目标：用户与 AI 对话/指令 => 生成 Automa 工作流
 *
 * 说明：已移除 Playwright 相关依赖，不再做页面分析/注入。
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import LangGraphService from './LangGraphService';

class LangGraphAgent {
  constructor(config = {}) {
    this.ollama = new OllamaClient(config.ollama || aiConfig.ollama);
    this.langGraphService = new LangGraphService(config);

    this.history = [];
    this.state = {
      status: 'idle',
      error: null,
      lastAiOutput: null,
      currentWorkflow: null,
    };
  }

  async initialize() {
    const isHealthy = await this.ollama.checkHealth();
    if (!isHealthy) {
      this.state.status = 'error';
      this.state.error = 'Ollama 服务不可用,请确保 Ollama 已启动 (运行: ollama serve)';
      return false;
    }

    this.state.status = 'idle';
    this.state.error = null;
    return true;
  }

  /**
   * 发送消息并获取回复（支持多轮对话）
   * @param {string} userInput 用户输入
   * @param {string} targetUrl 目标 URL (可选)
   * @param {(progress: {step: string, message: string}) => void} onProgress 进度回调
   */
  async chat(userInput, targetUrl = '', onProgress) {
    try {
      this.state.status = 'generating';
      this.state.error = null;
      
      onProgress?.({ step: 'ai', message: 'AI 正在思考 (LangGraph)...' });

      // Add user message to history
      this.history.push({ role: 'user', content: userInput });

      // Execute LangGraph Workflow Generation
      // We pass the history so the AI knows the context
      const workflow = await this.langGraphService.run(userInput, targetUrl, this.history);

      if (workflow) {
        const aiResponse = `已为您生成工作流: ${workflow.name}`;
        this.history.push({ role: 'assistant', content: aiResponse });
        
        this.state.status = 'idle';
        this.state.currentWorkflow = workflow;

        return {
          success: true,
          message: aiResponse,
          workflow: workflow,
          isWorkflowUpdate: false // TODO: Detect update vs new
        };
      } else {
        throw new Error('未能生成有效的工作流');
      }

    } catch (error) {
      console.error('LangGraph Agent Error:', error);
      this.state.status = 'error';
      this.state.error = error.message;
      
      this.history.push({ role: 'assistant', content: `错误: ${error.message}` });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 清除历史
   */
  clearHistory() {
    this.history = [];
    this.state.currentWorkflow = null;
  }
}

export default LangGraphAgent;
