/**
 * LangGraph Agent 核心
 * 目标：用户与 AI 对话/指令 => 生成 Automa 工作流
 *
 * 说明：已移除 Playwright 相关依赖，不再做页面分析/注入。
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import LangGraphService from './LangGraphService';
import Browser from 'webextension-polyfill';

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
   * 获取当前标签页的 DOM 上下文
   */
  async getPageContext() {
    try {
      let [tab] = await Browser.tabs.query({ active: true, currentWindow: true });
      
      // If current tab is extension page, try to find Amazon JP tab
      if (tab?.url && (tab.url.startsWith('chrome-extension:') || tab.url.startsWith('moz-extension:'))) {
          const amazonTabs = await Browser.tabs.query({ url: '*://*.amazon.co.jp/*' });
          if (amazonTabs.length > 0) {
              tab = amazonTabs[0];
          }
      }

      if (!tab?.id) return null;

      const [result] = await Browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Inline simple simplifier to avoid dependency injection issues in executeScript
          // Or use the file we just created if we can bundle it. 
          // For reliability in this context, we'll implement a basic version here.
          
          function simplify(root) {
             if (!root) return '';
             const clone = root.cloneNode(true);
             const removeTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'SVG', 'PATH', 'LINK', 'META'];
             const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT);
             const nodesToRemove = [];
             while (walker.nextNode()) {
               if (removeTags.includes(walker.currentNode.tagName)) nodesToRemove.push(walker.currentNode);
             }
             nodesToRemove.forEach(n => n.remove());
             
             // Simple cleanup
             return clone.innerHTML.replace(/\s+/g, ' ').trim().slice(0, 30000);
          }
          
          return {
            url: window.location.href,
            title: document.title,
            dom: simplify(document.body)
          };
        }
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
   */
  async chat(userInput, targetUrl = '', onProgress) {
    try {
      this.state.status = 'generating';
      this.state.error = null;
      
      onProgress?.({ step: 'ai', message: 'AI 正在分析页面...' });

      // 1. Get Page Context if targetUrl is not provided (assume current page)
      let pageContext = null;
      if (!targetUrl) {
         pageContext = await this.getPageContext();
         if (pageContext) {
             targetUrl = pageContext.url; // Use current URL
         }
      }

      // Add user message to history
      // Include Context in the message but don't show it to user in UI if possible
      // For LangGraph, we'll pass it as a separate property
      this.history.push({ role: 'user', content: userInput });

      // Execute LangGraph Workflow Generation
      // We pass the history so the AI knows the context
      onProgress?.({ step: 'ai', message: 'AI 正在生成工作流...' });
      const workflow = await this.langGraphService.run(
          userInput, 
          targetUrl, 
          this.history,
          pageContext?.dom // Pass DOM context
      );

      if (workflow) {
        const aiResponse = `已为您生成工作流: ${workflow.name}`;
        this.history.push({ role: 'assistant', content: aiResponse });
        
        this.state.status = 'idle';
        this.state.currentWorkflow = workflow;

        return {
          success: true,
          message: aiResponse,
          workflow: workflow,
          isWorkflowUpdate: false
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
