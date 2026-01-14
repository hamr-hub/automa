# [id].vue

**Path**: `newtab/pages/workflows/[id].vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [drag](#drag) | arrow_function | ❌ | `event` |
| [stopDrag](#stopdrag) | arrow_function | ❌ | `` |
| [startDrag](#startdrag) | arrow_function | ❌ | `event` |
| [disconnect](#disconnect) | object_method | ❌ | `` |
| [close](#close) | object_method | ❌ | `` |
| [publish](#publish) | object_method | ❌ | `` |
| [close](#close) | object_method | ❌ | `` |
| [publish](#publish) | object_method | ❌ | `` |
| [close](#close) | object_method | ❌ | `` |
| [onTabChange](#ontabchange) | function | ❌ | `tabVal` |
| [onUpdateBlockSettings](#onupdateblocksettings) | function | ❌ | `{}` |
| [closeEditingCard](#closeeditingcard) | function | ❌ | `` |
| [executeFromBlock](#executefromblock) | function | ✅ | `blockId` |
| [startRecording](#startrecording) | function | ❌ | `{}` |
| [goToBlock](#gotoblock) | function | ❌ | `blockId` |
| [goToPkgBlock](#gotopkgblock) | function | ❌ | `blockId` |
| [addPackageIO](#addpackageio) | function | ❌ | `{}` |
| [initBlockFolder](#initblockfolder) | function | ❌ | `{}` |
| [clearBlockFolderModal](#clearblockfoldermodal) | function | ❌ | `` |
| [saveBlockToFolder](#saveblocktofolder) | function | ✅ | `` |
| [groupBlocks](#groupblocks) | function | ❌ | `{}` |
| [ungroupBlocks](#ungroupblocks) | function | ❌ | `{}` |
| [initAutocomplete](#initautocomplete) | function | ✅ | `` |
| [registerTrigger](#registertrigger) | function | ❌ | `` |
| [executeCommand](#executecommand) | function | ❌ | `type` |
| [onNodesChange](#onnodeschange) | function | ❌ | `changes` |
| [autoAlign](#autoalign) | function | ❌ | `` |
| [toggleSidebar](#togglesidebar) | function | ❌ | `` |
| [initEditBlock](#initeditblock) | function | ❌ | `data` |
| [updateWorkflow](#updateworkflow) | function | ✅ | `data` |
| [onActionUpdated](#onactionupdated) | function | ❌ | `{}` |
| [onEditorInit](#oneditorinit) | function | ❌ | `instance` |
| [convertToObj](#converttoobj) | arrow_function | ❌ | `array` |
| [clearHighlightedElements](#clearhighlightedelements) | function | ❌ | `` |
| [toggleHighlightElement](#togglehighlightelement) | function | ❌ | `{}` |
| [onDragoverEditor](#ondragovereditor) | function | ❌ | `{}` |
| [onDropInEditor](#ondropineditor) | function | ❌ | `{}` |
| [copyElements](#copyelements) | function | ❌ | `nodes, edges, initialPos` |
| [duplicateElements](#duplicateelements) | function | ❌ | `{}` |
| [copySelectedElements](#copyselectedelements) | function | ❌ | `data?` |
| [pasteCopiedElements](#pastecopiedelements) | function | ✅ | `position` |
| [undoRedoCommand](#undoredocommand) | function | ❌ | `type, {}` |
| [onKeydown](#onkeydown) | function | ❌ | `{}` |
| [command](#command) | arrow_function | ❌ | `keyName` |
| [fetchConnectedTable](#fetchconnectedtable) | function | ✅ | `` |
| [checkWorkflowPermission](#checkworkflowpermission) | function | ❌ | `` |
| [checkWorkflowUpdate](#checkworkflowupdate) | function | ❌ | `` |
| [onBeforeLeave](#onbeforeleave) | function | ❌ | `` |
| [title](#title) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="drag"></a>drag

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
  if (sidebarCss.isDragging) {
    const diffX = event.clientX - sidebarCss.startX;
    sidebarCss.width = Math.max(360, sidebarCss.startWidth + diffX); // min-width : 360px,max-width: 30%
  }
}
```

---

### <a id="stopdrag"></a>stopDrag

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  sidebarCss.isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDrag);
}
```

---

### <a id="startdrag"></a>startDrag

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
  sidebarCss.isDragging = true;
  sidebarCss.startX = event.clientX;
  sidebarCss.startWidth = sidebarCss.width;
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDrag);
}
```

---

