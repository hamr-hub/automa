# Automa 扩展端到端测试指南

## 测试概述

本文档描述如何对Automa浏览器扩展进行端到端测试。测试使用Playwright框架，覆盖所有核心功能模块。

## 测试模块

| 模块 | 文件 | 测试用例数 | 优先级 |
|------|------|-----------|--------|
| 工作流块操作 | blocks.spec.js | 15 | P0/P1 |
| 工作流执行 | workflow-execution.spec.js | 16 | P0/P1 |
| 数据提取 | data-extraction.spec.js | 20 | P0/P1 |
| 导入导出 | import-export.spec.js | 17 | P0/P1 |
| 定时任务 | scheduling.spec.js | 20 | P0/P1 |
| 身份验证 | auth.spec.js | 20 | P0 |
| AI集成 | ai-integration.spec.js | 18 | P1 |
| Supabase集成 | supabase.spec.js | 22 | P0/P1 |
| 环境验证 | environment-validation.spec.js | 12 | - |

**总计: 160个测试用例**

## 环境要求

- Node.js >= 20.11.1
- Playwright >= 1.57.0
- Chrome浏览器（用于扩展测试）
- 支持开发者模式的Chrome扩展

## 安装依赖

```bash
npm install
npm install @playwright/test --save-dev --legacy-peer-deps
npx playwright install chromium
```

## 构建扩展

在运行测试之前，需要先构建Automa扩展：

```bash
npm run build
```

构建完成后，扩展将位于 `dist/chrome` 目录。

## 运行测试

### 运行所有测试

```bash
npm run test:e2e
```

或者使用测试运行脚本：

```powershell
node tests/run-e2e-tests.ps1
```

### 运行特定模块测试

```bash
npx playwright test tests/e2e/blocks.spec.js --reporter=list
npx playwright test tests/e2e/workflow-execution.spec.js --reporter=list
npx playwright test tests/e2e/data-extraction.spec.js --reporter=list
npx playwright test tests/e2e/import-export.spec.js --reporter=list
npx playwright test tests/e2e/scheduling.spec.js --reporter=list
npx playwright test tests/e2e/auth.spec.js --reporter=list
npx playwright test tests/e2e/ai-integration.spec.js --reporter=list
npx playwright test tests/e2e/supabase.spec.js --reporter=list
```

### 环境验证测试

```bash
npx playwright test tests/e2e/environment-validation.spec.js --reporter=list
```

## Chrome扩展测试模式

### 开发者模式加载

扩展测试需要在Chrome的开发者模式下运行：

1. 打开Chrome浏览器
2. 访问 `chrome://extensions/`
3. 启用右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"
5. 选择 `dist/chrome` 目录

### 自动加载模式

测试配置支持自动加载扩展：

```javascript
// tests/e2e/00-base.spec.js
const EXTENSION_ID = process.env.EXTENSION_ID || '';

test.beforeEach(async ({ page }) => {
  await page.goto(`chrome-extension://${EXTENSION_ID}/newtab.html`);
  await page.waitForLoadState('domcontentloaded');
});
```

### 使用Fixtures

推荐使用提供的fixtures进行扩展测试：

```javascript
import { test, expect } from '../fixtures/playwright-fixtures.js';

test('测试扩展功能', async ({ extensionPage }) => {
  const { page, context } = extensionPage;
  await page.goto('chrome-extension://your-extension-id/newtab.html');
  // 测试代码
});
```

## 测试配置文件

### playwright.e2e.config.js

主测试配置文件，包含所有测试模块的配置：

```javascript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120000,
  reporter: [
    ['html', { outputFolder: 'playwright-html-reports' }],
    ['json', { outputFile: 'test-results.json' }],
    ['line'],
  ],
  projects: [
    { name: 'blocks', testMatch: /blocks\.spec\.js/ },
    { name: 'workflow-execution', testMatch: /workflow-execution\.spec\.js/ },
    // ...其他模块
  ],
});
```

## 测试报告

测试完成后，报告将生成在以下位置：

- `test-results/e2e-test-report.json` - JSON格式报告
- `test-results/E2E_TEST_REPORT.md` - Markdown格式报告
- `playwright-html-reports/` - HTML可视化报告

## 手动测试步骤

### 1. 启动测试环境

```bash
# 终端1: 构建扩展
npm run build

# 终端2: 运行测试
npm run test:e2e
```

### 2. 验证扩展加载

在Chrome中检查扩展是否正确加载：
- 扩展图标应出现在工具栏
- 点击图标应打开扩展界面
- 工作流编辑器应正常显示

### 3. 执行测试用例

按照测试优先级执行：
- **P0 (Critical)**: 核心功能，必须通过
- **P1 (High)**: 重要功能，应通过
- **P2 (Medium)**: 一般功能，尽量通过

## 常见问题

### Q: 扩展无法加载
A: 确保已启用开发者模式，并选择正确的扩展目录（`dist/chrome`）。

### Q: 测试超时
A: 增加超时时间或检查网络连接。

### Q: 元素定位失败
A: 检查选择器是否正确，考虑使用test.step()进行调试。

### Q: 认证测试失败
A: 确保测试环境变量正确配置Supabase凭据。

## 测试开发

### 添加新测试用例

1. 在相应模块的spec文件中添加test.describe块
2. 使用test.step()组织测试步骤
3. 添加适当的前置条件和后置清理

### 自定义Fixtures

在 `tests/fixtures/playwright-fixtures.js` 中添加自定义fixtures：

```javascript
export const test = base.extend({
  myCustomFixture: async ({}, use) => {
    // 设置代码
    await use(value);
    // 清理代码
  },
});
```

## CI/CD集成

在CI环境中运行测试：

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npx playwright install chromium
      - run: npm run build
      - run: npm run test:e2e
```

## 性能基准

| 操作 | 预期时间 |
|------|----------|
| 测试环境启动 | < 30s |
| 单个测试用例 | < 10s |
| 完整测试套件 | < 30min |
| 测试报告生成 | < 10s |

## 联系人

测试问题请联系开发团队或提交Issue。
