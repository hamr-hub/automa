/**
 * LangGraph Agent 核心
 * 使用 Ollama 实现对话式工作流生成
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import WorkflowGenerator from './WorkflowGenerator';
import {
  workflowGenerationPrompt,
} from './prompts/workflow-generation';

class LangGraphAgent {
  constructor(config = {}) {
    this.ollama = new OllamaClient(config.ollama || aiConfig.ollama);
    this.workflowGenerator = new WorkflowGenerator();

    // Agent 状态
    this.state = {
      userInput: '',
      targetUrl: '',
      extractionGoal: '',
      workflowSteps: [],
      dataSchema: null,
      status: 'idle', // idle, generating, completed, error
      error: null,
      conversationHistory: [],
    };
  }

  /**
   * 初始化 Agent
   */
  async initialize() {
    try {
      // 检查 Ollama 服务
      const isHealthy = await this.ollama.checkHealth();
      if (!isHealthy) {
        throw new Error(
          'Ollama 服务不可用,请确保 Ollama 已启动 (运行: ollama serve)'
        );
      }

      // eslint-disable-next-line no-console
      console.log('LangGraph Agent 初始化成功');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('LangGraph Agent 初始化失败:', error);
      this.state.status = 'error';
      this.state.error = error.message;
      return false;
    }
  }

  /**
   * 生成工作流(主入口)
   * @param {string} userInput - 用户输入的需求
   * @param {string} targetUrl - 目标 URL（可选）
   * @param {Function} onProgress - 进度回调
   */
  async generateWorkflow(userInput, targetUrl, onProgress) {
    try {
      this.state.status = 'generating';
      this.state.userInput = userInput;
      this.state.targetUrl = targetUrl;
      this.state.conversationHistory = [];

      // 1. 