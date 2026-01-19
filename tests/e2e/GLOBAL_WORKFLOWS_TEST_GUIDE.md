# 全局工作流 E2E 测试指南

本文档介绍如何运行全局工作流功能的端到端测试。

## 测试文件

- `global-workflows.spec.js` - 全局工作流功能测试

## 测试用例概览

| 测试ID        | 用例名称           | 描述                               |
| ------------- | ------------------ | ---------------------------------- |
| TC-GLOBAL-001 | 访问全局工作流页面 | 验证可以访问全局工作流页面         |
| TC-GLOBAL-002 | 页面布局           | 验证页面包含搜索、筛选、排序等元素 |
| TC-GLOBAL-003 | 保存工作流到全局   | 测试保存本地工作流到全局           |
| TC-GLOBAL-004 | 保存时填写描述     | 测试保存时添加描述和分类           |
| TC-GLOBAL-005 | 导入全局工作流     | 测试从全局导入工作流到本地         |
| TC-GLOBAL-006 | 验证导入结果       | 验证导入后工作流出现在列表中       |
| TC-GLOBAL-007 | 搜索工作流         | 测试搜索功能                       |
| TC-GLOBAL-008 | 按分类筛选         | 测试分类筛选功能                   |
| TC-GLOBAL-009 | 按下载量排序       | 测试排序功能                       |
| TC-GLOBAL-010 | 点赞工作流         | 测试点赞功能                       |
| TC-GLOBAL-011 | 取消点赞           | 测试取消点赞功能                   |
| TC-GLOBAL-012 | 查看工作流详情     | 测试查看工作流详情                 |
| TC-GLOBAL-013 | 空状态显示         | 测试空工作流列表显示               |
| TC-GLOBAL-014 | 加载更多           | 测试加载更多功能                   |
| TC-GLOBAL-015 | 服务初始化         | 验证GlobalWorkflowService初始化    |
| TC-GLOBAL-016 | 服务方法可用       | 验证服务方法可用性                 |
| TC-GLOBAL-017 | 获取工作流API      | 测试获取工作流列表API              |
| TC-GLOBAL-018 | 保存工作流API      | 测试保存工作流API                  |
| TC-GLOBAL-019 | 搜索API            | 测试搜索API                        |
| TC-GLOBAL-020 | 网络错误处理       | 测试网络错误处理                   |
| TC-GLOBAL-021 | 未登录处理         | 测试未登录状态处理                 |

## 环境要求

1. Chrome 扩展已构建
2. Chrome 浏览器已安装
3. Playwright 已安装

## 运行测试

### 1. 设置环境变量

```bash
# 设置扩展ID（从 chrome://extensions 获取）
export EXTENSION_ID="your-extension-id"
```

### 2. 构建扩展

```bash
npm run build
```

### 3. 加载扩展到Chrome

1. 打开 Chrome 扩展页面：`chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `automa/build` 目录
5. 复制扩展ID

### 4. 运行特定测试

```bash
# 运行所有全局工作流测试
npx playwright test tests/e2e/global-workflows.spec.js

# 运行单个测试
npx playwright test tests/e2e/global-workflows.spec.js -g "TC-GLOBAL-003"

# 运行测试并生成报告
npx playwright test tests/e2e/global-workflows.spec.js --reporter=html
```

### 5. 运行所有E2E测试

```bash
npm run test:e2e
```

## 测试配置

测试使用以下 Playwright 配置：

```javascript
// playwright.integration.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL: `chrome-extension://${EXTENSION_ID}/newtab.html`,
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};
```

## 手动测试步骤

如果需要手动测试全局工作流功能：

### 步骤1: 访问全局工作流页面

1. 点击侧边栏的"Global"图标
2. 或直接访问：`chrome-extension://<EXTENSION_ID>/newtab.html#/workflows/global`

### 步骤2: 保存工作流到全局

1. 在"我的工作流"页面
2. 点击工作流卡片的菜单按钮
3. 选择"保存到全局"
4. 填写工作流描述（可选）
5. 选择分类（可选）
6. 点击确认

### 步骤3: 导入全局工作流

1. 访问全局工作流页面
2. 浏览或搜索工作流
3. 点击工作流卡片
4. 点击"导入"按钮
5. 工作流将导入到本地列表

### 步骤4: 点赞/取消点赞

1. 在全局工作流页面
2. 点击心形图标
3. 点赞数会更新

## 常见问题

### Q: 测试失败，找不到元素

A: 确保扩展已正确加载，并且页面已完全加载。可以增加等待时间：

```javascript
await page.waitForTimeout(3000);
```

### Q: 网络请求失败

A: 测试假设 Supabase 服务可用。如果服务不可用，测试会失败或显示错误状态。

### Q: 未登录状态测试失败

A: 某些功能需要登录才能使用。测试会检查错误处理，但实际行为取决于应用设计。

## 预期结果

### 成功场景

- 页面正常加载所有元素
- 保存工作流时显示成功提示
- 导入后工作流出现在本地列表
- 搜索/筛选/排序功能正常
- 点赞功能正常

### 失败场景（预期处理）

- 网络断开时显示错误提示
- 未登录时显示登录提示
- 无工作流时显示空状态

## 调试技巧

### 1. 使用 Playwright Inspector

```bash
npx playwright test tests/e2e/global-workflows.spec.js --debug
```

### 2. 截取屏幕截图

```javascript
await page.screenshot({ path: 'test-result.png' });
```

### 3. 保存测试日志

```javascript
console.log('Test step result:', result);
```

## 相关文件

- `global-workflows.spec.js` - 测试文件
- `supabase.spec.js` - Supabase 集成测试参考
- `import-export.spec.js` - 导入导出测试参考
- `playwright.integration.config.js` - Playwright 配置
