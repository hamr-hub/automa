#!/usr/bin/env node

/**
 * 手动测试脚本 - Amazon SG 工作流生成与执行
 * 直接生成工作流JSON,然后手动导入测试
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Amazon SG 商品详情抓取工作流生成器\n');

const amazonUrl = 'https://www.amazon.sg/Bona-Microfiber-Cleaning-Hardwood-Surface/dp/B08W2BD96D/ref=lp_6537768051_1_1?pf_rd_p=e0af6543-05b0-439b-8b10-517ff5e4d285&pf_rd_r=9VW7MFEJSRTKH2WSHQ5Y&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D';

// 手动构建工作流 (简化版)
const workflow = {
  id: nanoid(),
  name: 'Amazon SG 商品详情抓取',
  description: `由 AI 自动生成的数据抓取工作流\n目标: 抓取Amazon商品详情\nURL: ${amazonUrl}`,
  icon: 'riShoppingCartLine',
  category: 'scrape',
  version: '1.0.0',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isDisabled: false,
  settings: {
    debugMode: true,
    saveLog: true,
    notification: true,
    publicId: '',
    onError: 'bypass',
    executedBlockOnWeb: false,
    insertDefaultColumn: false,
    inputAutocomplete: true,
    blockDelay: 1000,
    reuseLastState: false,
  },
  drawflow: {
    nodes: [
      {
        id: `trigger-${nanoid()}`,
        type: 'BlockBasic',
        label: 'trigger',
        position: { x: 50, y: 50 },
        data: {
          type: 'manual',
          description: '手动触发',
          disableBlock: false,
        },
      },
      {
        id: `new-tab-${nanoid()}`,
        type: 'BlockBasic',
        label: 'new-tab',
        position: { x: 330, y: 50 },
        data: {
          url: amazonUrl,
          active: true,
          waitTabLoaded: true,
          description: '打开商品页面',
          disableBlock: false,
        },
      },
      {
        id: `delay-${nanoid()}`,
        type: 'BlockBasic',
        label: 'delay',
        position: { x: 610, y: 50 },
        data: {
          time: 3000,
          description: '等待页面加载',
          disableBlock: false,
        },
      },
      {
        id: `get-text-${nanoid()}`,
        type: 'BlockBasic',
        label: 'get-text',
        position: { x: 50, y: 200 },
        data: {
          selector: '#productTitle',
          dataColumn: '商品标题',
          multiple: false,
          waitSelector: 5000,
          markEl: true,
          description: '提取商品标题',
          disableBlock: false,
        },
      },
      {
        id: `get-text-${nanoid()}`,
        type: 'BlockBasic',
        label: 'get-text',
        position: { x: 330, y: 200 },
        data: {
          selector: '.a-price .a-offscreen',
          dataColumn: '商品价格',
          multiple: false,
          waitSelector: 5000,
          markEl: true,
          description: '提取商品价格',
          disableBlock: false,
        },
      },
      {
        id: `get-text-${nanoid()}`,
        type: 'BlockBasic',
        label: 'get-text',
        position: { x: 610, y: 200 },
        data: {
          selector: '#acrPopover .a-icon-alt',
          dataColumn: '商品评分',
          multiple: false,
          waitSelector: 5000,
          markEl: true,
          description: '提取商品评分',
          disableBlock: false,
        },
      },
      {
        id: `attribute-value-${nanoid()}`,
        type: 'BlockBasic',
        label: 'attribute-value',
        position: { x: 50, y: 350 },
        data: {
          selector: '#landingImage',
          attributeName: 'src',
          dataColumn: '商品图片',
          multiple: false,
          waitSelector: 5000,
          markEl: true,
          description: '提取商品图片URL',
          disableBlock: false,
        },
      },
      {
        id: `get-text-${nanoid()}`,
        type: 'BlockBasic',
        label: 'get-text',
        position: { x: 330, y: 350 },
        data: {
          selector: '#feature-bullets li',
          dataColumn: '商品描述',
          multiple: true,
          waitSelector: 5000,
          markEl: true,
          description: '提取商品特性',
          disableBlock: false,
        },
      },
      {
        id: `export-data-${nanoid()}`,
        type: 'BlockBasic',
        label: 'export-data',
        position: { x: 610, y: 350 },
        data: {
          type: 'json',
          dataToExport: 'data-columns',
          name: 'amazon_sg_product',
          description: '导出JSON',
          onConflict: 'uniquify',
          disableBlock: false,
        },
      },
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  },
  dataColumns: [
    { id: nanoid(), name: '商品标题', type: 'string', description: '商品名称' },
    { id: nanoid(), name: '商品价格', type: 'string', description: '当前售价' },
    { id: nanoid(), name: '商品评分', type: 'string', description: '用户评分' },
    { id: nanoid(), name: '商品图片', type: 'string', description: '主图URL' },
    { id: nanoid(), name: '商品描述', type: 'array', description: '商品特性列表' },
  ],
};

// 连接节点
const nodes = workflow.drawflow.nodes;
for (let i = 0; i < nodes.length - 1; i++) {
  workflow.drawflow.edges.push({
    id: `edge-${nanoid()}`,
    source: nodes[i].id,
    target: nodes[i + 1].id,
    sourceHandle: `${nodes[i].id}-output-1`,
    targetHandle: `${nodes[i + 1].id}-input`,
    type: 'custom',
  });
}

console.log('📝 工作流构建完成\n');

try {
  // 保存工作流文件
  const outputPath = path.join(__dirname, '../demo/amazon_sg_product_workflow.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));

  console.log('✅ 工作流生成成功!\n');
  console.log('📁 文件位置:', outputPath);
  console.log('\n📊 工作流信息:');
  console.log('   名称:', workflow.name);
  console.log('   节点数:', workflow.drawflow.nodes.length);
  console.log('   边数:', workflow.drawflow.edges.length);
  console.log('   数据列:', workflow.dataColumns.map(col => col.name).join(', '));

  console.log('\n🎯 下一步操作:');
  console.log('1. 启动 Chrome 并加载 Automa 扩展 (build/)');
  console.log('2. 打开扩展 -> 工作流列表');
  console.log('3. 点击右上角 "..." 菜单 -> Import');
  console.log('4. 选择文件:', outputPath);
  console.log('5. 执行工作流 (点击 Play 按钮)');

  console.log('\n🔍 验证要点:');
  console.log('✓ 工作流能否成功访问 Amazon SG 页面');
  console.log('✓ 是否正确提取所有 5 个字段');
  console.log('✓ Data 标签中是否显示完整数据');
  console.log('✓ Downloads 文件夹中是否有 amazon_sg_product.json');

  console.log('\n📦 生成的节点:');
  workflow.drawflow.nodes.forEach((node, index) => {
    console.log(`${index + 1}. [${node.label}] ${node.data.description || node.label}`);
  });

  console.log('\n✨ 测试工作流已生成! 请手动导入并测试\n');
  
} catch (error) {
  console.error('❌ 工作流生成失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}
