# 重构 Automa AI 工作流集成计划

根据您的要求，我制定了以下计划，将 AI 生成器完全集成到工作流编辑器中，并进行界面和交互的全面升级。

## 1. 界面与组件重构
### 创建 `AIChatFloating` 组件
- **功能**: 
  - 悬浮在工作流编辑器右下角（或可拖动）。
  - 支持折叠/展开，保持界面整洁。
  - 包含对话历史、输入框、模型状态指示。
  - 提供“应用更改”和“停止生成”按钮。
- **样式 (Tech Style)**:
  - 使用深色背景 (Dark Mode 优先)。
  - 紧凑布局，减少 padding/margin。
  - 使用高对比度边框和强调色（蓝色/青色）。
  - 半透明毛玻璃效果（如果支持）。

### 修改 `WorkflowDetails.vue` (编辑器主页)
- **集成**: 引入 `AIChatFloating` 组件。
- **布局**: 将其放置在编辑器层的上层 (z-index)。
- **交互**: 
  - 将当前工作流数据 (`workflow` JSON) 传递给 AI 组件。
  - 监听 AI 组件的 `update` 事件，自动应用工作流更改。

### 移除旧版 AI 页面
- **Sidebar**: 从 `AppSidebar.vue` 中移除 "AI 生成器" 菜单项。
- **Cleanup**: (可选) 删除 `AIWorkflowGenerator.vue` 文件以保持代码库清洁。

## 2. 核心逻辑升级 (AI 服务层)
### 升级 `LangGraphAgent.js` & `LangGraphService.js`
- **上下文感知**: 
  - 修改 `chat` 方法，使其接收 `currentWorkflow` 参数。
  - 在构建 Prompt 时，如果存在现有工作流，将注入 "当前工作流 JSON" 并指示 AI "基于用户需求修改此工作流" 而非从头生成。
- **Prompt 优化**:
  - 增加指令，要求 AI 只返回修改后的部分或完整的新工作流结构。

## 3. 交互体验优化
- **即时反馈**: 在 AI 生成过程中显示详细的步骤状态 (Thinking/Generating/Validating)。
- **双向同步**: 
  - 当用户在编辑器中手动修改节点时，更新传递给 AI 的上下文。
  - 当 AI 生成新工作流时，通过 Vue 的响应式系统平滑更新编辑器视图 (无需刷新)。

## 4. 技术实现步骤
1. **组件开发**: 创建 `src/components/newtab/workflow/AIChatFloating.vue`。
2. **服务层修改**: 更新 `src/services/ai/LangGraphAgent.js` 支持修改模式。
3. **集成**: 修改 `src/newtab/pages/workflows/[id].vue` 挂载组件。
4. **清理**: 移除旧入口。
5. **样式微调**: 应用科技风 CSS。

请确认是否开始执行此计划？