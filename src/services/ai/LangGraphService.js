
import { StateGraph, END } from '@langchain/langgraph';
import OllamaClient from './OllamaClient.js';
import WorkflowGenerator from './WorkflowGenerator.js';
import aiConfig from '../../config/ai.config.js';

/**
 * LangGraph Service
 * Orchestrates the AI workflow generation using a state graph.
 */
class LangGraphService {
  constructor(config = {}, ollamaClient = null) {
    this.ollama = ollamaClient || new OllamaClient(config.ollama || aiConfig.ollama);
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
        generatedJson: { value: (x, y) => y, default: () => null },
        workflow: { value: (x, y) => y, default: () => null },
        error: { value: (x, y) => y, default: () => null },
        retryCount: { value: (x, y) => y, default: () => 0 },
      }
    });

    // Define Nodes
    graphBuilder.addNode('input_processing', this.inputProcessingNode.bind(this));
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
    
    const systemPrompt = `You are an Automa workflow generator. 
    Convert user requests into Automa workflow JSON format.
    Return ONLY the JSON. No markdown, no explanations.
    
    Structure:
    {
      "steps": [
        { "type": "NAVIGATE", "data": { "url": "..." } },
        { "type": "CLICK", "selector": "..." },
        { "type": "EXTRACT", "selector": "...", "data": { "columnName": "..." } }
      ],
      "dataSchema": { ... }
    }`;

    // Add initial messages if empty
    if (state.messages.length === 0) {
      return {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Task: ${state.userInput}\nURL: ${state.targetUrl}` }
        ]
      };
    }
    
    return {};
  }

  /**
   * Node: Generate JSON using Ollama
   */
  async generationNode(state) {
    console.log('[LangGraph] Generating (Attempt ' + (state.retryCount + 1) + ')...');
    
    try {
      const response = await this.ollama.chat(state.messages);
      const content = response.message.content;
      
      return {
        messages: [{ role: 'assistant', content }],
        generatedJson: this.extractJson(content)
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
      return { error: 'No JSON found in response', retryCount: state.retryCount + 1 };
    }

    try {
      // Validate structure basics
      if (!state.generatedJson.steps || !Array.isArray(state.generatedJson.steps)) {
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
      messages: [{ role: 'user', content: correctionMessage }]
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
      const match = text.match(/```json([\s\S]*?)```/) || text.match(/```([\s\S]*?)```/);
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
   * Execute the graph
   */
  async run(userInput, targetUrl = '', history = []) {
    const initialState = {
      ...this.getInitialState(),
      userInput,
      targetUrl,
      messages: history.length > 0 ? history : []
    };

    const result = await this.graph.invoke(initialState);
    
    if (result.error && !result.workflow) {
      throw new Error(`Failed to generate workflow after retries: ${result.error}`);
    }

    return result.workflow;
  }
}

export default LangGraphService;
