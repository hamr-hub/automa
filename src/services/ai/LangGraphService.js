/**
 * 简化版状态图管理 (浏览器兼容版本)
 * 替代 @langchain/langgraph 以在浏览器扩展中运行
 */

import OllamaClient from './OllamaClient.js';
import WorkflowGenerator from './WorkflowGenerator.js';
import aiConfig from '../../config/ai.config.js';
import { workflowGenerationPrompt } from './prompts/workflow-generation.js';
import { interactiveAgentPrompt } from './prompts/interactive-mode.js';
import { getPageContext, executeBlockInTab } from './aiUtils.js';
import Browser from 'webextension-polyfill';

class StateGraph {
  constructor(config) {
    this.config = config;
    this.nodes = new Map();
    this.edges = new Map();
    this.conditionalEdges = new Map();
  }

  addNode(name, fn) {
    this.nodes.set(name, fn);
    return this;
  }

  addEdge(fromNode, toNode) {
    if (!this.edges.has(fromNode)) {
      this.edges.set(fromNode, []);
    }
    this.edges.get(fromNode).push(toNode);
    return this;
  }

  addConditionalEdges(fromNode, condition, edgeMapping) {
    this.conditionalEdges.set(fromNode, { condition, edgeMapping });
    return this;
  }

  setEntryPoint(nodeName) {
    this.entryPoint = nodeName;
    return this;
  }

  compile() {
    return {
      invoke: async (initialState) => {
        let currentNode = this.entryPoint;
        let state = { ...initialState };
        const channels = this.config.channels || {};

        while (currentNode && currentNode !== 'END') {
          // Check for abort
          if (state.abortSignal && state.abortSignal.aborted) {
            throw new Error('Aborted by user');
          }

          const nodeFn = this.nodes.get(currentNode);
          if (!nodeFn) {
            throw new Error(`Node ${currentNode} not found`);
          }

          // 执行节点函数
          const result = await nodeFn(state);

          // 更新状态 (Apply Reducers)
          if (result) {
            for (const key of Object.keys(result)) {
              if (channels[key] && channels[key].value) {
                // Apply reducer: (oldValue, newValue) => combinedValue
                state[key] = channels[key].value(state[key], result[key]);
              } else {
                // Default: Overwrite
                state[key] = result[key];
              }
            }
          }

          // 决定下一个节点
          if (this.conditionalEdges.has(currentNode)) {
            const { condition, edgeMapping } =
              this.conditionalEdges.get(currentNode);
            const nextNodeName = await condition(state);
            currentNode = edgeMapping[nextNodeName] || 'END';
          } else if (this.edges.has(currentNode)) {
            const nextNodes = this.edges.get(currentNode);
            currentNode = nextNodes[0] || 'END';
          } else {
            currentNode = 'END';
          }
        }

        return state;
      },
    };
  }
}

const END = 'END';

/**
 * LangGraph Service
 * Orchestrates the AI workflow generation using a state graph.
 */
class LangGraphService {
  constructor(config = {}, ollamaClient = null) {
    this.ollama =
      ollamaClient || new OllamaClient(config.ollama || aiConfig.ollama);
    this.workflowGenerator = new WorkflowGenerator();
    this.graph = this.buildGraph();
    this.maxRetries = 3;
  }

  /**
   * Define the State Schema
   * messages: Chat history
   * userInput: Original user request
   * targetUrl: Optional target URL
   * generatedJson: The raw JSON from AI
   * workflow: The final Automa workflow object
   * error: Error message
   * retryCount: Number of retries
   */
  getInitialState() {
    return {
      messages: [],
      userInput: '',
      targetUrl: '',
      pageContext: '', // DOM string
      generatedJson: null,
      workflow: null,
      error: null,
      retryCount: 0,
      currentWorkflow: null,
    };
  }

  /**
   * Build the LangGraph structure
   */
  buildGraph() {
    const graphBuilder = new StateGraph({
      channels: {
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        userInput: { value: (x, y) => y || x, default: () => '' },
        targetUrl: { value: (x, y) => y || x, default: () => '' },
        pageContext: { value: (x, y) => y || x, default: () => '' },
        generatedJson: { value: (_x, y) => y, default: () => null },
        workflow: { value: (_x, y) => y, default: () => null },
        error: { value: (_x, y) => y, default: () => null },
        retryCount: { value: (_x, y) => y, default: () => 0 },
        onProgress: { value: (x) => x, default: () => null }, // Keep original callback
        currentWorkflow: { value: (x) => x, default: () => null }, // Immutable context
      },
    });

    // Define Nodes
    graphBuilder.addNode(
      'input_processing',
      this.inputProcessingNode.bind(this)
    );
    graphBuilder.addNode('generation', this.generationNode.bind(this));
    graphBuilder.addNode('validation', this.validationNode.bind(this));
    graphBuilder.addNode('correction', this.correctionNode.bind(this));

    // Define Edges
    graphBuilder.setEntryPoint('input_processing');
    graphBuilder.addEdge('input_processing', 'generation');
    graphBuilder.addEdge('generation', 'validation'); // Added missing edge
    graphBuilder.addEdge('correction', 'generation');

    // Conditional Edge from Validation
    graphBuilder.addConditionalEdges(
      'validation',
      (state) => {
        if (state.workflow) {
          return 'end';
        }
        if (state.retryCount >= this.maxRetries) {
          return 'end'; // Or failure node
        }
        return 'correction';
      },
      {
        end: END,
        correction: 'correction',
      }
    );

    return graphBuilder.compile();
  }

