/**
 * LangGraph Agent 核心
 * 目标：用户与 AI 对话/指令 => 生成 Automa 工作流
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import LangGraphService from './LangGraphService';
import Browser from 'webextension-polyfill';
import { workflowGenerationPrompt } from './prompts/workflow-generation';
import { getPageContext } from './aiUtils';

class LangGraphAgent {
  constructor(config = {}) {
    this.ollama = new OllamaClient(config.ollama || aiConfig.ollama);
    // 传递同一个 OllamaClient 实例给 LangGraphService
    this.langGraphService = new LangGraphService(config, this.ollama);

    this.history = [];
    this.state = {
      status: 'idle',
      error: null,
      lastAiOutput: null,
      currentWorkflow: null,
    };
    this.abortController = null;
  }

  /**
   * 停止当前的 AI 生成任务
   */
  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.state.status = 'idle';
      this.history.push({
        role: 'assistant',
        content: '🚫 已停止生成',
      });
      return true;
    }
    return false;
  }

  async initialize() {
    const isHealthy = await this.ollama.checkHealth();
    if (!isHealthy) {
      this.state.status = 'error';
      this.state.error =
        'Ollama 服务不可用,请确保 Ollama 已启动 (运行: ollama serve)';
      return false;
    }

    this.state.status = 'idle';
    this.state.error = null;
    return true;
  }

  /**
   * 获取当前标签页的 DOM 上下文
   */
  async getPageContext() {
    return await getPageContext();
  }

  /**
   * Run Interactive Mode
   */
  async runInteractive(userInput, onProgress) {
    try {
      this.state.status = 'interactive';
      this.state.error = null;

      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      onProgress?.({
        step: 'init',
        message: 'Starting interactive session...',
      });

      const workflowSteps = await this.langGraphService.runInteractive(
        userInput,
        onProgress,
        this.abortController.signal
      );

      this.abortController = null;
      this.state.status = 'idle';

      // Generate a full workflow object from the steps
      // We assume no data schema for now, or we could extract it from steps if EXTRACT exists
      const workflow = this.langGraphService.workflowGenerator.generateWorkflow(
        { steps: workflowSteps, dataSchema: {} },
        userInput,
        ''
      );

      return {
        success: true,
        workflow: workflow,
        message: 'Interactive session completed.',
      };
    } catch (error) {
      if (error.message === 'Aborted by user') {
        return { success: false, error: '已停止生成' };
      }
      console.error('Interactive Mode Error:', error);
      this.state.status = 'error';
      this.state.error = error.message;
      return {
        success: false,
        error: error.message,
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * 发送消息并获取回复（支持多轮对话）
   * @param {string} userInput 用户输入
   * @param {string} targetUrl 目标 URL (可选)
   * @param {(progress: {step: string, message: string}) => void} onProgress 进度回调
   * @param {string} pageContext 页面上下文 (可选, JSON string)
   */
  async chat(
    userInput,
    targetUrl = '',
    onProgress,
    pageContext = null,
    currentWorkflow = null
  ) {
    try {
      this.state.status = 'generating';
      this.state.error = null;

      // Cancel previous request if any
      if (this.abortController) {
        this.abortController.abort();
      }
      this.abortController = new AbortController();

      onProgress?.({ step: 'ai', message: 'AI 正在分析页面...' });

      // 1. Get Page Context if not provided and targetUrl is empty
      if (!pageContext && !targetUrl) {
        const ctx = await this.getPageContext();
        if (ctx) {
          pageContext = ctx.dom;
          targetUrl = ctx.url;
        }
      }

      // 2. Construct the prompt
      let promptContent;
      // If history is empty, inject context.
      if (this.history.length === 0) {
        promptContent = workflowGenerationPrompt.user(
          userInput,
          targetUrl,
          pageContext
        );
      } else {
        // Multi-turn: Use follow-up prompt to save tokens (don't re-inject DOM)
        // Unless explicit pageContext change handling is required (omitted for now)
        promptContent = workflowGenerationPrompt.userFollowUp(userInput);
      }

      // Add user message to history
      this.history.push({ role: 'user', content: promptContent });

      // Execute LangGraph Workflow Generation
      // onProgress?.({ step: 'ai', message: 'AI 正在生成工作流...' }); // Moved to Service
      const workflow = await this.langGraphService.run(
        userInput,
        targetUrl,
        this.history,
        pageContext,
        this.abortController.signal,
        onProgress,
        currentWorkflow
      );

      this.abortController = null;

      if (workflow) {
        const aiResponse = `已为您生成工作流: ${workflow.name}`;
        this.history.push({ role: 'assistant', content: aiResponse });

        this.state.status = 'idle';
        this.state.currentWorkflow = workflow;

        return {
          success: true,
          message: aiResponse,
          workflow: workflow,
          isWorkflowUpdate: false,
        };
      } else {
        throw new Error('未能生成有效的工作流');
      }
    } catch (error) {
      if (error.message === 'Aborted by user') {
        return { success: false, error: '已停止生成' };
      }
      console.error('LangGraph Agent Error:', error);
      this.state.status = 'error';

      // 提供更详细的错误信息
      let errorMessage = error.message;
      if (error.message.includes('Failed to generate workflow')) {
        errorMessage = `工作流生成失败: ${error.message}\n\n可能原因:\n1. AI 模型返回了非标准 JSON 格式\n2. 模型输出缺少必需字段 (steps/dataSchema)\n3. 请尝试使用更强大的模型 (如 llama3, qwen2.5)\n4. 检查控制台日志查看详细错误`;
      }

      this.state.error = errorMessage;

      // 重要：失败时不要将错误消息放入 history
      // 这样用户重试时，AI 会重新生成，而不是看到之前的错误
      // this.history.push({
      //   role: 'assistant',
      //   content: `错误: ${errorMessage}`,
      // });

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      this.abortController = null;
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
