
/**
 * LangGraph Agent 核心
 * 目标：用户与 AI 对话/指令 => 生成 Automa 工作流
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import LangGraphService from './LangGraphService';
import Browser from 'webextension-polyfill';
import { workflowGenerationPrompt } from './prompts/workflow-generation';

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
    try {
      let [tab] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      // If current tab is extension page, try to find Amazon JP tab
      if (
        tab?.url &&
        (tab.url.startsWith('chrome-extension:') ||
          tab.url.startsWith('moz-extension:'))
      ) {
        // Fallback or specific logic if needed
      }

      if (!tab?.id) return null;

      const [result] = await Browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          function simplify(root) {
            if (!root) return '';
            const clone = root.cloneNode(true);
            const removeTags = [
              'SCRIPT',
              'STYLE',
              'NOSCRIPT',
              'IFRAME',
              'SVG',
              'PATH',
              'LINK',
              'META',
            ];
            const walker = document.createTreeWalker(
              clone,
              NodeFilter.SHOW_ELEMENT
            );
            const nodesToRemove = [];
            while (walker.nextNode()) {
              if (removeTags.includes(walker.currentNode.tagName))
                nodesToRemove.push(walker.currentNode);
            }
            nodesToRemove.forEach((n) => n.remove());

            // Simple cleanup
            return clone.innerHTML.replace(/\s+/g, ' ').trim().slice(0, 30000);
          }

          return {
            url: window.location.href,
            title: document.title,
            dom: simplify(document.body),
          };
        },
      });

      return result?.result;
    } catch (e) {
      console.warn('Failed to get page context:', e);
      return null;
    }
  }

  /**
   * 发送消息并获取回复（支持多轮对话）
   * @param {string} userInput 用户输入
   * @param {string} targetUrl 目标 URL (可选)
   * @param {(progress: {step: string, message: string}) => void} onProgress 进度回调
   * @param {string} pageContext 页面上下文 (可选, JSON string)
   */
  async chat(userInput, targetUrl = '', onProgress, pageContext = null) {
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

      // 2. Construct the full prompt
      const fullPrompt = workflowGenerationPrompt.user(userInput, targetUrl, pageContext);

      // Add user message to history
      // Note: We push the FULL prompt to the history so the LLM sees the context.
      this.history.push({ role: 'user', content: fullPrompt });

      // Execute LangGraph Workflow Generation
      onProgress?.({ step: 'ai', message: 'AI 正在生成工作流...' });
      const workflow = await this.langGraphService.run(
        userInput,
        targetUrl,
        this.history,
        pageContext,
        this.abortController.signal
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
      this.state.error = error.message;

      this.history.push({
        role: 'assistant',
        content: `错误: ${error.message}`,
      });

      return {
        success: false,
        error: error.message,
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
