
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

        while (currentNode && currentNode !== 'END') {
          const nodeFn = this.nodes.get(currentNode);
          if (!nodeFn) {
            throw new Error(`Node ${currentNode} not found`);
          }

          // 执行节点函数
          const result = await nodeFn(state);
          
          // 更新状态
          state = { ...state, ...result };

          // 决定下一个节点
          if (this.conditionalEdges.has(currentNode)) {
            const { condition, edgeMapping } = this.conditionalEdges.get(currentNode);
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
      }
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

    // Ensure System Prompt is present at the beginning
    // We clone the messages to avoid mutating the state directly if it were a reference
    // (though LangGraph usually handles state updates via return)
    
    // Check if system prompt is already the first message
    if (state.messages.length === 0 || state.messages[0].role !== 'system') {
       const systemPrompt = workflowGenerationPrompt.system;
       
       // If messages is empty (which shouldn't happen given LangGraphAgent pushes user input),
       // we just return the system prompt.
       // If messages has content (User input), we prepend System prompt.
       
       return {
         messages: [
           { role: 'system', content: systemPrompt },
           // ...state.messages // LangGraph merges returned messages with existing state based on channel config
           // However, for 'messages' channel, the config is `(x, y) => x.concat(y)`.
           // So if we return `[{role: 'system'}]`, it will be APPENDED to `state.messages`.
           // This is NOT what we want. We want to PREPEND.
           
           // If the channel is `x.concat(y)`, we cannot prepend easily by just returning.
           // We might need to OVERWRITE the messages if possible, or assume LangGraphAgent handles history.
           
           // WAIT. LangGraph `messages` reducer is `x.concat(y)`.
           // If `state.messages` already has [User], and we return [System], it becomes [User, System].
           // This is bad.
           
           // We should fix this by defining the reducer differently or resetting messages?
           // OR, LangGraphAgent should ensure System Prompt is in history?
           
           // Actually, `LangGraphAgent` clears history on `clearHistory`.
           // If `history` is empty, `LangGraphAgent` creates new history.
           
           // Solution: Let's handle the message construction properly here by returning the FULL correct sequence if it's the first turn.
           // But `state.messages` is already populated from `history` passed to `run`.
           
           // If `state.messages` comes from `initialState.messages`, it is what we passed.
           // We can't "replace" it easily with `concat` reducer.
           
           // WORKAROUND:
           // If we can't change the reducer, we should ensure `LangGraphAgent` passes the System Prompt in the history!
           // But `LangGraphAgent` doesn't know about `LangGraphService`'s internal prompts.
           
           // Let's modify `LangGraphAgent.js` to NOT push to history before run, 
           // but let `LangGraphService` construct the full history?
           // No, `LangGraphAgent` manages history.
           
           // Let's try to just return the system prompt and hope the LLM handles [User, System] order? 
           // No, System must be first.
           
           // Hack: Since I can't easily change the reducer behavior without breaking other things,
           // I will change `buildGraph` to use a REPLACER for messages if I want to overwrite?
           // No.
           
           // The best place to fix this is where `history` is passed to `run`.
           // In `LangGraphAgent.js`, we can prepend System Prompt if history is empty?
           // But `LangGraphService` owns the prompt.
           
           // Let's rely on `LangGraphAgent` passing the messages.
           // I will modify `LangGraphAgent.js` to Prepend System Prompt if it's not there.
           // But `LangGraphAgent` doesn't import prompt. I just added import there!
           
           // So in `LangGraphAgent.js`, I can ensure history[0] is system prompt.
         ]
       };
    }
    
    // If I move the logic to LangGraphAgent, I don't need to do anything here except logging.
    return {};
  }

  /**
   * Node: Generate JSON using Ollama
   */
  async generationNode(state) {
    console.log(
      '[LangGraph] Generating (Attempt ' + (state.retryCount + 1) + ')...'
    );

    try {
      const response = await this.ollama.chat(state.messages);
      const content = response.message.content;

      return {
        messages: [{ role: 'assistant', content }],
        generatedJson: this.extractJson(content),
      };
    } catch (error) {
      console.error('[LangGraph] Generation Error:', error);
      return { error: error.message };
    }
  }

  /**
   * Node: Validate JSON and Build Workflow
   */
  async validationNode(state) {
    console.log('[LangGraph] Validating...');

    if (!state.generatedJson) {
      return {
        error: 'No JSON found in response',
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

    const correctionMessage = `The previous JSON was invalid. Error: ${state.error}. 
    Please fix the JSON and return ONLY the JSON.`;

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
          return JSON.parse(match[1]);
        } catch (e2) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Execute the workflow generation graph
   */
  async run(userInput, targetUrl = '', history = [], pageContext = '') {
    // Prepend System Prompt to history if needed
    // This modifies the passed history array, which is referenced by LangGraphAgent.
    // This is acceptable as we want the Agent to "remember" the system prompt.
    if (history.length === 0 || history[0].role !== 'system') {
        history.unshift({ role: 'system', content: workflowGenerationPrompt.system });
    }

    const initialState = {
      ...this.getInitialState(),
      userInput,
      targetUrl,
      pageContext,
      messages: history.length > 0 ? history : [],
    };

    const result = await this.graph.invoke(initialState);

    if (result.error && !result.workflow) {
      throw new Error(
        `Failed to generate workflow after retries: ${result.error}`
      );
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