  /**
   * Node: Process Input
   */
  async inputProcessingNode(state) {
    console.warn('[LangGraph] Processing Input:', state.userInput);
    return {};
  }

  /**
   * Node: Generate JSON using Ollama
   */
  async generationNode(state) {
    const attempt = state.retryCount + 1;
    const msg = `正在生成工作流 (第 ${attempt} 次尝试)...`;
    console.warn(`[LangGraph] ${msg}`);
    console.warn('DEBUG: onProgress type:', typeof state.onProgress);
    state.onProgress?.({ step: 'generation', message: msg, attempt });

    try {
      const response = await this.ollama.chat(state.messages, {
        signal: state.abortSignal,
      });
      const content = response.message.content;

      return {
        messages: [{ role: 'assistant', content }],
        generatedJson: this.extractJson(content),
      };
    } catch (error) {
      if (
        error.message === 'Aborted by user' ||
        (state.abortSignal && state.abortSignal.aborted)
      ) {
        throw new Error('Aborted by user');
      }
      console.error('[LangGraph] Generation Error:', error);
      return { error: error.message };
    }
  }

  /**
   * Node: Validate JSON and Build Workflow
   */
  async validationNode(state) {
    console.warn('[LangGraph] Validating...');
    state.onProgress?.({ step: 'validation', message: '正在验证生成结果...' });

    if (!state.generatedJson) {
      const errorMsg =
        'AI 返回的内容中未找到有效的 JSON 格式。请确保模型输出包含 ```json 代码块。';
      console.error('[LangGraph]', errorMsg);
      return {
        error: errorMsg,
        retryCount: state.retryCount + 1,
      };
    }

    try {
      // Validate structure basics
      if (
        !state.generatedJson.steps ||
        !Array.isArray(state.generatedJson.steps)
      ) {
        throw new Error('Invalid JSON structure: missing "steps" array');
      }

      // Try to generate the actual Automa workflow
      const workflow = this.workflowGenerator.generateWorkflow(
        state.generatedJson,
        state.userInput,
        state.targetUrl
      );

      console.warn('[LangGraph] Validation Success!');
      return { workflow, error: null };
    } catch (error) {
      console.warn('[LangGraph] Validation Failed:', error.message);
      return { error: error.message, retryCount: state.retryCount + 1 };
    }
  }

  /**
   * Node: Correction (Refinement)
   */
  async correctionNode(state) {
    console.warn('[LangGraph] Applying Correction...');

    const correctionMessage = `上一次生成的 JSON 格式有误。错误信息: ${state.error}

请注意:
1. 必须使用标准 JSON 格式
2. 字符串必须用双引号
3. null 值必须使用 null（不能使用 None）
4. 布尔值必须使用 true/false（不能使用 True/False）
5. 必须包含 steps 数组和 dataSchema 对象

请修正并只返回 JSON（使用 \`\`\`json 代码块包裹）。`;

    return {
      messages: [{ role: 'user', content: correctionMessage }],
    };
  }

  /**
   * Build the Interactive Mode Graph
   */
  buildInteractiveGraph() {
    const graphBuilder = new StateGraph({
      channels: {
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        goal: { value: (x, y) => y || x, default: () => '' },
        pageContext: { value: (_x, y) => y, default: () => '' },
        history: { value: (x, y) => x.concat(y), default: () => [] },
        currentWorkflow: { value: (_x, y) => y, default: () => [] },
        lastAction: { value: (_x, y) => y, default: () => null },
        error: { value: (_x, y) => y, default: () => null },
        onProgress: { value: (x) => x, default: () => null },
        abortSignal: { value: (x) => x, default: () => null },
      },
    });

    graphBuilder.addNode('analyze', this.analyzeNode.bind(this));
    graphBuilder.addNode('decide', this.decisionNode.bind(this));
    graphBuilder.addNode('execute', this.executionNode.bind(this));

    graphBuilder.setEntryPoint('analyze');

    graphBuilder.addEdge('analyze', 'decide');

    graphBuilder.addConditionalEdges(
      'decide',
      (state) => {
        if (state.lastAction?.type === 'DONE') {
          return 'end';
        }
        return 'execute';
      },
      {
        end: END,
        execute: 'execute',
      }
    );

    graphBuilder.addEdge('execute', 'analyze');

    return graphBuilder.compile();
  }

  /**
   * Node: Analyze Page
   */
  async analyzeNode(state) {
    state.onProgress?.({ step: 'analyze', message: '正在分析页面...' });

    if (state.abortSignal?.aborted) throw new Error('Aborted by user');

    // Wait for page to be ready/stable?
    // In a real scenario, we might want to wait for network idle.
    // For now, we assume execution node waited enough.

    const context = await getPageContext();
    return {
      pageContext: context ? context.dom : '',
    };
  }

  /**
   * Node: Decide Next Step
   */
  async decisionNode(state) {
    state.onProgress?.({ step: 'decide', message: '正在思考下一步操作...' });

    const prompt = interactiveAgentPrompt.user(
      state.goal,
      state.pageContext,
      state.history,
      state.currentWorkflow
    );

    const messages = [
      { role: 'system', content: interactiveAgentPrompt.system },
      { role: 'user', content: prompt },
    ];

    try {
      const response = await this.ollama.chat(messages, {
        signal: state.abortSignal,
        format: 'json', // Try to enforce JSON if possible
      });

      const content = response.message.content;
      const action = this.extractJson(content);

      if (!action) {
        throw new Error('Failed to parse AI action');
      }

      return {
        lastAction: action,
        messages: [{ role: 'assistant', content }],
      };
    } catch (error) {
      console.error('Decision Error:', error);
      throw error;
    }
  }

