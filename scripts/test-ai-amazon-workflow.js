import fs from 'fs';
import WorkflowGenerator from '../src/services/ai/WorkflowGenerator.js';

// Mock AI output for Amazon scraping with Pagination and Nested Loops
const mockAiOutput = {
  steps: [
    {
      type: 'NAVIGATE',
      description: 'Go to Amazon search results for "laptop"',
      data: { url: 'https://www.amazon.com/s?k=laptop' },
    },
    {
      type: 'PAGINATION',
      description: 'Loop through pages while Next button exists',
      selector: 'a.s-pagination-next', // Selector for "Next" button
    },
    {
      type: 'LOOP_ELEMENTS',
      description: 'Loop through products on current page',
      selector: 'div.s-result-item[data-component-type="s-search-result"]',
    },
    {
      type: 'EXTRACT',
      description: 'Get Product Name',
      selector: 'h2 a span',
      data: { columnName: 'title' },
    },
    {
      type: 'EXTRACT',
      description: 'Get Price',
      selector: '.a-price .a-offscreen',
      data: { columnName: 'price' },
    },
    {
      type: 'EXTRACT_ATTRIBUTE',
      description: 'Get Image URL',
      selector: 'img.s-image',
      data: { attribute: 'src', columnName: 'imageUrl' },
    },
    {
      type: 'LOOP_END', // End Product Loop
      description: 'End product loop',
    },
    {
      type: 'CLICK',
      description: 'Click Next Page',
      selector: 'a.s-pagination-next',
    },
    {
      type: 'WAIT',
      description: 'Wait for page load',
      data: { time: 3000 },
    },
    {
      type: 'LOOP_END', // End Pagination Loop
      description: 'End pagination loop',
    },
    {
      type: 'EXPORT',
      description: 'Save to CSV',
      data: { type: 'csv', filename: 'amazon_laptops' },
    },
  ],
  dataSchema: {
    title: { type: 'string', description: 'Product Name' },
    price: { type: 'string', description: 'Product Price' },
    imageUrl: { type: 'string', description: 'Product Image' },
  },
};

const generator = new WorkflowGenerator();
const workflow = generator.generateWorkflow(
  mockAiOutput,
  'Scrape Amazon laptops',
  'https://www.amazon.com/s?k=laptop'
);

// Save to file
fs.writeFileSync(
  'amazon_workflow_ai_gen.json',
  JSON.stringify(workflow, null, 2)
);
console.log('Workflow saved to amazon_workflow_ai_gen.json');

// Log the structure to verify connections
console.log('Workflow Generated:', workflow.name);

const nodes = workflow.drawflow.nodes;
const edges = workflow.drawflow.edges;

console.log(`Nodes: ${nodes.length}, Edges: ${edges.length}`);

// Helper to find node by id
const getNode = (id) => nodes.find((n) => n.id === id);

// Trace the path
let currentNode = nodes.find((n) => n.label === 'trigger');
console.log('\n--- Workflow Trace ---');

const visited = new Set();
const trace = (nodeId, indent = '') => {
  if (visited.has(nodeId)) {
    console.log(`${indent} -> (Cycle/Revisit) ${nodeId}`);
    return;
  }
  visited.add(nodeId);

  const node = getNode(nodeId);
  if (!node) {
    console.log(`${indent} -> Unknown Node ${nodeId}`);
    return;
  }

  console.log(
    `${indent} [${node.label}] ${node.data.description || ''} (${node.id})`
  );

  // Find outgoing edges
  const outgoing = edges.filter((e) => e.source === nodeId);
  if (outgoing.length === 0) {
    console.log(`${indent}    (End of path)`);
  }

  outgoing.forEach((edge) => {
    console.log(`${indent}    -> via ${edge.sourceHandle} to`);
    trace(edge.target, indent + '      ');
  });
};

if (currentNode) {
  trace(currentNode.id);
} else {
  console.error('No trigger node found!');
}

// Verify specific Amazon requirements
console.log('\n--- Verification ---');
const paginationNode = nodes.find((n) => n.label === 'while-loop');
console.log('Has Pagination (While Loop):', !!paginationNode);
if (paginationNode) {
  // Check conditions
  console.log(
    'Pagination Conditions:',
    JSON.stringify(paginationNode.data.conditions, null, 2)
  );
}

const productLoop = nodes.find((n) => n.label === 'loop-elements');
console.log('Has Product Loop:', !!productLoop);

const exportNode = nodes.find((n) => n.label === 'export-data');
console.log('Has Export:', !!exportNode);

// Check if Export is connected from While Loop (output-2)
if (paginationNode && exportNode) {
  const connection = edges.find(
    (e) => e.source === paginationNode.id && e.target === exportNode.id
  );
  if (connection) {
    console.log(
      'Pagination connects to Export:',
      connection.sourceHandle.includes('output-2')
    );
  } else {
    console.log('Pagination does NOT connect directly to Export (Check trace)');
  }
}