### <a id="disconnect"></a>disconnect

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
disconnect() {
        connectedTable.value = null;
      }
```

---

### <a id="close"></a>close

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
close() {
        modalState.show = false;
        modalState.name = '';
      }
```

---

### <a id="publish"></a>publish

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
publish() {
        modalState.show = false;
        modalState.name = '';
      }
```

---

### <a id="close"></a>close

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
close() {
        modalState.show = false;
        modalState.name = '';
      }
```

---

### <a id="publish"></a>publish

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
publish() {
        modalState.show = false;
        modalState.name = '';
      }
```

---

### <a id="close"></a>close

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
close() {
        modalState.show = false;
        modalState.name = '';
      }
```

---

### <a id="ontabchange"></a>onTabChange

- **Type**: `function`
- **Parameters**: `tabVal`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onTabChange(tabVal) {
  if (tabVal === 'logs') {
    emitter.emit('ui:logs', {
      workflowId,
      show: true,
    });
    return;
  }

  state.activeTab = tabVal;
}
```

---

### <a id="onupdateblocksettings"></a>onUpdateBlockSettings

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onUpdateBlockSettings({ blockId, itemId, settings }) {
  state.dataChanged = true;

  if (!editState.editing) return;
  if (itemId && itemId !== editState.blockData.itemId) return;
  if (editState.blockData.blockId !== blockId) return;

  editState.blockData.data = { ...editState.blockData.data, ...settings };
}
```

---

