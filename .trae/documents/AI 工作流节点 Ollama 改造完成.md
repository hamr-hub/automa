我已经完成了 AI 工作流节点的改造，现在它支持调用 Ollama API 了。

### 主要变更
1.  **UI 界面 (`EditAiWorkflow.vue`)**
    *   新增了 **AI Provider** 选择器，用户可以在 `Ollama` 和 `AI Power` 之间切换。
    *   **Ollama 模式**：
        *   支持配置 **Ollama Host** (默认 `http://localhost:11434`)。
        *   自动获取并下拉选择 **Model** (需确保 Ollama 服务已启动)。
        *   提供 **User Prompt** 和 **System Prompt** 输入框，支持使用变量（如 `{{variables.text}}`）。
        *   支持设置 **Temperature** 参数。
    *   **AI Power 模式**：保留了原有的功能，兼容旧的工作流配置。

2.  **执行逻辑 (`handlerAiWorkflow.js`)**
    *   在工作流运行时，根据配置的 Provider 自动选择执行路径。
    *   如果选择 Ollama，会使用内置的 `OllamaClient` 直接调用本地或远程的 Ollama 接口。
    *   支持将 AI 返回的结果赋值给变量或写入数据表格。

### 使用说明
1.  拖入 **AI Workflow** 节点。
2.  在 "AI Provider" 中选择 **Ollama**。
3.  确保本地已启动 Ollama (默认端口 11434)。
4.  输入 Prompt，可以使用变量引用上游数据。
5.  运行工作流即可。

### 代码修改文件
*   `src/components/newtab/workflow/edit/EditAiWorkflow.vue`: 更新了节点编辑界面。
*   `src/workflowEngine/blocksHandler/handlerAiWorkflow.js`: 更新了后台执行逻辑。
