/**
 * 工作流生成器
 * 将 AI 生成的抽象步骤转换为 Automa 工作流结构
 */

import { nanoid } from 'nanoid';

class WorkflowGenerator {
  constructor() {
    // Automa Block 类型映射
    this.blockTypeMap = {
      NAVIGATE: 'new-tab',
      WAIT: 'delay',
      CLICK: 'event-click',
      SCROLL: 'element-scroll',
      EXTRACT: 'get-text',
      EXTRACT_ATTRIBUTE: 'attribute-value',
      LOOP: 'loop-data',
      LOOP_ELEMENTS: 'loop-elements',
      PAGINATION: 'while-loop', // Pagination using While Loop (check next button)
      LOOP_END: 'loop-end', // Virtual type for ending loops
      EXPORT: 'export-data',
      INPUT: 'forms',
      SELECT: 'forms',
      SCREENSHOT: 'screenshot',
      CONDITION: 'conditions',
      GO_BACK: 'go-back',
      CLOSE_TAB: 'close-tab',
    };

    // 默认节点位置配置
    this.nodePosition = {
      x: 50,
      y: 50,
      xOffset: 280,
      yOffset: 150,
      itemsPerRow: 4,
    };
  }

  /**
   * 生成完整的 Automa 工作流
   * @param {Object} aiOutput - AI 生成的步骤和数据模式
   * @param {string} userInput - 用户原始输入
   * @param {string} targetUrl - 目标 URL
   */
  generateWorkflow(aiOutput, userInput, targetUrl) {
    const { steps, dataSchema } = aiOutput;

    // 生成工作流基本信息
    const workflowId = nanoid();
    const workflow = {
      id: workflowId,
      name: `AI生成: ${userInput}`,
      description: `由 AI 自动生成的数据抓取工作流\n目标: ${userInput}\nURL: ${targetUrl}`,
      icon: 'riRobotLine',
      category: 'scrape',
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDisabled: false,
      settings: {
        debugMode: true, // 默认开启调试模式
        saveLog: true,
        notification: true,
        publicId: '',
        onError: 'bypass', // Change to bypass to allow continuing on error
        executedBlockOnWeb: false,
        insertDefaultColumn: false,
        inputAutocomplete: true,
        blockDelay: 1000, // Add explicit delay
        reuseLastState: false,
      },
      drawflow: this.generateDrawflow(steps, dataSchema, targetUrl),
      table: this.generateDataColumns(dataSchema),
      dataColumns: this.generateDataColumns(dataSchema),
    };

    // Optimize workflow
    this.optimizeWorkflow(workflow);

    return workflow;
  }

