# handlerJavascriptCode.js

**Path**: `workflowEngine/blocksHandler/handlerJavascriptCode.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getAutomaScript](#getautomascript) | function | ❌ | `{}` |
| [executeInWebpage](#executeinwebpage) | function | ✅ | `args, target, worker` |
| [javascriptCode](#javascriptcode) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="getautomascript"></a>getAutomaScript

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getAutomaScript({ varName, refData, everyNewTab, isEval = false }) {
  let str = `
const ${varName} = ${JSON.stringify(refData)};
${automaRefDataStr(varName)}
function automaSetVariable(name, value) {
  const variables = ${varName}.variables;
  if (!variables) ${varName}.variables = {}

  ${varName}.variables[name] = value;
}
function automaNextBlock(data, insert = true) {
  if (${isEval}) {
    $automaResolve({
      columns: {
        data,
// ...
```

---

### <a id="executeinwebpage"></a>executeInWebpage

- **Type**: `function`
- **Parameters**: `args, target, worker`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeInWebpage(args, target, worker) {
  if (!target.tabId) {
    throw new Error('no-tab');
  }

  if (worker.engine.isMV2) {
    args[0] = cloneDeep(args[0]);

    const result = await worker._sendMessageToTab({
      label: 'javascript-code',
      data: args,
    });

    return result;
  }
// ...
```

---

### <a id="javascriptcode"></a>javascriptCode

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function javascriptCode({ outputs, data, ...block }, { refData }) {
  let nextBlockId = this.getBlockConnections(block.id);

  if (data.everyNewTab) {
    const isScriptExist = this.preloadScripts.some(({ id }) => id === block.id);

    if (!isScriptExist)
      this.preloadScripts.push({ id: block.id, data: cloneDeep(data) });
    if (!this.activeTab.id) return { data: '', nextBlockId };
  } else if (!this.activeTab.id && data.context !== 'background') {
    throw new Error('no-tab');
  }

  const payload = {
    ...block,
// ...
```

---

