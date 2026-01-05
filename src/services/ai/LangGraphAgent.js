/**
 * LangGraph Agent 核心
 * 使用 Ollama 和 Playwright 工具实现智能工作流生成
 */

import aiConfig from '@/config/ai.config';
import OllamaClient from './OllamaClient';
import PlaywrightTools from './PlaywrightTools';
import WorkflowGenerator from './WorkflowGenerator';
import {
  workflowGenerationPrompt,
  selectorOptimizationPrompt,
  dataExtractionPrompt,
} from './prompts/workflow-generation';

class LangGraphAgent {
  constructor(config = {}) {
    this.ollama = new OllamaClient(config.ollama || aiConfig.ollama);
    this.playwright = new PlaywrightTools();
    this.workflowGenerator = new WorkflowGenerator();

    // Agent 状态
    this.state = {
      userInput: '',
      targetUrl: '',
      extractionGoal: '',
      pageAnalysis: null,
      dataSample: null,
      workflowSteps: [],
      dataSchema: null,
      status: 'idle', // idle, analyzing, generating, completed, error
      error: null,
      conversationHistory: [],
    };

    // 工具列表
    this.tools = {
      analyzePage: this.analyzePage.bind(this),
      findDataLists: this.findDataLists.bind(this),
      extractDataSample: this.extractDataSample.bind(this),
      generateSelector: this.generateSelector.bind(this),
      detectPagination: this.detectPagination.bind(this),
      detectInfiniteScroll: this.detectInfiniteScroll.bind(this),
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

      // 初始化 Playwright 工具
      await this.playwright.initialize();

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
   * @param {number} tabId - Chrome 标签页 ID
   * @param {Function} onProgress - 进度回调
   */
  async generateWorkflow(userInput, tabId, onProgress) {
    try {
      this.state.status = 'analyzing';
      this.state.userInput = userInput;
      this.state.conversationHistory = [];

      // 1. 分析页面
      onProgress?.({ step: 'analyzing', message: '正在分析页面结构...' });
      const pageAnalysis = await this.analyzePage(tabId);
      this.state.pageAnalysis = pageAnalysis;
      this.state.targetUrl = pageAnalysis.url;

      // 2. 查找数据列表
      onProgress?.({ step: 'finding-lists', message: '正在查找数据列表...' });
      const dataLists = await this.findDataLists(tabId);

      // 3. 提取数据样本
      onProgress?.({
        step: 'extracting-sample',
        message: '正在提取数据样本...',
      });
      let dataSample = [];
      if (dataLists.length > 0) {
        const firstList = dataLists[0];
        dataSample = await this.extractDataSample(
          tabId,
          `${firstList.selector} > *`,
          firstList.selector,
          5
        );
      }
      this.state.dataSample = dataSample;

      // 4. 调用 AI 生成工作流步骤
      onProgress?.({
        step: 'generating-steps',
        message: '正在生成工作流步骤...',
      });
      const aiOutput = await this.generateWorkflowSteps(
        userInput,
        pageAnalysis,
        dataSample
      );

      this.state.workflowSteps = aiOutput.steps;
      this.state.dataSchema = aiOutput.dataSchema;

      // 5. 生成 Automa 工作流
      onProgress?.({
        step: 'building-workflow',
        message: '正在构建工作流...',
      });
      const workflow = this.workflowGenerator.generateWorkflow(
        aiOutput,
        userInput,
        pageAnalysis.url
      );

      // 6. 验证工作流
      const validation = this.workflowGenerator.validateWorkflow(workflow);
      if (!validation.valid) {
        console.warn('工作流验证失败:', validation.errors);
      }

      this.state.status = 'completed';
      onProgress?.({ step: 'completed', message: '工作流生成完成!' });

      return {
        success: true,
        workflow,
        validation,
        state: this.state,
      };
    } catch (error) {
      console.error('生成工作流失败:', error);
      this.state.status = 'error';
      this.state.error = error.message;

      onProgress?.({ step: 'error', message: `错误: ${error.message}` });

      return {
        success: false,
        error: error.message,
        state: this.state,
      };
    }
  }

  /**
   * 生成工作流步骤(调用 AI)
   */
  async generateWorkflowSteps(userInput, pageAnalysis, dataSample) {
    try {
      // 构建提示词
      const systemPrompt = workflowGenerationPrompt.system;
      const userPrompt = workflowGenerationPrompt.user(
        userInput,
        pageAnalysis,
        dataSample
      );

      // 调用 Ollama
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      this.state.conversationHistory.push(...messages);

      const response = await this.ollama.chat(messages, {
        temperature: 0.7,
        maxTokens: 2000,
      });

      // 解析 AI 响应
      const aiResponse = response.message.content;
      this.state.conversationHistory.push({
        role: 'assistant',
        content: aiResponse,
      });

      // 提取 JSON
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      let aiOutput;

      if (jsonMatch) {
        aiOutput = JSON.parse(jsonMatch[1]);
      } else {
        // 尝试直接解析
        aiOutput = JSON.parse(aiResponse);
      }

      return aiOutput;
    } catch (error) {
      console.error('AI 生成步骤失败:', error);

      // 返回默认步骤
      return {
        steps: [
          {
            type: 'NAVIGATE',
            description: '导航到目标页面',
            data: { url: pageAnalysis.url },
          },
          {
            type: 'WAIT',
            description: '等待页面加载',
            data: { time: 2000 },
          },
          {
            type: 'EXTRACT',
            description: '提取数据',
            selector: 'body',
            data: { columnName: 'content' },
          },
          {
            type: 'EXPORT',
            description: '导出数据',
            data: { type: 'json', filename: 'data' },
          },
        ],
        dataSchema: {
          content: {
            type: 'string',
            description: '页面内容',
          },
        },
      };
    }
  }

  /**
   * 分析页面
   */
  async analyzePage(tabId) {
    return this.playwright.analyzePage(tabId);
  }

  /**
   * 查找数据列表
   */
  async findDataLists(tabId) {
    return this.playwright.findDataLists(tabId);
  }

  /**
   * 提取数据样本
   */
  async extractDataSample(tabId, containerSelector, itemSelector, limit) {
    return this.playwright.extractDataSample(
      tabId,
      containerSelector,
      itemSelector,
      limit
    );
  }

  /**
   * 生成选择器
   */
  async generateSelector(tabId, elementInfo) {
    return this.playwright.generateSelector(tabId, elementInfo);
  }

  /**
   * 检测分页
   */
  async detectPagination(tabId) {
    return this.playwright.detectPagination(tabId);
  }

  /**
   * 检测无限滚动
   */
  async detectInfiniteScroll(tabId) {
    return this.playwright.detectInfiniteScroll(tabId);
  }

  /**
   * 优化选择器(调用 AI)
   */
  async optimizeSelector(elementInfo) {
    try {
      const systemPrompt = selectorOptimizationPrompt.system;
      const userPrompt = selectorOptimizationPrompt.user(elementInfo);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const response = await this.ollama.chat(messages, {
        temperature: 0.5,
        maxTokens: 500,
      });

      const aiResponse = response.message.content;
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('优化选择器失败:', error);
      return null;
    }
  }

  /**
   * 分析数据提取需求(调用 AI)
   */
  async analyzeDataExtraction(dataSample, userRequirement) {
    try {
      const systemPrompt = dataExtractionPrompt.system;
      const userPrompt = dataExtractionPrompt.user(dataSample, userRequirement);

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const response = await this.ollama.chat(messages, {
        temperature: 0.7,
        maxTokens: 1000,
      });

      const aiResponse = response.message.content;
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('分析数据提取失败:', error);
      return null;
    }
  }

  /**
   * 重置状态
   */
  reset() {
    this.state = {
      userInput: '',
      targetUrl: '',
      extractionGoal: '',
      pageAnalysis: null,
      dataSample: null,
      workflowSteps: [],
      dataSchema: null,
      status: 'idle',
      error: null,
      conversationHistory: [],
    };
  }

  /**
   * 获取当前状态
   */
  getState() {
    return { ...this.state };
  }
}

export default LangGraphAgent;