  /**
   * 生成 Drawflow 结构(节点和边)
   */
  generateDrawflow(steps, dataSchema, targetUrl) {
    const nodes = [];
    const edges = [];
    
    // Stack to track active loops: { id: string, type: string }
    const loopStack = [];

    // 重置节点位置
    this.resetNodePosition();

    // 1. 添加触发器节点
    const triggerNode = this.createTriggerNode();
    nodes.push(triggerNode);

    let previousNodeId = triggerNode.id;
    let previousNodeOutputHandle = 'output-1';

    // 2. 添加导航节点(如果需要)
    if (targetUrl) {
      const navigateNode = this.createNavigateNode(targetUrl);
      nodes.push(navigateNode);
      edges.push(this.createEdge(previousNodeId, navigateNode.id, previousNodeOutputHandle));
      previousNodeId = navigateNode.id;
    }

    // 3. 根据 AI 步骤生成节点
    steps.forEach((step, index) => {
      // Handle Loop End
      if (step.type === 'LOOP_END') {
        if (loopStack.length > 0) {
          const finishedLoop = loopStack.pop();
          // The flow continues from the "Done" output (output-2 usually) of the loop block
          // But wait, in Automa, blocks *inside* the loop don't connect to "Done".
          // The "Done" path starts from the Loop block itself.
          
          // So, if we have steps AFTER the loop, they should connect to the Loop Block's output-2.
          // We update previousNodeId to the Loop Block ID.
          previousNodeId = finishedLoop.id;
          
          // For loop-data and loop-elements, output-2 is "Done/Fallback"
          // For while-loop, output-2 is "Fallback" (Condition False)
          previousNodeOutputHandle = 'output-2'; 
        }
        return;
      }

      const node = this.createNodeFromStep(step, index);
      if (node) {
        nodes.push(node);
        
        // Connect previous node to current node
        edges.push(this.createEdge(previousNodeId, node.id, previousNodeOutputHandle));
        
        previousNodeId = node.id;
        previousNodeOutputHandle = 'output-1'; // Default for next connection

        // If this is a loop block, push to stack
        if (['loop-data', 'loop-elements', 'while-loop'].includes(node.label)) {
           loopStack.push({ id: node.id, type: node.label });
           // The next block will connect to output-1 (Loop Body)
           previousNodeOutputHandle = 'output-1';
        }
      }
    });

    // 4. 添加导出节点(如果最后一步不是导出)
    // Only add if not already present and we are not inside a loop (or maybe we are?)
    // Usually export is the last step.
    const lastStep = steps[steps.length - 1];
    if (lastStep?.type !== 'EXPORT') {
      const exportNode = this.createExportNode(dataSchema);
      nodes.push(exportNode);
      edges.push(this.createEdge(previousNodeId, exportNode.id, previousNodeOutputHandle));
    }

    return {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    };
  }

  /**
   * 创建触发器节点
   */
  createTriggerNode() {
    const position = this.getNextNodePosition();
    return {
      id: `trigger-${nanoid()}`,
      type: 'BlockBasic',
      label: 'trigger',
      position,
      data: {
        type: 'manual',
        description: '',
        disableBlock: false,
      },
    };
  }

  /**
   * 创建导航节点
   */
  createNavigateNode(url) {
    const position = this.getNextNodePosition();
    return {
      id: `new-tab-${nanoid()}`,
      type: 'BlockBasic',
      label: 'new-tab',
      position,
      data: {
        url,
        active: true,
        inGroup: false,
        waitTabLoaded: true,
        description: '导航到目标页面',
        disableBlock: false,
      },
    };
  }

  /**
   * 根据 AI 步骤创建节点
   */
  createNodeFromStep(step, index) {
    const blockType = this.blockTypeMap[step.type];
    if (!blockType) {
      console.warn(`未知的步骤类型: ${step.type}`);
      return null;
    }
    
    if (blockType === 'loop-end') return null; // Should be handled in generateDrawflow

    const position = this.getNextNodePosition();
    const nodeId = `${blockType}-${nanoid()}`;

    // 根据不同类型创建不同的节点数据
    const nodeData = this.createNodeData(step, blockType);

    return {
      id: nodeId,
      type: 'BlockBasic',
      label: blockType,
      position,
      data: {
        ...nodeData,
        description: step.description || '',
        disableBlock: false,
      },
    };
  }

