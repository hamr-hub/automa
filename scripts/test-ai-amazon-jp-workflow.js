
import fs from 'fs';
import WorkflowGenerator from '../src/services/ai/WorkflowGenerator.js';

// Mock AI output for Amazon JP scraping
// Using the same structure as US site, assuming global Amazon DOM structure consistency
const mockAiOutput = {
  steps: [
    {
      type: 'NAVIGATE',
      description: 'Go to Amazon JP search results for "laptop"',
      data: { url: 'https://www.amazon.co.jp/s?k=laptop' }
    },
    {
      type: 'PAGINATION', 
      description: 'Loop through pages while Next button exists',
      selector: 'a.s-pagination-next' // Selector for "Next" button
    },
    {
      type: 'LOOP_ELEMENTS',
      description: 'Loop through products on current page',
      selector: 'div.s-result-item[data-component-type="s-search-result"]'
    },
    {
      type: 'EXTRACT',
      description: '获取商品名称',
      selector: 'h2 span',
      data: { columnName: '商品名称' }
    },
    {
      type: 'EXTRACT',
      description: '获取商品价格',
      selector: '.a-price .a-offscreen',
      data: { columnName: '商品价格' }
    },
    {
      type: 'EXTRACT_ATTRIBUTE',
      description: '获取图片链接',
      selector: 'img.s-image',
      data: { attribute: 'src', columnName: '图片链接' }
    },
    {
      type: 'LOOP_END', // End Product Loop
      description: '结束商品循环'
    },
    {
      type: 'CLICK',
      description: '点击下一页',
      selector: 'a.s-pagination-next'
    },
    {
      type: 'WAIT',
      description: '等待页面加载',
      data: { time: 3000 }
    },
    {
      type: 'LOOP_END', // End Pagination Loop
      description: '结束分页循环'
    },
    {
      type: 'EXPORT',
      description: '导出为Excel',
      data: { type: 'xlsx', filename: 'amazon_jp_laptops_data' }
    }
  ],
  dataSchema: {
    '商品名称': { type: 'string', description: '商品标题' },
    '商品价格': { type: 'string', description: '销售价格' },
    '图片链接': { type: 'string', description: '主图URL' }
  }
};

const generator = new WorkflowGenerator();
const workflow = generator.generateWorkflow(mockAiOutput, "Scrape Amazon JP laptops", "https://www.amazon.co.jp/s?k=laptop");

// Save to file
fs.writeFileSync('amazon_jp_workflow_ai_gen.json', JSON.stringify(workflow, null, 2));
console.log("Workflow saved to amazon_jp_workflow_ai_gen.json");

// Log the structure to verify connections
console.log("Workflow Generated:", workflow.name);
console.log("Target URL:", workflow.description.split('\n').find(l => l.startsWith('URL:')));
