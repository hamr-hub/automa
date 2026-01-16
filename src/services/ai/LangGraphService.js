
/**
 * 简化版状态图管理 (浏览器兼容版本)
 * 替代 @langchain/langgraph 以在浏览器扩展中运行
 */

import OllamaClient from './OllamaClient.js';
import WorkflowGenerator from './WorkflowGenerator.js';
import aiConfig from '../../config/ai.config.js';
import { workflowGenerationPrompt } from './prompts/workflow-generation.js';

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
        generatedJson: { value: (x, y) => y, default: () => null },
        workflow: { value: (x, y) => y, default: () => null },
        error: { value: (x, y) => y, default: () => null },
        retryCount: { value: (x, y) => y, default: () => 0 },
        onProgress: { value: (x, y) => x, default: () => null }, // Keep original callback
        currentWorkflow: { value: (x, y) => x, default: () => null }, // Immutable context
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
    console.log('[LangGraph] Processing Input:', state.userInput);
    return {};
  }

  /**
   * Node: Generate JSON using Ollama
   */
  async generationNode(state) {
    const attempt = state.retryCount + 1;
    const msg = `正在生成工作流 (第 ${attempt} 次尝试)...`;
    console.log(`[LangGraph] ${msg}`);
    console.log('DEBUG: onProgress type:', typeof state.onProgress);
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
      if (error.message === 'Aborted by user' || (state.abortSignal && state.abortSignal.aborted)) {
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
    console.log('[LangGraph] Validating...');
    state.onProgress?.({ step: 'validation', message: '正在验证生成结果...' });

    if (!state.generatedJson) {
      const errorMsg = 'AI 返回的内容中未找到有效的 JSON 格式。请确保模型输出包含 ```json 代码块。';
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

      console.log('[LangGraph] Validation Success!');
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
    console.log('[LangGraph] Applying Correction...');

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
   * Helper: Extract JSON from text
   */
  extractJson(text) {
    try {
      // Try parsing directly
      return JSON.parse(text);
    } catch (e) {
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
          console.error('[LangGraph] Attempted to parse:', match[1].substring(0, 200));
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
  async run(userInput, targetUrl = '', history = [], pageContext = '', abortSignal = null, onProgress = null, currentWorkflow = null) {
    // Prepend System Prompt to history if needed
    if (history.length === 0 || history[0].role !== 'system') {
        history.unshift({ role: 'system', content: workflowGenerationPrompt.system });
    }

    // Inject/Update Current Workflow Context
    if (currentWorkflow) {
        const workflowJson = JSON.stringify(currentWorkflow);
        const contextContent = `Current Workflow Context (JSON):\n\`\`\`json\n${workflowJson}\n\`\`\`\n\nTask: Modify this workflow based on the user's latest request. Return the COMPLETE updated workflow JSON.`;
        
        const contextIndex = history.findIndex(m => m.role === 'system' && m.content.startsWith('Current Workflow Context'));
        
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
      const specificError = result.error || 'Failed to generate workflow (Unknown error)';
      // Add context if available
      const detailedError = result.retryCount >= this.maxRetries 
        ? `Failed after ${result.retryCount} retries. Last error: ${specificError}` 
        : specificError;
        
      throw new Error(detailedError);
    }

    return result.workflow;
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
}

export default LangGraphService;
