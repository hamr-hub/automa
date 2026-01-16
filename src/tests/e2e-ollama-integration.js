/**
 * 端到端测试脚本 - 测试 Ollama 集成
 *
 * 使用方法:
 * 1. 在浏览器控制台中运行此脚本
 * 2. 或者在扩展的 background.js 中导入并执行
 */

import aiService from '../services/ai/AIService.js';

export async function runE2ETests() {
  console.log('=== 开始端到端测试 ===\n');
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  };

  /**
   * 测试工具函数
   */
  function logTest(name, passed, error = null) {
    results.total++;
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}`);
    } else {
      results.failed++;
      console.error(`❌ ${name}`);
      if (error) {
        console.error(`   错误: ${error.message}`);
      }
    }
    results.tests.push({ name, passed, error: error?.message });
  }

  /**
   * 测试 1: AIService 初始化
   */
  console.log('\n📋 测试 1: AIService 初始化');
  try {
    await aiService.initialize();
    logTest('AIService.initialize()', true);
  } catch (error) {
    logTest('AIService.initialize()', false, error);
    console.error('初始化失败,终止测试');
    return results;
  }

  /**
   * 测试 2: Ollama 服务健康检查
   */
  console.log('\n📋 测试 2: Ollama 服务健康检查');
  try {
    const isHealthy = await aiService.checkHealth();
    logTest(
      'AIService.checkHealth()',
      isHealthy,
      !isHealthy ? new Error('Ollama 服务不可用') : null
    );
  } catch (error) {
    logTest('AIService.checkHealth()', false, error);
  }

  /**
   * 测试 3: 获取模型列表
   */
  console.log('\n📋 测试 3: 获取模型列表');
  try {
    const models = await aiService.listModels();
    const passed = Array.isArray(models) && models.length > 0;
    logTest(
      'AIService.listModels()',
      passed,
      !passed ? new Error('未获取到模型列表') : null
    );
    if (passed) {
      console.log(`   可用模型: ${models.map((m) => m.name).join(', ')}`);
    }
  } catch (error) {
    logTest('AIService.listModels()', false, error);
  }

  /**
   * 测试 4: 简单聊天调用
   */
  console.log('\n📋 测试 4: 简单聊天调用 (通过 LangGraphService)');
  try {
    const messages = [{ role: 'user', content: '请回复"测试成功"' }];
    const response = await aiService.chat(messages, {
      model: 'mistral',
      temperature: 0.1,
    });

    const passed = response && response.message && response.message.content;
    logTest(
      'AIService.chat()',
      passed,
      !passed ? new Error('未获取到有效响应') : null
    );

    if (passed) {
      console.log(
        `   AI 响应: ${response.message.content.substring(0, 100)}...`
      );
    }
  } catch (error) {
    logTest('AIService.chat()', false, error);
  }

  /**
   * 测试 5: 简单生成调用
   */
  console.log('\n📋 测试 5: 简单生成调用 (通过 LangGraphService)');
  try {
    const response = await aiService.generate('说出数字1到3', {
      model: 'mistral',
      temperature: 0.1,
    });

    const passed = response && response.text;
    logTest(
      'AIService.generate()',
      passed,
      !passed ? new Error('未获取到有效响应') : null
    );

    if (passed) {
      console.log(`   AI 响应: ${response.text.substring(0, 100)}...`);
    }
  } catch (error) {
    logTest('AIService.generate()', false, error);
  }

  /**
   * 测试 6: 验证调用路径 (检查是否通过 LangGraphService)
   */
  console.log('\n📋 测试 6: 验证调用路径');
  try {
    const langGraphService = aiService.getLangGraphService();
    const passed =
      langGraphService &&
      typeof langGraphService.simpleChat === 'function' &&
      typeof langGraphService.simpleGenerate === 'function';

    logTest(
      'LangGraphService 可访问',
      passed,
      !passed ? new Error('无法访问 LangGraphService') : null
    );
  } catch (error) {
    logTest('LangGraphService 可访问', false, error);
  }

  /**
   * 测试 7: 获取调用指标
   */
  console.log('\n📋 测试 7: 获取调用指标');
  try {
    const metrics = aiService.getMetrics();
    const passed = metrics && typeof metrics.requests === 'number';
    logTest(
      'AIService.getMetrics()',
      passed,
      !passed ? new Error('未获取到有效指标') : null
    );

    if (passed) {
      console.log(`   总请求数: ${metrics.requests}`);
      console.log(`   错误数: ${metrics.errors}`);
      console.log(`   平均延迟: ${metrics.avgLatency}ms`);
    }
  } catch (error) {
    logTest('AIService.getMetrics()', false, error);
  }

  /**
   * 测试总结
   */
  console.log('\n=== 测试总结 ===');
  console.log(`总计: ${results.total} 个测试`);
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(
    `成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`
  );

  return results;
}

// 如果在浏览器环境中直接运行
if (typeof window !== 'undefined') {
  window.runE2ETests = runE2ETests;
  console.log('测试脚本已加载,在控制台运行 runE2ETests() 开始测试');
}

export default runE2ETests;
