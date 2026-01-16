# Automa AI Agent Refactor: Interactive Workflow Building

I will implement an "Interactive Agent" mode that allows the AI to autonomously analyze the current page, execute actions step-by-step, and iteratively build a workflow.

## 1. New Prompt Template
Create `src/services/ai/prompts/interactive-mode.js`:
- Define a system prompt that instructs the AI to act as a "Browser Automator".
- The AI should output a **Single Action** (JSON) based on the current Goal and Page Context.
- Supported Actions: `INPUT`, `CLICK`, `WAIT`, `NAVIGATE`, `EXTRACT`, `LOOP`, `DONE`.
- Include reasoning field to explain the choice.

## 2. Extend LangGraphService
Modify `src/services/ai/LangGraphService.js`:
- Import `webextension-polyfill` as `Browser`.
- Add `buildInteractiveGraph()` method to define the new state machine:
    - **Nodes**:
        - `analyze`: Captures current page DOM/State.
        - `decide`: Calls LLM to determine next step.
        - `execute`: Converts step to Automa Block, executes it on the active tab, and adds it to the `currentWorkflow`.
        - `wait`: Handles page navigation/loading delays.
    - **Edges**: `analyze` -> `decide` -> `execute` -> `wait` -> `analyze`.
    - **Exit**: When `decide` returns `DONE`.
- Implement `executeNode` logic:
    - Use `WorkflowGenerator` to convert abstract step to Block JSON.
    - Send `automa:execute-block` message to the active tab.
    - Update `currentWorkflow` state with the new block.

## 3. Update LangGraphAgent
Modify `src/services/ai/LangGraphAgent.js`:
- Add `startInteractiveMode(goal)` method.
- Refactor `getPageContext` to be reusable (static or shared).
- Handle the lifecycle of the interactive session.

## 4. Execution Helper
Ensure `src/content/index.js` (Content Script) can receive and execute the single blocks sent by the Agent. (Verified: `executeBlock` is available via message listener).

## Summary of Changes
- **`src/services/ai/prompts/interactive-mode.js`**: New file.
- **`src/services/ai/LangGraphService.js`**: Add interactive graph logic and execution capability.
- **`src/services/ai/LangGraphAgent.js`**: Expose interactive mode.
- **`src/services/ai/WorkflowGenerator.js`**: Ensure helper methods are accessible.
