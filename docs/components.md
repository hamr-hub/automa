# Components Analysis

## Overview
Automa uses a component-based architecture with Vue.js. Components are organized by their domain or reusability.

## Directory: `src/components`

### 1. `ui/` (Generic UI Kit)
Reusable, atomic UI components.
- `UiButton.vue`: Standard button.
- `UiInput.vue`, `UiCheckbox.vue`, `UiSelect.vue`: Form elements.
- `UiModal.vue`, `UiDialog.vue`: Overlays.
- `UiTable.vue`: Data tables.

### 2. `block/` (Workflow Blocks)
Visual representation of blocks in the workflow editor.
- `BlockBase.vue`: Base component for all blocks.
- `BlockBasic.vue`: Standard block layout.
- `BlockGroup.vue`: For grouping blocks.

### 3. `newtab/` (Dashboard Specific)
Components used primarily in the Dashboard application.
- **`workflow/`**:
    - `WorkflowEditor.vue`: The canvas for building workflows.
    - `edit/`: Components for editing specific block settings (e.g., `EditClickElement.vue`).
- **`logs/`**:
    - `LogsTable.vue`: Displays execution logs.
- **`settings/`**:
    - `SettingsGeneral.vue`: General settings forms.

### 4. `content/` (Content Script UI)
UI components injected into web pages.
- `selector/`: The element picker UI.
    - `SelectorElementList.vue`: List of picked elements.

## Component Usage Pattern

1.  **Block Editing**:
    - When a user clicks a block in the editor, the corresponding component from `src/components/newtab/workflow/edit/` is loaded.
    - Example: Clicking a "Delay" block loads `EditDelay.vue`.

2.  **Dynamic Rendering**:
    - The editor uses dynamic component loading to render the correct settings form based on the block type.

```javascript
// Pseudo-code for dynamic settings loading
<component :is="getEditComponent(block.type)" :data="block.data" />
```
