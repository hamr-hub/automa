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

    this.state = {
      status: 'idle',
      error: null,
      lastAiOutput: null,
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
   * 生成工作流(主入口)
   * @param {string} userInput
   * @param {string} targetUrl
   * @param {(progress: {step: string, message: string}) => void} onProgress
   */
  async generateWorkflow(userInput, targetUrl = '', onProgress) {
    try {
      this.state.status = 'generating';
      this.state.error = null;

      onProgress?.({ step: 'ai', message: 'AI 正在生成工作流...' });

      const aiOutput = await this.generateWorkflowSteps(userInput, targetUrl);
      this.state.lastAiOutput = aiOutput;

      onProgress?.({ step: 'build', message: '正在构建 Automa 工作流...' });
      const workflow = this.workflowGenerator.generateWorkflow(
        aiOutput,
        userInput,
        targetUrl
      );

      const validation = this.workflowGenerator.validateWorkflow(workflow);
      if (!validation.valid) {
        throw new Error(`工作流验证失败: ${validation.errors.join(', ')}`);
      }

      this.state.status = 'completed';
      return { success: true, workflow };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('生成工作流失败:', error);
      this.state.status = 'error';
      this.state.error = error?.message || String(error);
      return { success: false, error: this.state.error };
    }
  }

  /**
   * 调用 Ollama 生成抽象步骤(不依赖页面分析)
   */
  async generateWorkflowSteps(userInput, targetUrl = '') {
    const system = workflowGenerationPrompt.system;

    // 兼容旧 prompt 的 user 参数签名：user(userInput, pageAnalysis, dataSample)
    let user;
    if (typeof workflowGenerationPrompt.user === 'function') {
      user = workflowGenerationPrompt.user(userInput, { title: '', url: targetUrl, elementStats: {} }, []);
    } else {
      user = `用户需求: ${userInput}\n目标URL: ${targetUrl}`;
    }

    const res = await this.ollama.chat([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);

    const text = res?.message?.content || '';
    const json = extractJsonFromText(text);

    if (!json || !Array.isArray(json.steps)) {
      throw new Error(
        'AI 返回格式不正确，期望 JSON 且包含 steps 数组。请尝试更明确描述要抓取的字段与页面结构。'
      );
    }

    return {
      steps: json.steps,
      dataSchema: json.dataSchema || {},
    };
  }

  reset() {
    this.state.status = 'idle';
    this.state.error = null;
    this.state.lastAiOutput = null;
  }

  getState() {
    return { ...this.state };
  }
}

export default LangGraphAgent;