  /**
   * 创建节点数据
   */
  createNodeData(step, blockType) {
    const dataCreators = {
      'new-tab': () => ({
        url: step.data?.url || '',
        active: true,
        waitTabLoaded: true,
      }),

      delay: () => ({
        time: step.data?.time || 2000,
      }),

      'event-click': () => ({
        selector: step.selector || '',
        markEl: true,
        multiple: false,
        waitSelector: 5000,
      }),

      'element-scroll': () => ({
        selector: step.selector || '',
        scrollY: step.data?.scrollY || 0,
        scrollX: step.data?.scrollX || 0,
        smooth: true,
        incY: step.data?.incY || false,
        incX: step.data?.incX || false,
      }),

      'get-text': () => ({
        selector: step.selector || '',
        regex: '',
        regexExp: '',
        prefixText: '',
        suffixText: '',
        assignVariable: false,
        variableName: '',
        dataColumn: step.data?.columnName || 'column',
        multiple: step.data?.multiple || false,
        waitSelector: 5000,
        markEl: true,
      }),

      'attribute-value': () => ({
        selector: step.selector || '',
        attributeName: step.data?.attribute || 'href',
        dataColumn: step.data?.columnName || 'column',
        multiple: step.data?.multiple || false,
        waitSelector: 5000,
        markEl: true,
      }),

      'loop-data': () => ({
        loopId: nanoid(5),
        loopThrough: 'numbers',
        startIndex: 1,
        endIndex: step.data?.count || 10,
        maxLoop: step.data?.maxLoop || 0,
        reverseLoop: false,
      }),

      'loop-elements': () => ({
        loopId: nanoid(5),
        elementSelector: step.selector || '',
        max: step.data?.max || 0,
        waitSelector: 5000,
      }),

      'while-loop': () => {
         // Create conditions for "Next Button Exists"
         const conditions = [
            {
                id: nanoid(),
                conditions: [
                    {
                        id: nanoid(),
                        items: [
                            {
                                id: nanoid(),
                                category: 'value',
                                type: 'element-selector',
                                data: { selector: step.selector || '' }
                            },
                            {
                                id: nanoid(),
                                category: 'compare',
                                type: 'itr' // Is True (Exists)
                            }
                        ]
                    }
                ]
            }
         ];
         return {
            loopId: nanoid(5),
            conditions,
         };
      },

      'export-data': () => ({
        type: (step.data?.type === 'excel' ? 'csv' : (step.data?.type || 'json')),
        dataToExport: 'data-columns',
        refKey: '',
        name: step.data?.filename || 'automa-data',
        description: '',
        onConflict: 'uniquify',
      }),

      forms: () => ({
        selector: step.selector || '',
        value: step.data?.value || '',
        clearValue: false,
        selected: false,
        delay: 0,
        markEl: true,
      }),

      screenshot: () => ({
        type: 'fullpage',
        selector: '',
        fileName: 'screenshot',
        saveToColumn: false,
        dataColumn: '',
      }),

      conditions: () => {
        // Handle simplified AI output for "exists" condition
        if (step.data?.selector && step.data?.condition === 'exists') {
             return {
                conditions: [
                    {
                        id: nanoid(),
                        name: 'Element Exists',
                        conditions: [
                            {
                                id: nanoid(),
                                items: [
                                    {
                                        id: nanoid(),
                                        category: 'value',
                                        type: 'element-selector',
                                        data: { selector: step.data.selector }
                                    },
                                    {
                                        id: nanoid(),
                                        category: 'compare',
                                        type: 'itr' // Is True (Exists)
                                    }
                                ]
                            }
                        ]
                    }
                ]
             };
        }

        return {
          conditions: step.data?.conditions || [],
        };
      },

      'go-back': () => ({
        description: '返回上一页',
      }),

      'close-tab': () => ({
        active: true,
        description: '关闭当前标签页',
      }),
    };

    const creator = dataCreators[blockType];
    return creator ? creator() : {};
  }

  /**
   * 创建导出节点
   */
  createExportNode(dataSchema) {
    const position = this.getNextNodePosition();
    return {
      id: `export-data-${nanoid()}`,
      type: 'BlockBasic',
      label: 'export-data',
      position,
      data: {
        type: 'json',
        dataToExport: 'data-columns',
        name: 'automa-scraped-data',
        description: '导出抓取的数据',
        onConflict: 'uniquify',
        disableBlock: false,
      },
    };
  }

  /**
   * 创建边(连接)
   */
  createEdge(sourceId, targetId, sourceOutput = 'output-1') {
    return {
      id: `edge-${nanoid()}`,
      source: sourceId,
      target: targetId,
      sourceHandle: `${sourceId}-${sourceOutput}`,
      targetHandle: `${targetId}-input`,
      type: 'custom',
    };
  }

  /**
   * 生成数据列配置
   */
  generateDataColumns(dataSchema) {
    if (!dataSchema) return [];

    return Object.entries(dataSchema).map(([name, info]) => ({
      id: nanoid(),
      name,
      type: this.mapDataType(info.type || 'string'),
      description: info.description || '',
    }));
  }