### <a id="closeeditingcard"></a>closeEditingCard

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function closeEditingCard() {
  editState.editing = false;
  editState.blockData = {};

  state.showSidebar = state.sidebarState;
}
```

---

### <a id="executefromblock"></a>executeFromBlock

- **Type**: `function`
- **Parameters**: `blockId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeFromBlock(blockId) {
  try {
    if (!blockId) return;

    const workflowOptions = { blockId };

    let tab = await getActiveTab();
    if (!tab) {
      [tab] = await browser.tabs.query({ active: true, url: '*://*/*' });
    }
    if (tab) {
      workflowOptions.tabId = tab.id;
    }

    RendererWorkflowService.executeWorkflow(workflow.value, workflowOptions);
// ...
```

---

### <a id="startrecording"></a>startRecording

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function startRecording({ nodeId, handleId }) {
  if (state.dataChanged) {
    alert('Make sure to save the workflow before starting recording');
    return;
  }

  const options = {
    workflowId,
    name: workflow.value.name,
    connectFrom: {
      id: nodeId,
      output: handleId,
    },
  };
  startRecordWorkflow(options).then(() => {
// ...
```

---

### <a id="gotoblock"></a>goToBlock

- **Type**: `function`
- **Parameters**: `blockId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function goToBlock(blockId) {
  if (!editor.value) return;

  const block = editor.value.getNode.value(blockId);
  if (!block) return;

  editor.value.addSelectedNodes([block]);
  setTimeout(() => {
    const editorContainer = document.querySelector('.vue-flow');
    const { height, width } = editorContainer.getBoundingClientRect();
    const { x, y } = block.position;

    editor.value.setTransform({
      y: -(y - height / 2),
      x: -(x - width / 2) - 200,
// ...
```

---

### <a id="gotopkgblock"></a>goToPkgBlock

- **Type**: `function`
- **Parameters**: `blockId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function goToPkgBlock(blockId) {
  state.activeTab = 'editor';
  goToBlock(blockId);
}
```

---

### <a id="addpackageio"></a>addPackageIO

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addPackageIO({ type, handleId, nodeId }) {
  const copyPkgIO = [...workflow.value[type]];
  const itemExist = copyPkgIO.some(
    (io) => io.blockId === nodeId && handleId === io.handleId
  );
  if (itemExist) {
    toast.error(`You already add this as an ${type.slice(0, -1)}`);
    return;
  }

  copyPkgIO.push({
    handleId,
    name: '',
    id: nanoid(),
    blockId: nodeId,
// ...
```

---

### <a id="initblockfolder"></a>initBlockFolder

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initBlockFolder({ nodes }) {
  Object.assign(blockFolderModal, {
    nodes,
    showModal: true,
  });
}
```

---

### <a id="clearblockfoldermodal"></a>clearBlockFolderModal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearBlockFolderModal() {
  Object.assign(blockFolderModal, {
    name: '',
    nodes: [],
    asBlock: false,
    description: '',
    showModal: false,
    icon: 'mdiPackageVariantClosed',
  });
}
```

---

### <a id="saveblocktofolder"></a>saveBlockToFolder

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveBlockToFolder() {
  try {
    const seen = new Set();
    const nodeList = [
      ...editor.value.getSelectedNodes.value,
      ...blockFolderModal.nodes,
    ].reduce((acc, node) => {
      if (seen.has(node.id)) return acc;

      const { label, data, position, id, type } = node;
      acc.push(cloneDeep({ label, data, position, id, type }));
      seen.add(node.id);

      return acc;
    }, []);
// ...
```

---

### <a id="groupblocks"></a>groupBlocks

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function groupBlocks({ position }) {
  const nodesToDelete = [];
  const nodes = editor.value.getSelectedNodes.value;
  const groupBlocksList = nodes.reduce((acc, node) => {
    if (excludeGroupBlocks.includes(node.label)) return acc;

    acc.push({
      id: node.label,
      itemId: node.id,
      data: node.data,
    });
    nodesToDelete.push(node);

    return acc;
  }, []);
// ...
```

---

### <a id="ungroupblocks"></a>ungroupBlocks

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ungroupBlocks({ nodes }) {
  const [node] = nodes;
  if (!node || node.label !== 'blocks-group') return;

  const edges = [];
  const position = { ...node.position };
  const copyBlocks = cloneDeep(node.data?.blocks || []);
  const groupBlocksList = copyBlocks.map((item, index) => {
    const nextNode = copyBlocks[index + 1];
    if (nextNode) {
      edges.push({
        source: item.itemId,
        target: nextNode.itemId,
        sourceHandle: `${item.itemId}-output-1`,
        targetHandle: `${nextNode.itemId}-input-1`,
// ...
```

---

### <a id="initautocomplete"></a>initAutocomplete

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function initAutocomplete() {
  const autocompleteCache = sessionStorage.getItem(
    `autocomplete:${workflowId}`
  );
  if (autocompleteCache) {
    const objData = parseJSON(autocompleteCache, {});
    autocompleteState.blocks = objData;
  } else {
    const autocompleteData = {};
    editorData.value.nodes.forEach(({ label, id, data }) => {
      Object.assign(
        autocompleteData,
        extractAutocopmleteData(label, { data, id })
      );
    });
// ...
```

---

### <a id="registertrigger"></a>registerTrigger

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function registerTrigger() {
  const triggerBlock = editorData.value.nodes.find(
    (node) => node.label === 'trigger'
  );
  registerWorkflowTrigger(workflowId, triggerBlock);
}
```

---

### <a id="executecommand"></a>executeCommand

- **Type**: `function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function executeCommand(type) {
  state.isExecuteCommand = true;

  if (type === 'undo') {
    commandManager.undo();
  } else if (type === 'redo') {
    commandManager.redo();
  }

  clearTimeout(executeCommandTimeout);
  setTimeout(() => {
    state.isExecuteCommand = false;
  }, 500);
}
```

---

### <a id="onnodeschange"></a>onNodesChange

- **Type**: `function`
- **Parameters**: `changes`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onNodesChange(changes) {
  const nodeChanges = { added: [], removed: [] };
  changes.forEach(({ type, id, item }) => {
    if (type === 'remove') {
      if (editState.blockData.blockId === id) {
        editState.editing = false;
        editState.blockData = {};
      }

      state.dataChanged = true;
      nodeChanges.removed.push(id);
    } else if (type === 'add') {
      if (isPackage) {
        const excludeBlocks = ['block-package', 'trigger', 'execute-workflow'];
        if (excludeBlocks.includes(item.label)) {
// ...
```

---

### <a id="autoalign"></a>autoAlign

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function autoAlign() {
  state.animateBlocks = true;

  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: 'LR',
    ranksep: 100,
    ranker: 'tight-tree',
  });
  graph._isMultigraph = true;
  graph.setDefaultEdgeLabel(() => ({}));
  editor.value.getNodes.value.forEach(
    ({ id, label, dimensions, parentNode }) => {
      if (label === 'blocks-group-2' || parentNode) return;

// ...
```

---

### <a id="togglesidebar"></a>toggleSidebar

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleSidebar() {
  state.showSidebar = !state.showSidebar;
  localStorage.setItem('workflow:sidebar', state.showSidebar);
}
```

---

### <a id="initeditblock"></a>initEditBlock

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initEditBlock(data) {
  const { editComponent, data: blockDefData, name } = blocks[data.id];

  if (!editComponent) return;

  const blockData = defu(data.data, blockDefData);
  const blockEditComponent =
    typeof editComponent === 'string' ? editComponent : markRaw(editComponent);

  editState.blockData = {
    ...data,
    editComponent: blockEditComponent,
    name,
    data: blockData,
  };
// ...
```

---

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function updateWorkflow(data) {
  try {
    if (isPackage) {
      if (workflow.value.isExternal) return;

      delete data.drawflow;
      await packageStore.update({
        id: workflowId,
        data,
      });
      return;
    }

    if (isTeamWorkflow) {
      if (!haveEditAccess.value && !data.globalData) return;
// ...
```

---

### <a id="onactionupdated"></a>onActionUpdated

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onActionUpdated({ data, changedIndicator }) {
  state.dataChanged = changedIndicator;

  workflowPayload.data = { ...workflowPayload.data, ...data };
  if (!isPackage) updateHostedWorkflow();
}
```

---

### <a id="oneditorinit"></a>onEditorInit

- **Type**: `function`
- **Parameters**: `instance`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onEditorInit(instance) {
  editor.value = instance;

  let nodeToConnect = null;

  instance.onEdgesChange(onEdgesChange);
  instance.onNodesChange(onNodesChange);
  instance.onEdgeDoubleClick(({ edge }) => {
    instance.removeEdges([edge]);
  });
  instance.onConnectStart(({ nodeId, handleId, handleType }) => {
    if (handleType !== 'source') return;

    nodeToConnect = { nodeId, handleId };
  });
// ...
```

---

### <a id="converttoobj"></a>convertToObj

- **Type**: `arrow_function`
- **Parameters**: `array`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(array) =>
    array.reduce((acc, item) => {
      acc[item.id] = item;

      return acc;
    }, {})
```

---

### <a id="clearhighlightedelements"></a>clearHighlightedElements

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearHighlightedElements() {
  const elements = document.querySelectorAll(
    '.dropable-area__node, .dropable-area__handle'
  );
  elements.forEach((element) => {
    element.classList.remove('dropable-area__node');
    element.classList.remove('dropable-area__handle');
  });
}
```

---

### <a id="togglehighlightelement"></a>toggleHighlightElement

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleHighlightElement({ target, elClass, classes }) {
  const targetEl = target.closest(elClass);

  if (targetEl) {
    targetEl.classList.add(classes);
  } else {
    const elements = document.querySelectorAll(`.${classes}`);
    elements.forEach((element) => {
      element.classList.remove(classes);
    });
  }
}
```

---

### <a id="ondragovereditor"></a>onDragoverEditor

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDragoverEditor({ target }) {
  toggleHighlightElement({
    target,
    elClass: '.vue-flow__handle.source',
    classes: 'dropable-area__handle',
  });

  if (!target.closest('.vue-flow__handle')) {
    toggleHighlightElement({
      target,
      elClass: '.vue-flow__node:not(.vue-flow__node-BlockGroup)',
      classes: 'dropable-area__node',
    });
  }
}
```

---

### <a id="ondropineditor"></a>onDropInEditor

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDropInEditor({ dataTransfer, clientX, clientY, target }) {
  const savedBlocks = parseJSON(dataTransfer.getData('savedBlocks'), null);

  const editorRect = editor.value.viewportRef.value.getBoundingClientRect();
  const position = editor.value.project({
    y: clientY - editorRect.top,
    x: clientX - editorRect.left,
  });

  if (savedBlocks && !isPackage) {
    if (savedBlocks.settings.asBlock) {
      editor.value.addNodes([
        {
          position,
          id: nanoid(),
// ...
```

---

### <a id="copyelements"></a>copyElements

- **Type**: `function`
- **Parameters**: `nodes, edges, initialPos`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copyElements(nodes, edges, initialPos) {
  const newIds = new Map();
  let firstNodePos = null;

  const newNodes = nodes.map(({ id, label, position, data, type }, index) => {
    const newNodeId = nanoid();

    const nodePos = {
      z: position.z || 0,
      y: position.y + 50,
      x: position.x + 50,
    };
    newIds.set(id, newNodeId);

    if (initialPos) {
// ...
```

---

### <a id="duplicateelements"></a>duplicateElements

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function duplicateElements({ nodes, edges }) {
  const selectedNodes = editor.value.getSelectedNodes.value;
  const selectedEdges = editor.value.getSelectedEdges.value;

  const { edges: newEdges, nodes: newNodes } = copyElements(
    nodes || selectedNodes,
    edges || selectedEdges
  );

  selectedNodes.forEach((node) => {
    node.selected = false;
  });
  selectedEdges.forEach((edge) => {
    edge.selected = false;
  });
// ...
```

---

### <a id="copyselectedelements"></a>copySelectedElements

- **Type**: `function`
- **Parameters**: `data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copySelectedElements(data = {}) {
  const nodes = data.nodes || editor.value.getSelectedNodes.value;
  const edges = data.edges || editor.value.getSelectedEdges.value;

  const clipboardData = JSON.stringify({
    name: 'automa-blocks',
    data: { nodes, edges },
  });
  navigator.clipboard.writeText(clipboardData).catch((error) => {
    console.error(error);
  });
}
```

---

### <a id="pastecopiedelements"></a>pasteCopiedElements

- **Type**: `function`
- **Parameters**: `position`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function pasteCopiedElements(position) {
  editor.value.removeSelectedNodes(editor.value.getSelectedNodes.value);
  editor.value.removeSelectedEdges(editor.value.getSelectedEdges.value);

  const permission = await browser.permissions.request({
    permissions: ['clipboardRead'],
  });
  if (!permission) {
    toast.error('Automa require clipboard permission to paste blocks');
    return;
  }

  try {
    const copiedText = await navigator.clipboard.readText();
    const workflowBlocks = parseJSON(copiedText);
// ...
```

---

### <a id="undoredocommand"></a>undoRedoCommand

- **Type**: `function`
- **Parameters**: `type, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function undoRedoCommand(type, { target }) {
  const els = ['INPUT', 'SELECT', 'TEXTAREA'];
  if (els.includes(target.tagName) || target.isContentEditable) return;

  executeCommand(type);
}
```

---

### <a id="onkeydown"></a>onKeydown

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onKeydown({ ctrlKey, metaKey, shiftKey, key, target, repeat }) {
  if (repeat) return;

  const els = ['INPUT', 'SELECT', 'TEXTAREA'];
  if (
    els.includes(target.tagName) ||
    target.isContentEditable ||
    !target.closest('.workflow-editor')
  )
    return;

  if (isPackage && workflow.value.isExternal) return;

  const command = (keyName) => (ctrlKey || metaKey) && keyName === key;
  if (command('c')) {
// ...
```

---

### <a id="command"></a>command

- **Type**: `arrow_function`
- **Parameters**: `keyName`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(keyName) => (ctrlKey || metaKey) && keyName === key
```

---

### <a id="fetchconnectedtable"></a>fetchConnectedTable

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function fetchConnectedTable() {
  const table = await dbStorage.tablesItems
    .where('id')
    .equals(workflow.value.connectedTable)
    .first();
  if (!table) return;

  connectedTable.value = table;
}
```

---

### <a id="checkworkflowpermission"></a>checkWorkflowPermission

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function checkWorkflowPermission() {
  getWorkflowPermissions(editorData.value).then((permissions) => {
    if (permissions.length === 0) return;

    permissionState.items = permissions;
    permissionState.showModal = true;
  });
}
```

---

### <a id="checkworkflowupdate"></a>checkWorkflowUpdate

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function checkWorkflowUpdate() {
  apiAdapter
    .getWorkflowById(workflowId)
    .then((result) => {
      if (!result) return;

      const localTime = new Date(workflow.value.updatedAt).getTime();
      const remoteTime = new Date(result.updatedAt).getTime();

      if (remoteTime > localTime) {
        updateWorkflow(result).then(() => {
          editor.value.setNodes(result.drawflow.nodes || []);
          editor.value.setEdges(result.drawflow.edges || []);
          editor.value.fitView();
        });
// ...
```

---

### <a id="onbeforeleave"></a>onBeforeLeave

- **Type**: `function`
- **Parameters**: ``
- **Description**:

eslint-disable consistent-return

**Implementation**:
```javascript
function onBeforeLeave() {
  // disselect node before leave
  const selectedNodes = editor.value?.getSelectedNodes?.value;
  selectedNodes?.forEach((node) => {
    node.selected = false;
  });

  updateHostedWorkflow();

  const dataNotChanged = !state.dataChanged || !haveEditAccess.value;
  const isExternalPkg = isPackage && workflow.value.isExternal;
  if (dataNotChanged || isExternalPkg) return;

  const confirm = window.confirm(t('message.notSaved'));

// ...
```

---

### <a id="title"></a>title

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
title: () =>
    `${workflow.value?.name} ${isPackage ? 'package' : 'workflow'}` || 'Automa'
```

---

