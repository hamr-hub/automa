import fs from 'fs';
import { chromium } from '@playwright/test';
import path from 'path';

/**
 * Demo工作流执行器
 * 支持Automa导出的工作流JSON格式
 */
async function runWorkflow(workflowPath) {
  console.log(`\n🚀 加载工作流: ${workflowPath}`);
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

  // 解析drawflow(可能是字符串格式)
  let drawflow = workflow.drawflow;
  if (typeof drawflow === 'string') {
    drawflow = JSON.parse(drawflow);
  }

  const nodes = drawflow.nodes;
  const edges = drawflow.edges;

  console.log(`📋 工作流名称: ${workflow.name}`);
  console.log(`📝 描述: ${workflow.description || '无'}`);
  console.log(`🔗 节点数: ${nodes.length}, 边数: ${edges.length}\n`);

  // 创建节点映射
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 查找触发器
  const trigger = nodes.find((n) => n.label === 'trigger');
  if (!trigger) {
    throw new Error('❌ 未找到触发器节点');
  }

  // 启动浏览器
  console.log('🌐 启动浏览器...');
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  let page = await context.newPage();

  // 状态管理
  const state = {
    variables: {},
    loopStack: [],
    data: [],
    currentItem: {},
  };

  // 获取下一个节点
  const getNextNode = (currentId, outputHandle = 'output-1') => {
    const edge = edges.find(
      (e) =>
        e.source === currentId &&
        (e.sourceHandle.includes(outputHandle) ||
          e.sourceHandle.endsWith(outputHandle))
    );
    if (!edge) return null;
    return nodeMap.get(edge.target);
  };

  // 检查条件
  const checkCondition = async (conditions) => {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      if (cond.conditions) {
        const result = await checkCondition(cond.conditions);
        if (!result) return false;
      }

      if (cond.items) {
        for (const item of cond.items) {
          if (item.type === 'element#exists') {
            const selector = item.data?.selector;
            if (selector) {
              try {
                const exists = (await page.$(selector)) !== null;
                console.log(`   🔍 检查元素存在: ${selector} => ${exists}`);
                if (!exists) return false;
              } catch (e) {
                console.log(`   ⚠️  条件检查失败: ${e.message}`);
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  };

  // 执行工作流
  let currentNode = getNextNode(trigger.id);
  let stepCount = 0;
  const maxSteps = 100; // 防止无限循环

  while (currentNode && stepCount < maxSteps) {
    stepCount++;
    const desc = currentNode.data?.description || '';
    console.log(`\n[${stepCount}] 执行 [${currentNode.label}]: ${desc}`);

    let nextOutput = 'output-1';

    try {
      switch (currentNode.label) {
        case 'new-window':
        case 'new-tab': {
          const url = currentNode.data.url;
          console.log(`   🌐 打开页面: ${url}`);
          await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
          });
          await page.waitForTimeout(2000);
          break;
        }

        case 'delay': {
          const time = currentNode.data.time || 1000;
          console.log(`   ⏱️  等待 ${time}ms`);
          await page.waitForTimeout(time);
          break;
        }

        case 'event-click': {
          let selector = currentNode.data.selector;
          const findBy = currentNode.data.findBy || 'cssSelector';

          console.log(`   🖱️  点击: ${selector} (${findBy})`);
          try {
            // 转换XPath选择器
            if (
              findBy === 'xpath' ||
              selector.startsWith('id(') ||
              selector.startsWith('//')
            ) {
              // 转换 id("xxx") 为 #xxx
              if (selector.match(/^id\("([^"]+)"\)$/)) {
                selector = '#' + selector.match(/^id\("([^"]+)"\)$/)[1];
              }
            }

            await page.waitForSelector(selector, { timeout: 5000 });
            await page.click(selector);
            await page.waitForTimeout(1000);
          } catch (e) {
            console.log(`   ⚠️  点击失败: ${e.message}`);
          }
          break;
        }

        case 'forms': {
          let selector = currentNode.data.selector;
          const findBy = currentNode.data.findBy || 'cssSelector';
          const value = currentNode.data.value;

          console.log(`   ⌨️  输入文本到 ${selector}: ${value} (${findBy})`);
          try {
            // 转换XPath选择器
            if (
              findBy === 'xpath' ||
              selector.startsWith('id(') ||
              selector.startsWith('//')
            ) {
              if (selector.match(/^id\("([^"]+)"\)$/)) {
                selector = '#' + selector.match(/^id\("([^"]+)"\)$/)[1];
              }
            }

            if (currentNode.data.clearValue) {
              await page.fill(selector, '');
            }
            await page.fill(selector, value);
            await page.waitForTimeout(500);
          } catch (e) {
            console.log(`   ⚠️  输入失败: ${e.message}`);
          }
          break;
        }

        case 'conditions': {
          const conditions = currentNode.data.conditions;
          console.log(`   ❓ 检查条件...`);
          const result = await checkCondition(conditions);

          if (result && conditions && conditions.length > 0) {
            // 使用第一个条件的输出
            const firstCondId = conditions[0].id;
            nextOutput = `output-${firstCondId}`;
            console.log(`   ✅ 条件满足，使用输出: ${nextOutput}`);
          } else {
            nextOutput = 'output-fallback';
            console.log(`   ❌ 条件不满足，使用fallback输出`);
          }
          break;
        }

        case 'wait-connections': {
          const timeout = currentNode.data.timeout || 3000;
          console.log(`   ⏳ 等待连接: ${timeout}ms`);
          await page.waitForTimeout(timeout);
          break;
        }

        case 'get-text': {
          const selector = currentNode.data.selector;
          const dataColumn = currentNode.data.dataColumn || 'text';
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            const text = await page.textContent(selector);
            console.log(
              `   📝 提取文本 [${dataColumn}]: ${text?.substring(0, 50)}...`
            );
            state.currentItem[dataColumn] = text;
          } catch (e) {
            console.log(`   ⚠️  提取失败: ${e.message}`);
          }
          break;
        }

        case 'attribute-value': {
          const selector = currentNode.data.selector;
          const attrName = currentNode.data.attributeName || 'href';
          const dataColumn = currentNode.data.dataColumn || 'attribute';
          try {
            const element = await page.$(selector);
            const attr = element ? await element.getAttribute(attrName) : '';
            console.log(
              `   🏷️  提取属性 [${dataColumn}]: ${attr?.substring(0, 50)}...`
            );
            state.currentItem[dataColumn] = attr;
          } catch (e) {
            console.log(`   ⚠️  提取失败: ${e.message}`);
          }
          break;
        }

        case 'loop-elements': {
          const selector = currentNode.data.elementSelector;
          console.log(`   🔁 循环元素: ${selector}`);
          try {
            const elements = await page.$$(selector);
            console.log(`   📊 找到 ${elements.length} 个元素`);

            if (elements.length > 0) {
              // 简化版：只处理第一个元素
              console.log(`   ℹ️  简化模式：仅处理第一个元素`);
              nextOutput = 'output-1'; // 进入循环体
            } else {
              nextOutput = 'output-2'; // 跳过循环
            }
          } catch (e) {
            console.log(`   ⚠️  循环失败: ${e.message}`);
            nextOutput = 'output-2';
          }
          break;
        }

        case 'export-data': {
          const type = currentNode.data.type || 'json';
          console.log(`   💾 导出数据 (${type})`);
          console.log(`   📦 当前数据:`, state.currentItem);
          state.data.push({ ...state.currentItem });
          break;
        }

        case 'press-key': {
          const key = currentNode.data.key || 'Enter';
          console.log(`   ⌨️  按键: ${key}`);
          try {
            await page.keyboard.press(key);
            await page.waitForTimeout(500);
          } catch (e) {
            console.log(`   ⚠️  按键失败: ${e.message}`);
          }
          break;
        }

        default:
          console.log(`   ⚠️  未实现的节点类型: ${currentNode.label}`);
      }
    } catch (e) {
      console.error(`   ❌ 执行错误: ${e.message}`);
    }

    // 移动到下一个节点
    const prevNode = currentNode;
    currentNode = getNextNode(currentNode.id, nextOutput);

    if (!currentNode) {
      console.log(`\n✅ 工作流执行完成 (从节点 ${prevNode.id} 无后续节点)`);
      break;
    }
  }

  if (stepCount >= maxSteps) {
    console.log(`\n⚠️  达到最大步数限制 (${maxSteps})，停止执行`);
  }

  console.log(`\n📊 执行统计:`);
  console.log(`   - 总步数: ${stepCount}`);
  console.log(`   - 收集数据: ${state.data.length} 条`);

  if (state.data.length > 0) {
    console.log(`\n📋 数据预览:`);
    console.log(JSON.stringify(state.data, null, 2));
  }

  console.log(`\n🔚 关闭浏览器...`);
  await browser.close();
}

// 主函数
const workflowPath = process.argv[2];

if (!workflowPath) {
  console.error('❌ 请提供工作流文件路径');
  console.log('\n用法: node scripts/run-demo-workflow.js <workflow.json>');
  console.log('\n示例:');
  console.log('  node scripts/run-demo-workflow.js "demo/Amazon Scrap.json"');
  process.exit(1);
}

if (!fs.existsSync(workflowPath)) {
  console.error(`❌ 文件不存在: ${workflowPath}`);
  process.exit(1);
}

runWorkflow(workflowPath).catch((err) => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