  /**
   * 映射数据类型
   */
  mapDataType(type) {
    const typeMap = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'string',
      url: 'string',
      array: 'array',
      object: 'object',
    };

    return typeMap[type] || 'string';
  }

  /**
   * 获取下一个节点位置
   */
  getNextNodePosition() {
    const { x, y, xOffset, yOffset, itemsPerRow } = this.nodePosition;
    const position = { x, y };

    // 计算下一个位置
    this.nodePosition.currentIndex = (this.nodePosition.currentIndex || 0) + 1;
    const index = this.nodePosition.currentIndex;

    if (index % itemsPerRow === 0) {
      // 换行
      this.nodePosition.x = 50;
      this.nodePosition.y += yOffset;
    } else {
      this.nodePosition.x += xOffset;
    }

    return position;
  }

  /**
   * 重置节点位置
   */
  resetNodePosition() {
    this.nodePosition.x = 50;
    this.nodePosition.y = 50;
    this.nodePosition.currentIndex = 0;
  }

  /**
   * 优化工作流
   * 合并重复步骤、优化选择器等
   */
  optimizeWorkflow(workflow) {
    const { nodes, edges } = workflow.drawflow;

    // Helper to find node by ID
    const getNode = (id) => nodes.find((n) => n.id === id);

    // Helper to remove node and reconnect
    const removeNode = (nodeId) => {
      const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return;

      const inEdges = edges.filter((e) => e.target === nodeId);
      const outEdges = edges.filter((e) => e.source === nodeId);

      // Remove node
      nodes.splice(nodeIndex, 1);

      // Remove connected edges
      for (let i = edges.length - 1; i >= 0; i--) {
        if (edges[i].source === nodeId || edges[i].target === nodeId) {
          edges.splice(i, 1);
        }
      }

      // Reconnect if possible (1 input -> 1 output)
      if (inEdges.length === 1 && outEdges.length === 1) {
        const inEdge = inEdges[0];
        const outEdge = outEdges[0];

        edges.push({
          ...inEdge,
          id: `edge-${nanoid()}`,
          target: outEdge.target,
          targetHandle: outEdge.targetHandle,
        });
      }
    };

    // 1. Remove 0-time delays or empty delays
    let changed = true;
    while (changed) {
      changed = false;
      const zeroDelayNode = nodes.find(
        (n) => n.label === 'delay' && (!n.data.time || n.data.time <= 0)
      );
      if (zeroDelayNode) {
        removeNode(zeroDelayNode.id);
        changed = true;
      }
    }

    // 2. Merge consecutive delays
    changed = true;
    while (changed) {
      changed = false;
      for (const node of nodes) {
        if (node.label !== 'delay') continue;

        const outEdge = edges.find((e) => e.source === node.id);
        if (!outEdge) continue;

        const nextNode = getNode(outEdge.target);
        if (nextNode && nextNode.label === 'delay') {
          node.data.time = (node.data.time || 0) + (nextNode.data.time || 0);
          removeNode(nextNode.id);
          changed = true;
          break;
        }
      }
    }

    return workflow;
  }

  /**
   * 验证工作流
   * 检查工作流是否有效
   */
  validateWorkflow(workflow) {
    const errors = [];

    // 检查是否有触发器
    const hasTrigger = workflow.drawflow.nodes.some(
      (node) => node.label === 'trigger'
    );
    if (!hasTrigger) {
      errors.push('工作流缺少触发器节点');
    }

    // 检查是否有导出节点
    const hasExport = workflow.drawflow.nodes.some(
      (node) => node.label === 'export-data'
    );
    if (!hasExport) {
      errors.push('工作流缺少导出节点');
    }

    // 检查节点连接
    const nodeIds = new Set(workflow.drawflow.nodes.map((n) => n.id));
    workflow.drawflow.edges.forEach((edge) => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`边的源节点不存在: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`边的目标节点不存在: ${edge.target}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default WorkflowGenerator;
