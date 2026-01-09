# AI Workflow Assistant (Ollama Integration)

## Overview
The AI Workflow Assistant allows users to generate and refine Automa workflows using natural language prompts. It integrates with a local Ollama instance to process user requests and convert them into executable automation steps.

## Features

### 1. Chat-based Workflow Generation
- **Natural Language Interface**: Users can describe their intent (e.g., "Scrape product prices from Amazon").
- **Multi-turn Dialogue**: Users can refine the workflow by conversing with the AI (e.g., "Also extract the image URL", "Change the delay to 5 seconds").
- **Context Awareness**: The AI maintains the history of the conversation to understand context changes.

### 2. Real-time Visualization
- **Split-pane Layout**: Chat on the left, Workflow Preview on the right.
- **Visual Feedback**: Steps are displayed as a sequence of cards with details (selectors, URLs).
- **Updates**: The preview updates automatically whenever the AI modifies the workflow.

### 3. Immediate Execution & Management
- **Test Run**: Users can execute the generated workflow immediately to verify its correctness.
- **Save**: Generated workflows can be saved to the Automa library for future use or advanced editing.
- **Configuration**: Support for configuring Ollama URL, Model, and parameters.

## Architecture

### Frontend (`src/newtab/pages/AIWorkflowGenerator.vue`)
- **Vue 3 + Tailwind CSS**: Provides the UI.
- **State Management**: Uses `reactive` state for chat history and workflow data.
- **Services**:
  - `LangGraphAgent`: Handles communication with Ollama and manages conversation state.
  - `RendererWorkflowService`: Handles workflow execution.
  - `WorkflowStore`: Handles saving workflows to the database.

### Backend Logic
- **`src/services/ai/OllamaClient.js`**: Low-level HTTP client for Ollama API.
- **`src/services/ai/LangGraphAgent.js`**: Orchestrator that manages chat history and calls `WorkflowGenerator`.
- **`src/services/ai/WorkflowGenerator.js`**: Converts abstract JSON steps from AI into Automa's `drawflow` JSON structure.

## User Manual

### Prerequisites
1. Install [Ollama](https://ollama.ai/).
2. Pull a model (e.g., `mistral`, `llama3`, `qwen`).
   ```bash
   ollama pull mistral
   ```
3. Start Ollama server (default is `http://localhost:11434`).

### How to Use
1. Open Automa Dashboard.
2. Navigate to the **AI Assistant** tab (or click the Robot icon).
3. **Configuration**:
   - Click "Model Config".
   - Ensure "Service URL" is correct.
   - Select a model from the dropdown.
   - Click "Check Connection" if needed.
4. **Generate Workflow**:
   - Type your request in the chat box (e.g., "Go to google.com and search for 'Automa'").
   - Press Enter.
   - The AI will generate a workflow and show it on the right panel.
5. **Refine**:
   - If something is wrong, tell the AI (e.g., "You missed the click step").
   - The workflow will be updated.
6. **Test**:
   - Click the **Run** button (Play icon) in the header.
   - A new tab will open and execute the workflow.
7. **Save**:
   - Click **Save Workflow**.
   - The workflow is now available in your "Workflows" list.

## Development

### Adding Support for New Blocks
To support new Automa blocks in AI generation:
1. Modify `src/services/ai/prompts/workflow-generation.js` to include the new block type in the system prompt.
2. Update `src/services/ai/WorkflowGenerator.js` to map the new type to Automa's block ID and default data.

### Troubleshooting
- **Connection Refused**: Ensure Ollama is running and CORS is allowed (if necessary). Automa extension usually has permissions to access localhost.
- **JSON Parse Error**: The AI might generate invalid JSON. Try using a more capable model (e.g., `llama3` or `mistral-instruct`).
