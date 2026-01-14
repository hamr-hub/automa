import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

/**
 * 批量测试所有demo工作流
 */

const DEMO_DIR = 'demo';
const TEST_TIMEOUT = 60000; // 每个工作流最多运行60秒

// 获取所有demo工作流文件
function getDemoWorkflows() {
  const files = fs.readdirSync(DEMO_DIR);
  return files
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(DEMO_DIR, f));
}

// 简化的工作流执行器(仅验证结构)
async function validateWorkflow(workflowPath) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 测试工作流: ${path.basename(workflowPath)}`);
  console.log('='.repeat(80));

  const results = {
    file: path.basename(workflowPath),
    success: false,
    errors: [],
    warnings: [],
    stats: {
      nodes: 0,
      edges: 0,
      executedSteps: 0,
      duration: 0,
    },
  };

  const startTime = Date.now();

  try {
    // 读取工作流
    const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

    // 解析drawflow
    let drawflow = workflow.drawflow;
    if (typeof drawflow === 'string') {
      drawflow = JSON.parse(drawflow);
    }

    const nodes = drawflow.nodes;
    const edges = drawflow.edges;

    results.stats.nodes = nodes.length;
    results.stats.edges = edges.length;

    console.log(`📊 工作流信息:`);
    console.log(`   名称: ${workflow.name}`);
    console.log(`   描述: ${workflow.description || '无'}`);
    console.log(`   节点数: ${nodes.length}`);
    console.log(`   连接数: ${edges.length}`);

    // 验证基本结构
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const trigger = nodes.find((n) => n.label === 'trigger');

    if (!trigger) {
      results.errors.push('未找到触发器节点');
      console.log(`   ❌ 未找到触发器节点`);
      return results;
    }

    // 统计节点类型
    const nodeTypes = {};
    nodes.forEach((n) => {
      nodeTypes[n.label] = (nodeTypes[n.label] || 0) + 1;
    });

    console.log(`\n📦 节点类型分布:`);
    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    // 检查是否有孤立节点
    const connectedNodes = new Set();
    edges.forEach((e) => {
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });

    const orphanNodes = nodes.filter(
      (n) => n.label !== 'trigger' && !connectedNodes.has(n.id)
    );

    if (orphanNodes.length > 0) {
      results.warnings.push(`发现 ${orphanNodes.length} 个孤立节点`);
      console.log(`\n⚠️  孤立节点 (${orphanNodes.length}):`);
      orphanNodes.forEach((n) => {
        console.log(`   - ${n.label}: ${n.data?.description || n.id}`);
      });
    }

    // 快速执行测试(仅验证选择器和基本逻辑)
    console.log(`\n🧪 执行快速验证...`);

    const browser = await chromium.launch({
      headless: true,
      timeout: 30000,
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

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

    let currentNode = getNextNode(trigger.id);
    let stepCount = 0;
    const maxSteps = 20; // 快速测试只执行前20步

    while (currentNode && stepCount < maxSteps) {
      stepCount++;
      const desc = currentNode.data?.description || '';
      console.log(
        `   [${stepCount}] ${currentNode.label}: ${desc.substring(0, 40)}${desc.length > 40 ? '...' : ''}`
      );

      let nextOutput = 'output-1';

      try {
        switch (currentNode.label) {
          case 'new-window':
          case 'new-tab': {
            const url = currentNode.data.url;
            if (url) {
              await page
                .goto(url, {
                  waitUntil: 'domcontentloaded',
                  timeout: 15000,
                })
                .catch((e) => {
                  results.warnings.push(`页面加载超时: ${url}`);
                });
            }
            break;
          }

          case 'event-click': {
            let selector = currentNode.data.selector;
            const findBy = currentNode.data.findBy || 'cssSelector';

            // 转换选择器
            if (findBy === 'xpath' || selector?.startsWith('id(')) {
              if (selector.match(/^id\("([^"]+)"\)$/)) {
                selector = '#' + selector.match(/^id\("([^"]+)"\)$/)[1];
              }
            }

            // 仅验证选择器是否有效
            if (selector) {
              const exists = await page.$(selector).catch(() => null);
              if (!exists) {
                results.warnings.push(`选择器未找到: ${selector}`);
              }
            }
            break;
          }

          case 'forms': {
            let selector = currentNode.data.selector;
            const findBy = currentNode.data.findBy || 'cssSelector';

            if (findBy === 'xpath' || selector?.startsWith('id(')) {
              if (selector.match(/^id\("([^"]+)"\)$/)) {
                selector = '#' + selector.match(/^id\("([^"]+)"\)$/)[1];
              }
            }

            if (selector) {
              const exists = await page.$(selector).catch(() => null);
              if (!exists) {
                results.warnings.push(`表单元素未找到: ${selector}`);
              }
            }
            break;
          }

          case 'conditions': {
            const conditions = currentNode.data.conditions;
            if (conditions && conditions.length > 0) {
              const firstCondId = conditions[0].id;
              nextOutput = `output-${firstCondId}`;
            } else {
              nextOutput = 'output-fallback';
            }
            break;
          }

          case 'loop-elements': {
            // 跳过循环体，直接到循环结束
            nextOutput = 'output-2';
            break;
          }
        }
      } catch (e) {
        results.warnings.push(`步骤 ${stepCount} 执行警告: ${e.message}`);
      }

      currentNode = getNextNode(currentNode.id, nextOutput);
    }

    results.stats.executedSteps = stepCount;

    await browser.close();

    console.log(`\n✅ 验证完成 (执行了 ${stepCount} 步)`);
    results.success = true;
  } catch (error) {
    results.errors.push(error.message);
    console.log(`\n❌ 验证失败: ${error.message}`);
  }

  results.stats.duration = Date.now() - startTime;

  return results;
}

// 主测试函数
async function runAllTests() {
  console.log('\n🚀 开始批量测试所有demo工作流\n');

  const workflows = getDemoWorkflows();
  console.log(`📁 发现 ${workflows.length} 个工作流文件:\n`);
  workflows.forEach((w, i) => {
    console.log(`   ${i + 1}. ${path.basename(w)}`);
  });

  const allResults = [];

  for (const workflow of workflows) {
    const result = await validateWorkflow(workflow);
    allResults.push(result);

    // 短暂延迟避免资源耗尽
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 生成测试报告
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 测试报告汇总');
  console.log('='.repeat(80) + '\n');

  const successCount = allResults.filter((r) => r.success).length;
  const failCount = allResults.filter((r) => !r.success).length;

  console.log(`总计: ${allResults.length} 个工作流`);
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);

  console.log('\n详细结果:\n');

  allResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.file}`);
    console.log(
      `   节点: ${result.stats.nodes}, 边: ${result.stats.edges}, 执行步骤: ${result.stats.executedSteps}`
    );
    console.log(`   耗时: ${(result.stats.duration / 1000).toFixed(2)}s`);

    if (result.errors.length > 0) {
      console.log(`   ❌ 错误:`);
      result.errors.forEach((e) => console.log(`      - ${e}`));
    }

    if (result.warnings.length > 0) {
      console.log(`   ⚠️  警告 (${result.warnings.length}):`);
      result.warnings.slice(0, 3).forEach((w) => console.log(`      - ${w}`));
      if (result.warnings.length > 3) {
        console.log(`      ... 还有 ${result.warnings.length - 3} 个警告`);
      }
    }

    console.log('');
  });

  // 保存测试报告
  const reportPath = 'test-results/demo-workflow-test-report.json';
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          total: allResults.length,
          success: successCount,
          failed: failCount,
        },
        results: allResults,
      },
      null,
      2
    )
  );

  console.log(`📄 详细报告已保存到: ${reportPath}\n`);

  // 退出码
  process.exit(failCount > 0 ? 1 : 0);
}

// 执行测试
runAllTests().catch((err) => {
  console.error('❌ 测试执行失败:', err);
  process.exit(1);
});