  /**
   * Node: Execute Action
   */
  async executionNode(state) {
    const action = state.lastAction;
    state.onProgress?.({
      step: 'execute',
      message: `执行操作: ${action.type}`,
    });

    try {
      const step = {
        type: action.type,
        selector: action.selector,
        description: action.reason,
        data: {
          value: action.value,
          url: action.url,
          ...action, // pass all other props
        },
      };

      let block = null;

      if (action.type === 'NAVIGATE') {
        if (action.url) {
          await Browser.tabs.update({ url: action.url });
          // Wait for navigation
          await new Promise((r) => setTimeout(r, 3000));
        }
        block = this.workflowGenerator.createNodeFromStep(step, 0);
      } else if (action.type === 'WAIT') {
        await new Promise((r) => setTimeout(r, action.time || 2000));
        block = this.workflowGenerator.createNodeFromStep(step, 0);
      } else if (action.type !== 'DONE') {
        block = this.workflowGenerator.createNodeFromStep(step, 0);
        if (block) {
          // Execute in Tab
          // Note: Some blocks like 'loop-start' might not need execution on page,
          // but usually we want to verify selectors.
          // For loop-elements, we can try highlighting.
          // For now, try to execute everything that maps to a block.
          await executeBlockInTab(block);

          // If click, wait for potential navigation
          if (action.type === 'CLICK') {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      const newWorkflow = block
        ? [...state.currentWorkflow, block]
        : state.currentWorkflow;

      const historyItem = {
        action: action.type,
        selector: action.selector,
        status: 'SUCCESS',
      };

      return {
        currentWorkflow: newWorkflow,
        history: [historyItem],
      };
    } catch (error) {
      console.error('Execution Error:', error);
      // Don't stop the whole graph, just record failure and maybe AI will retry?
      // For now, let's throw to stop, or return error state.
      // If we return error, the next decide node will see it in history.
      return {
        history: [
          { action: action.type, status: 'FAILED', error: error.message },
        ],
        // error: error.message // If we set error, it might be global.
      };
    }
  }

  /**
   * Run Interactive Session
   */
  async runInteractive(goal, onProgress, abortSignal) {
    const graph = this.buildInteractiveGraph();
    const initialState = {
      goal,
      onProgress,
      abortSignal,
    };

    const result = await graph.invoke(initialState);
    return result.currentWorkflow;
  }

  /**
   * Helper: Extract JSON from text
   */
  extractJson(text) {
    try {
      // Try parsing directly
      return JSON.parse(text);
    } catch {
      // Extract from markdown code blocks
      const match =
        text.match(/```json([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
      if (match) {
        try {
          // Clean up Python-specific syntax before parsing
          let cleanedJson = match[1].trim();
          // Replace Python None with null
          cleanedJson = cleanedJson.replace(/:\s*None/g, ': null');
          // Replace Python True with true
          cleanedJson = cleanedJson.replace(/:\s*True/g, ': true');
          // Replace Python False with false
          cleanedJson = cleanedJson.replace(/:\s*False/g, ': false');

          return JSON.parse(cleanedJson);
        } catch (e2) {
          console.error('[LangGraph] JSON Parse Error:', e2.message);
          console.error(
            '[LangGraph] Attempted to parse:',
            match[1].substring(0, 200)
          );
          return null;
        }
      }
      console.error('[LangGraph] No JSON code block found in response');
      return null;
    }
  }

  /**
   * Execute the workflow generation graph
   */
  async run(
    userInput,
    targetUrl = '',
    history = [],
    pageContext = '',
    abortSignal = null,
    onProgress = null,
    currentWorkflow = null
  ) {
    // Prepend System Prompt to history if needed
    if (history.length === 0 || history[0].role !== 'system') {
      history.unshift({
        role: 'system',
        content: workflowGenerationPrompt.system,
      });
    }

    // Inject/Update Current Workflow Context
    if (currentWorkflow) {
      const workflowJson = JSON.stringify(currentWorkflow);
      const contextContent = `Current Workflow Context (JSON):\n\`\`\`json\n${workflowJson}\n\`\`\`\n\nTask: Modify this workflow based on the user's latest request. Return the COMPLETE updated workflow JSON.`;

      const contextIndex = history.findIndex(
        (m) =>
          m.role === 'system' &&
          m.content.startsWith('Current Workflow Context')
      );

      if (contextIndex !== -1) {
        history[contextIndex].content = contextContent;
      } else {
        // Insert after system prompt (index 1)
        history.splice(1, 0, { role: 'system', content: contextContent });
      }
    }

    const initialState = {
      ...this.getInitialState(),
      userInput,
      targetUrl,
      pageContext,
      messages: history.length > 0 ? history : [],
      abortSignal,
      onProgress, // Pass callback to state
      currentWorkflow, // Pass current workflow
    };

    const result = await this.graph.invoke(initialState);

    if (!result.workflow) {
      // If we have a specific error from the last step (e.g. Validation failed), use it.
      const specificError =
        result.error || 'Failed to generate workflow (Unknown error)';
      // Add context if available
      const detailedError =
        result.retryCount >= this.maxRetries
          ? `Failed after ${result.retryCount} retries. Last error: ${specificError}`
          : specificError;

      throw new Error(detailedError);
    }

    return result.workflow;
  }

  /**
   * 运行渐进式工作流生成
   * 支持分步骤生成、验证、继续的循环
   *
   * @param {Object} options - 配置选项
   * @param {string} options.userInput - 用户输入
   * @param {string} options.targetUrl - 目标URL
   * @param {Array} options.history - 对话历史
   * {Function} options.onProgress - 进度回调
   * @param {Object} options.abortSignal - 中止信号
   * @param {Object} options.currentWorkflow - 当前工作流（增量修改时）
   * @param {boolean} options.incremental - 是否为增量模式
   * @param {number} options.maxIterations - 最大迭代次数
   * @returns {Promise<Object>} 生成结果
   */
  async runIncremental(options) {
    const {
      userInput,
      targetUrl = '',
      tabId = null,
      history = [],
      onProgress = null,
      abortSignal = null,
      currentWorkflow = null,
      incremental = true,
      maxIterations = 5,
    } = options;

    const graph = this.buildIncrementalGraph();
    const initialState = {
      ...this.getIncrementalInitialState(),
      userInput,
      targetUrl,
      tabId,
      messages: history.length > 0 ? history : [],
      abortSignal,
      onProgress,
      currentWorkflow: currentWorkflow?.drawflow || null,
      incremental,
      maxIterations,
      iterationCount: 0,
    };

    const result = await graph.invoke(initialState);

    if (!result.workflow) {
      throw new Error(result.error || 'Failed to generate workflow');
    }

    return {
      workflow: result.workflow,
      message: result.message,
      iterations: result.iterationCount,
      completed: result.completed,
      executionResults: result.executionResults,
    };
  }

  /**
   * 获取渐进式初始状态
   */
  getIncrementalInitialState() {
    return {
      messages: [],
      userInput: '',
      targetUrl: '',
      tabId: null,
      pageContext: '',
      generatedJson: null,
      workflow: null,
      error: null,
      retryCount: 0,
      currentWorkflow: null,
      incremental: true,
      maxIterations: 5,
      iterationCount: 0,
      completed: false,
      onProgress: null,
      abortSignal: null,
    };
  }

  /**
   * 构建渐进式图
   * 支持分步骤生成和验证
   */
  buildIncrementalGraph() {
    const graphBuilder = new StateGraph({
      channels: {
        messages: { value: (x, y) => x.concat(y), default: () => [] },
        userInput: { value: (x, y) => y || x, default: () => '' },
        targetUrl: { value: (x, y) => y || x, default: () => '' },
        tabId: { value: (x, y) => y || x, default: () => null },
        pageContext: { value: (x, y) => y || x, default: () => '' },
        generatedJson: { value: (x, y) => y, default: () => null },
        workflow: { value: (x, y) => y, default: () => null },
        error: { value: (x, y) => y, default: () => null },
        retryCount: { value: (x, y) => y, default: () => 0 },
        onProgress: { value: (x) => x, default: () => null },
        currentWorkflow: { value: (_x, y) => y, default: () => null },
        incremental: { value: (x, y) => y, default: () => true },
        maxIterations: { value: (x, y) => y, default: () => 5 },
        iterationCount: { value: (x, y) => y, default: () => 0 },
        completed: { value: (x, y) => y, default: () => false },
        thinkingSteps: { value: (x, y) => x.concat(y), default: () => [] },
        executionResults: { value: (x, y) => y, default: () => [] },
      },
    });

    // 定义节点
    graphBuilder.addNode('analyze', this.incrementalAnalyzeNode.bind(this));
    graphBuilder.addNode('generate', this.incrementalGenerateNode.bind(this));
    graphBuilder.addNode('execute', this.incrementalExecuteNode.bind(this));
    graphBuilder.addNode('verify', this.incrementalVerifyNode.bind(this));
    graphBuilder.addNode('complete', this.incrementalCompleteNode.bind(this));
    graphBuilder.addNode('error', this.incrementalErrorNode.bind(this));

    // 设置入口点
    graphBuilder.setEntryPoint('analyze');

    // 定义边
    graphBuilder.addEdge('analyze', 'generate');
    graphBuilder.addEdge('generate', 'execute');
    graphBuilder.addEdge('execute', 'verify');

    // 条件边：从验证决定下一步
    graphBuilder.addConditionalEdges(
      'verify',
      (state) => {
        // 如果完成或达到最大迭代次数，进入完成节点
        if (state.completed || state.iterationCount >= state.maxIterations) {
          return 'complete';
        }
        // 如果有错误，进入错误处理
        if (state.error) {
          return 'error';
        }
        // 继续生成下一个迭代
        return 'generate';
      },
      {
        complete: 'complete',
        error: 'error',
        generate: 'generate',
      }
    );

    // 错误节点：修正后重新生成
    graphBuilder.addConditionalEdges(
      'error',
      (state) => {
        if (state.retryCount >= 3) {
          return 'complete';
        }
        return 'generate';
      },
      {
        complete: 'complete',
        generate: 'generate',
      }
    );

    return graphBuilder.compile();
  }

  /**
   * 节点：分析用户输入和当前工作流状态
   */
  async incrementalAnalyzeNode(state) {
    const msg = '正在分析需求...';
    state.onProgress?.({
      step: 'analyze',
      message: msg,
      iteration: state.iterationCount + 1,
      thinking: {
        phase: 'analyze',
        thought: '理解用户需求，分析当前工作流状态',
        details: {
          userInput: state.userInput,
          hasCurrentWorkflow: !!state.currentWorkflow,
          nodesCount: state.currentWorkflow?.nodes?.length || 0,
        },
      },
    });

    return {
      thinkingSteps: [
        {
          phase: 'analyze',
          thought: '分析用户需求和当前工作流状态',
          timestamp: Date.now(),
        },
      ],
    };
  }

  /**
   * 节点：增量生成工作流节点
   */
  async incrementalGenerateNode(state) {
    const attempt = state.retryCount + 1;
    const msg = `正在生成工作流 (第 ${state.iterationCount + 1} 次迭代, 第 ${attempt} 次尝试)...`;
    console.warn(`[Incremental] ${msg}`);

    state.onProgress?.({
      step: 'generate',
      message: msg,
      iteration: state.iterationCount + 1,
      attempt,
      thinking: {
        phase: 'generate',
        thought: '生成新的工作流节点',
        details: {
          attempt,
          currentNodesCount: state.currentWorkflow?.nodes?.length || 0,
        },
      },
    });

    try {
      // 构建生成提示
      const messages = this.buildIncrementalPrompt(state);

      const response = await this.ollama.chat(messages, {
        signal: state.abortSignal,
      });

      const content = response.message.content;
      const generatedJson = this.extractJson(content);

      if (!generatedJson) {
        return {
          error: 'AI 返回的内容中未找到有效的 JSON 格式',
          retryCount: state.retryCount + 1,
        };
      }

      // 处理AI的思考过程
      if (generatedJson.thinking) {
        state.onProgress?.({
          step: 'thinking',
          message: 'AI 正在思考...',
          iteration: state.iterationCount + 1,
          thinking: {
            phase: 'ai_thinking',
            thought: generatedJson.thinking,
            details: {
              action: generatedJson.action,
              reason: generatedJson.reason,
            },
          },
        });
      }

      // 合并生成的结果到当前工作流
      const updatedWorkflow = this.mergeWorkflowDelta(
        state.currentWorkflow,
        generatedJson
      );

      // 检查AI是否认为工作流已完成
      const completed = generatedJson.action === 'complete';

      return {
        messages: [{ role: 'assistant', content }],
        generatedJson,
        workflow: updatedWorkflow,
        iterationCount: state.iterationCount + 1,
        completed: completed,
        error: null,
        retryCount: 0,
        thinkingSteps: [
          {
            phase: 'generate',
            thought: generatedJson.thinking || '生成了新的工作流节点',
            timestamp: Date.now(),
            action: generatedJson.action,
            reason: generatedJson.reason,
          },
        ],
      };
    } catch (error) {
      if (error.message === 'Aborted by user' || state.abortSignal?.aborted) {
        throw new Error('Aborted by user');
      }
      console.error('[Incremental] Generation Error:', error);
      return { error: error.message, retryCount: state.retryCount + 1 };
    }
  }

  /**
   * 构建增量生成提示
   */
  /**
   * 评估工作流完成度
   */
  estimateCompletion(userInput, workflow) {
    const inputLower = userInput.toLowerCase();
    let completion = 0;

    // 基础完成度：有节点就有基础分数
    if (workflow.nodes.length > 0) {
      completion += 20;
    }

    // 检查是否有触发器
    if (workflow.nodes.some((node) => node.label === 'trigger')) {
      completion += 15;
    }

    // 检查是否有新标签页节点（如果需要）
    if (inputLower.includes('打开') || inputLower.includes('navigate')) {
      if (workflow.nodes.some((node) => node.label === 'new-tab')) {
        completion += 15;
      }
    }

    // 检查是否有数据提取节点
    if (
      inputLower.includes('提取') ||
      inputLower.includes('获取') ||
      inputLower.includes('scrap')
    ) {
      if (
        workflow.nodes.some((node) =>
          ['get-text', 'attribute-value'].includes(node.label)
        )
      ) {
        completion += 20;
      }
    }

    // 检查是否有循环节点（如果需要）
    if (
      inputLower.includes('循环') ||
      inputLower.includes('遍历') ||
      inputLower.includes('loop')
    ) {
      if (
        workflow.nodes.some((node) =>
          ['loop-data', 'loop-elements', 'while-loop'].includes(node.label)
        )
      ) {
        completion += 15;
      }
    }

    // 检查是否有导出节点
    if (
      inputLower.includes('导出') ||
      inputLower.includes('保存') ||
      inputLower.includes('export')
    ) {
      if (workflow.nodes.some((node) => node.label === 'export-data')) {
        completion += 15;
      }
    }

    // 确保完成度不超过100%
    return Math.min(completion, 100);
  }

  /**
   * 构建增量生成提示
   */
  buildIncrementalPrompt(state) {
    const systemPrompt =
      '你是一个工作流生成专家。你的任务是根据用户需求逐步生成或修改浏览器自动化工作流。\n\n工作流由以下节点类型组成：\n- trigger: 触发器（手动、定时等）\n- new-tab: 打开新标签页\n- delay: 等待/延迟\n- event-click: 点击元素\n- element-scroll: 滚动元素\n- get-text: 获取文本\n- attribute-value: 获取属性值\n- loop-data: 循环数据\n- loop-elements: 循环元素\n- while-loop: 条件循环\n- export-data: 导出数据\n- forms: 表单输入\n- conditions: 条件判断\n\n重要规则：\n1. 每次只生成 1-3 个新节点，确保生成的节点能够独立执行并验证\n2. 如果是修改现有工作流，基于 currentWorkflow 继续扩展\n3. 确保新节点能正确连接到现有节点\n4. 生成的 JSON 必须使用标准 JSON 格式\n5. 分析当前工作流状态，判断是否需要进一步扩展或完成\n6. 如果工作流还未完成，生成下一组节点以继续实现用户需求\n7. 如果工作流已经完整实现了用户需求，返回 action: "complete"\n8. 必须包含详细的思考过程，解释为什么要生成这些节点\n9. 根据当前工作流状态，自动发起新一轮对话直到工作流完成\n10. 支持基于现有tab继续操作，如果指定了tabId，则在该tab上执行操作\n11. 在生成节点前，先思考当前工作流的完成度和下一步需要做什么';

    let userPrompt = '用户需求: ' + state.userInput;

    if (state.targetUrl) {
      userPrompt += '\n目标URL: ' + state.targetUrl;
    }

    if (state.tabId) {
      userPrompt += '\n指定Tab ID: ' + state.tabId + ' (在此tab上执行操作)';
    }

    if (state.currentWorkflow && state.currentWorkflow.nodes) {
      const completion = this.estimateCompletion(
        state.userInput,
        state.currentWorkflow
      );
      userPrompt +=
        '\n\n当前工作流已有 ' + state.currentWorkflow.nodes.length + ' 个节点:';
      state.currentWorkflow.nodes.forEach((node, i) => {
        userPrompt +=
          '\n' +
          (i + 1) +
          '. ' +
          node.label +
          (node.data?.description ? ': ' + node.data.description : '');
      });

      // 添加当前工作流状态分析
      userPrompt +=
        '\n\n当前工作流状态分析：\n- 已生成 ' +
        state.currentWorkflow.nodes.length +
        ' 个节点\n- 节点连接情况：' +
        state.currentWorkflow.edges.length +
        ' 条连接\n- 距离用户需求的完成度：' +
        completion +
        '%\n- 当前迭代次数：' +
        state.iterationCount +
        '/' +
        state.maxIterations +
        '\n\n请基于以上信息，分析当前工作流状态，并生成下一步需要添加的节点。返回格式如下：\n```json\n{\n  "action": "add|modify|complete",\n  "reason": "为什么要执行这个操作，包括对当前工作流状态的分析",\n  "steps": [\n    {"type": "节点类型", "description": "节点描述", "data": {...}}\n  ],\n  "connectFrom": "新节点应该连接到的最后一个节点ID（如果有）",\n  "thinking": "你的思考过程，包括：\\n1. 分析用户需求的核心目标\\n2. 评估当前工作流的完成情况（完成度' +
        completion +
        '%）\\n3. 确定下一步需要实现的功能\\n4. 选择合适的节点类型来实现这些功能\\n5. 解释为什么这些节点能够帮助实现用户需求\\n6. 判断工作流是否已完成"\n}\n```\n\n思考过程应该包含：\n1. 分析用户需求的核心目标\n2. 评估当前工作流的完成情况\n3. 确定下一步需要实现的功能\n4. 选择合适的节点类型来实现这些功能\n5. 解释为什么这些节点能够帮助实现用户需求';
    } else {
      userPrompt +=
        '\n\n请生成工作流的前几个核心节点（1-3个），包括触发器和初始步骤。返回格式如下：\n```json\n{\n  "action": "create",\n  "reason": "创建工作流的初始节点",\n  "steps": [\n    {"type": "trigger", "description": "触发方式"},\n    {"type": "new-tab", "description": "打开目标页面", "data": {"url": "..."}}\n  ],\n  "thinking": "你的思考过程，包括为什么要生成这些初始节点,它们如何帮助实现用户需求"\n}\n```';
    }

    return [
      { role: 'system', content: systemPrompt },
      ...state.messages.filter((m) => m.role !== 'system'),
      { role: 'user', content: userPrompt },
    ];
  }

  /**
   * 合并增量生成结果到工作流
   */
  mergeWorkflowDelta(currentWorkflow, generatedJson) {
    if (!currentWorkflow) {
      // 首次创建
      return this.workflowGenerator.generateWorkflow(
        {
          steps: generatedJson.steps || [],
          dataSchema: generatedJson.dataSchema || {},
        },
        '',
        ''
      ).drawflow;
    }

    const { nodes = [], edges = [] } = currentWorkflow;

    // 添加新节点
    if (generatedJson.steps && Array.isArray(generatedJson.steps)) {
      const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : null;
      const startPosition = lastNode
        ? { x: lastNode.position.x + 280, y: lastNode.position.y }
        : { x: 50, y: 50 };

      generatedJson.steps.forEach((step, index) => {
        const node = this.workflowGenerator.createNodeFromStep(step, index);
        if (node) {
          node.position = {
            x: startPosition.x + index * 280,
            y: startPosition.y + Math.floor(index / 4) * 150,
          };
          nodes.push(node);

          // 添加边（如果需要）
          if (lastNode || (index > 0 && nodes[nodes.length - 2])) {
            const sourceNode = index === 0 ? lastNode : nodes[nodes.length - 2];
            if (sourceNode) {
              edges.push({
                id: `edge-${Date.now()}-${index}`,
                source: sourceNode.id,
                target: node.id,
                sourceHandle: `${sourceNode.id}-output-1`,
                targetHandle: `${node.id}-input`,
                type: 'custom',
              });
            }
          }
        }
      });
    }

    return { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } };
  }

  /**
   * 节点：执行并验证新生成的节点
   */
  async incrementalExecuteNode(state) {
    const generatedJson = state.generatedJson;
    const msg = '正在执行并验证新生成的节点...';
    console.log(`[Incremental] ${msg}`);

    state.onProgress?.({
      step: 'execute',
      message: msg,
      iteration: state.iterationCount,
      thinking: {
        phase: 'execute',
        thought: '执行新生成的节点，验证其正确性',
        details: {
          stepsCount: generatedJson?.steps?.length || 0,
          action: generatedJson?.action,
        },
      },
    });

    try {
      const executionResults = [];

      if (generatedJson?.steps && Array.isArray(generatedJson.steps)) {
        for (const step of generatedJson.steps) {
          try {
            const node = this.workflowGenerator.createNodeFromStep(step, 0);

            if (node) {
              let executionResult = {
                stepType: step.type,
                stepDescription: step.description,
                success: true,
                message: '节点创建成功',
              };

              if (
                state.tabId &&
                step.type !== 'trigger' &&
                step.type !== 'export-data'
              ) {
                try {
                  await executeBlockInTab(node);
                  executionResult.message = '节点执行成功';
                  executionResult.executed = true;
                } catch (execError) {
                  executionResult.success = false;
                  executionResult.message = `节点执行失败: ${execError.message}`;
                  executionResult.error = execError.message;
                }
              }

              executionResults.push(executionResult);
            }
          } catch (error) {
            executionResults.push({
              stepType: step.type,
              stepDescription: step.description,
              success: false,
              message: `节点创建失败: ${error.message}`,
              error: error.message,
            });
          }
        }
      }

      const allSuccess = executionResults.every((r) => r.success);
      const failedResults = executionResults.filter((r) => !r.success);

      state.onProgress?.({
        step: 'execute',
        message: allSuccess
          ? '所有节点执行验证通过'
          : `部分节点执行失败 (${failedResults.length}/${executionResults.length})`,
        iteration: state.iterationCount,
        thinking: {
          phase: 'execute',
          thought: allSuccess
            ? '所有新生成的节点执行验证通过，可以继续生成'
            : '部分节点执行失败，需要修正',
          details: {
            totalSteps: executionResults.length,
            successCount: executionResults.filter((r) => r.success).length,
            failedCount: failedResults.length,
            executionResults,
          },
        },
      });

      return {
        executionResults,
        error: allSuccess
          ? null
          : `部分节点执行失败: ${failedResults.map((r) => r.message).join('; ')}`,
      };
    } catch (error) {
      console.error('[Incremental] Execution Error:', error);
      return {
        error: `执行验证失败: ${error.message}`,
      };
    }
  }

  /**
   * 节点：验证生成结果
   */
  async incrementalVerifyNode(state) {
    state.onProgress?.({
      step: 'verify',
      message: '正在验证生成结果...',
      iteration: state.iterationCount,
      thinking: {
        phase: 'verify',
        thought: '验证工作流结构和连接',
        details: {
          nodesCount: state.workflow?.nodes?.length || 0,
          edgesCount: state.workflow?.edges?.length || 0,
          generatedAction: state.generatedJson?.action,
        },
      },
    });

    // 验证工作流结构
    if (!state.workflow || !state.workflow.nodes) {
      return {
        error: '生成的工作流结构无效',
        completed: false,
      };
    }

    // 检查AI是否明确表示工作流已完成
    const aiCompleted = state.generatedJson?.action === 'complete';

    // 检查是否满足用户需求
    const isComplete =
      aiCompleted ||
      this.checkWorkflowComplete(state.userInput, state.workflow);

    const completionMessage = isComplete
      ? '工作流已完成，满足用户需求'
      : '工作流尚未完全满足用户需求，继续生成更多节点';

    state.onProgress?.({
      step: 'verify',
      message: completionMessage,
      iteration: state.iterationCount,
      thinking: {
        phase: 'verify',
        thought: completionMessage,
        details: {
          isComplete: isComplete,
          aiCompleted: aiCompleted,
          completionScore: this.estimateCompletion(
            state.userInput,
            state.workflow
          ),
        },
      },
    });

    return {
      completed: isComplete,
      thinkingSteps: [
        {
          phase: 'verify',
          thought: completionMessage,
          timestamp: Date.now(),
          isComplete: isComplete,
          aiCompleted: aiCompleted,
          completionScore: this.estimateCompletion(
            state.userInput,
            state.workflow
          ),
        },
      ],
    };
  }

  /**
   * 检查工作流是否完成
   */
  checkWorkflowComplete(userInput, workflow) {
    const inputLower = userInput.toLowerCase();

    // 检查是否包含必要的节点类型
    const hasTrigger = workflow.nodes.some((n) => n.label === 'trigger');
    const hasExport = workflow.nodes.some((n) => n.label === 'export-data');

    // 根据关键词判断
    const hasScraping =
      inputLower.includes('抓取') ||
      inputLower.includes('scrap') ||
      inputLower.includes('提取');

    // 基本规则：必须有触发器和导出节点（如果是抓取类任务）
    if (hasScraping && (!hasTrigger || !hasExport)) {
      return false;
    }

    // 如果已经有5个以上节点，并且没有明显的未完成操作，可以认为基本完成
    if (workflow.nodes.length >= 5) {
      const lastNode = workflow.nodes[workflow.nodes.length - 1];
      // 如果最后一个节点不是导出或结束节点，可能还需要继续
      if (
        lastNode &&
        !['export-data', 'close-tab', 'delay'].includes(lastNode.label)
      ) {
        // 但如果已经有一定规模，也认为可以结束
        return workflow.nodes.length >= 8;
      }
      return true;
    }

    return false;
  }

  /**
   * 节点：完成处理
   */
  async incrementalCompleteNode(state) {
    const msg = state.error
      ? `生成完成（有错误）: ${state.error}`
      : '工作流生成完成！';
    console.warn(`[Incremental] ${msg}`);

    state.onProgress?.({
      step: 'complete',
      message: msg,
      iteration: state.iterationCount,
      completed: true,
      thinking: {
        phase: 'complete',
        thought: state.error ? `遇到错误: ${state.error}` : '工作流生成完成',
        details: {
          totalNodes: state.workflow?.nodes?.length || 0,
          iterations: state.iterationCount,
          hasError: !!state.error,
        },
      },
    });

    return {
      message: state.error
        ? `工作流已生成，但存在一些问题: ${state.error}`
        : '工作流已成功生成！',
      completed: true,
    };
  }

  /**
   * 节点：错误处理
   */
  async incrementalErrorNode(state) {
    const msg = `处理错误: ${state.error}`;
    console.warn(`[Incremental] ${msg}`);

    state.onProgress?.({
      step: 'error',
      message: msg,
      iteration: state.iterationCount,
      retryCount: state.retryCount + 1,
      thinking: {
        phase: 'error',
        thought: `遇到错误，尝试修正（${state.retryCount + 1}/3次）`,
        details: {
          error: state.error,
          retryCount: state.retryCount,
        },
      },
    });

    return {
      messages: [
        {
          role: 'user',
          content: `上一次生成遇到错误: ${state.error}\n\n请修正这个问题并重试。`,
        },
      ],
      error: null, // 清除错误，让下一次迭代继续
    };
  }

  /**
   * 简单聊天调用 (不需要工作流生成、验证等复杂流程)
   * 适用于 AI Block、一次性查询等场景
   *
   * @param {Array} messages - 消息数组 [{role: 'user'|'assistant'|'system', content: '...'}]
   * @param {Object} options - 可选配置
   * @returns {Promise<Object>} AI 响应
   */
  async simpleChat(messages, options = {}) {
    try {
      const response = await this.ollama.chat(messages, options);
      return response;
    } catch (error) {
      console.error('[LangGraphService] Simple Chat Error:', error);
      throw error;
    }
  }

  /**
   * 简单生成调用 (不需要工作流生成、验证等复杂流程)
   *
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选配置
   * @returns {Promise<Object>} AI 响应
   */
  async simpleGenerate(prompt, options = {}) {
    try {
      const response = await this.ollama.generate(prompt, options);
      return response;
    } catch (error) {
      console.error('[LangGraphService] Simple Generate Error:', error);
      throw error;
    }
  }

  /**
   * 流式聊天调用
   *
   * @param {Array} messages - 消息数组
   * @param {Function} onChunk - 接收文本块的回调
   * @param {Object} options - 可选配置
   */
  async simpleChatStream(messages, onChunk, options = {}) {
    try {
      return await this.ollama.chatStream(messages, onChunk, options);
    } catch (error) {
      console.error('[LangGraphService] Simple Chat Stream Error:', error);
      throw error;
    }
  }

  /**
   * 流式生成调用
   *
   * @param {string} prompt - 提示词
   * @param {Function} onChunk - 接收文本块的回调
   * @param {Object} options - 可选配置
   */
  async simpleGenerateStream(prompt, onChunk, options = {}) {
    try {
      return await this.ollama.generateStream(prompt, onChunk, options);
    } catch (error) {
      console.error('[LangGraphService] Simple Generate Stream Error:', error);
      throw error;
    }
  }

  /**
   * 基于现有tab创建工作流
   * 支持用户选择基于哪个tab进行工作流创建
   *
   * @param {Object} options - 配置选项
   * @param {string} options.userInput - 用户输入
   * @param {number} options.tabId - 目标tab的ID
   * @param {string} options.targetUrl - 目标URL（可选）
   * @param {Array} options.history - 对话历史
   * @param {Function} options.onProgress - 进度回调
   * @param {Object} options.abortSignal - 中止信号
   * @param {Object} options.currentWorkflow - 当前工作流（增量修改时）
   * @param {number} options.maxIterations - 最大迭代次数
   * @returns {Promise<Object>} 生成结果
   */
  async createWorkflowFromTab(options) {
    const {
      userInput,
      tabId,
      targetUrl = '',
      history = [],
      onProgress = null,
      abortSignal = null,
      currentWorkflow = null,
      maxIterations = 5,
    } = options;

    if (!tabId) {
      throw new Error('tabId is required for creating workflow from tab');
    }

    onProgress?.({
      step: 'init',
      message: `正在从Tab ${tabId} 创建工作流...`,
      thinking: {
        phase: 'init',
        thought: '初始化基于tab的工作流创建',
        details: {
          tabId,
          userInput,
          targetUrl,
        },
      },
    });

    try {
      const result = await this.runIncremental({
        userInput,
        targetUrl,
        tabId,
        history,
        onProgress,
        abortSignal,
        currentWorkflow,
        incremental: true,
        maxIterations,
      });

      return {
        ...result,
        tabId,
      };
    } catch (error) {
      console.error(
        '[LangGraphService] Create Workflow From Tab Error:',
        error
      );
      throw error;
    }
  }

  /**
   * 获取可用的tabs列表
   * 用于用户选择基于哪个tab创建工作流
   *
   * @returns {Promise<Array>} tabs列表
   */
  async getAvailableTabs() {
    try {
      const tabs = await Browser.tabs.query({});
      return tabs.map((tab) => ({
        id: tab.id,
        title: tab.title,
        url: tab.url,
        active: tab.active,
      }));
    } catch (error) {
      console.error('[LangGraphService] Get Available Tabs Error:', error);
      throw error;
    }
  }
}

export default LangGraphService;
