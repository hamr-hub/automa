/**
 * LangGraph Agent 核心
 * 目标：用户与 AI 对话/指令 => 生成 Automa 工作流
 *
 * 说明：已移除 Playwright 相关依赖，不再做页面分析/注入。
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import WorkflowGenerator from './WorkflowGenerator';
import { workflowGenerationPrompt } from './prompts/workflow-generation';

function extractJsonFromText(text) {
  if (!text) return null;

  // 尝试直接解析
  try {
    return JSON.parse(text);
  } catch (e) {
    // ignore
  }

  // 尝试从代码块中提取
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch (e) {
      // ignore
    }
  }

  // 尝试从第一个 { 到最后一个 }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const maybe = text.slice(first, last + 1);
    try {
      return JSON.parse(maybe);
    } catch (e) {
      // ignore
    }
  }

  return null;
}

class LangGraphAgent {
  constructor(config = {}) {
    this.ollama = new OllamaClient(config.ollama || aiConfig.ollama);
    this.workflowGenerator = new WorkflowGenerator();

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
      
      onProgress?.({ step: 'ai', message: 'AI 正在思考...' });

      // 构建用户消息
      let content = userInput;
      if (targetUrl && this.history.length === 0) {
        content += `\n目标 URL: ${targetUrl}`;
      }

      // 如果是第一条消息，添加系统提示词
      if (this.history.length === 0) {
        this.history.push({
          role: 'system',
          content: workflowGenerationPrompt.system
        });
      }

      this.history.push({ role: 'user', content });

      // 调用 Ollama
      const res = await this.ollama.chat(this.history);
      const aiResponse = res?.message?.content || '';

      // 添加 AI 回复到历史
      this.history.push({ role: 'assistant', content: aiResponse });

      // 尝试提取 JSON 生成工作流
      const json = extractJsonFromText(aiResponse);
      let workflow = null;

      if (json && Array.isArray(json.steps)) {
        onProgress?.({ step: 'build', message: '正在构建工作流...' });
        
        // 记录 AI 输出结构
        this.state.lastAiOutput = {
            steps: json.steps,
            dataSchema: json.dataSchema || {}
        };

        // 生成工作流
        workflow = this.workflowGenerator.generateWorkflow(
          this.state.lastAiOutput,
          userInput, // 使用当前输入作为名称一部分
          targetUrl
        );

        // 验证
        const validation = this.workflowGenerator.validateWorkflow(workflow);
        if (!validation.valid) {
             console.warn(`工作流验证警告: ${validation.errors.join(', ')}`);
             // 不抛出错误，而是让用户在 UI 上看到警告或继续
        }
        
        this.state.currentWorkflow = workflow;
      }

      this.state.status = 'completed';
      
      return {
        success: true,
        message: aiResponse,
        workflow: workflow, // 如果生成了工作流，这里会有值
        isWorkflowUpdate: !!workflow
      };

    } catch (error) {
      console.error('AI 对话失败:', error);
      this.state.status = 'error';
      this.state.error = error?.message || String(error);
      return { success: false, error: this.state.error };
    }
  }

  /**
   * 重置会话
   */
  reset() {
    this.history = [];
    this.state.status = 'idle';
    this.state.error = null;
    this.state.lastAiOutput = null;
    this.state.currentWorkflow = null;
  }

  getState() {
    return { ...this.state };
  }
}

export default LangGraphAgent;
