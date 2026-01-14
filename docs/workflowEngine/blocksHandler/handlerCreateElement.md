# handlerCreateElement.js

**Path**: `workflowEngine/blocksHandler/handlerCreateElement.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getAutomaScript](#getautomascript) | function | ❌ | `refData` |
| [createElementScript](#createelementscript) | function | ❌ | `code, blockId, $automaScript, $preloadScripts` |
| [handleCreateElement](#handlecreateelement) | function | ✅ | `block, {}` |

## Detailed Description

### <a id="getautomascript"></a>getAutomaScript

- **Type**: `function`
- **Parameters**: `refData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getAutomaScript(refData) {
  const varName = `automa${nanoid()}`;

  const str = `
const ${varName} = ${JSON.stringify(refData)};
${automaRefDataStr(varName)}
function automaSetVariable(name, value) {
  const variables = ${varName}.variables;
  if (!variables) ${varName}.variables = {}

  ${varName}.variables[name] = value;
}
function automaExecWorkflow(options = {}) {
  window.dispatchEvent(new CustomEvent('automa:execute-workflow', { detail: options }));
}
// ...
```

---

### <a id="createelementscript"></a>createElementScript

- **Type**: `function`
- **Parameters**: `code, blockId, $automaScript, $preloadScripts`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function createElementScript(code, blockId, $automaScript, $preloadScripts) {
  // fixme: 这里是有问题的，如果按现在方案会至少创建两个script标签，
  // 一个是preloadScripts，一个是automaScript
  // 那么在现在的方案中 VM 可能导致不共享 window 变量
  const str = `
    const baseId = 'automa-${blockId}';

    ${JSON.stringify($preloadScripts)}.forEach((item) => {
      if (item.type === 'style') return;

      const script = document.createElement(item.type);
      script.id = \`\${baseId}-script\`;
      script.textContent = item.script;

      document.body.appendChild(script);
// ...
```

---

### <a id="handlecreateelement"></a>handleCreateElement

- **Type**: `function`
- **Parameters**: `block, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleCreateElement(block, { refData }) {
  if (!this.activeTab.id) throw new Error('no-tab');

  const { data } = block;
  const preloadScriptsPromise = await Promise.allSettled(
    data.preloadScripts.map((item) => {
      if (!item.src.startsWith('http'))
        return Promise.reject(new Error('Invalid URL'));

      return fetch(item.src)
        .then((response) => response.text())
        .then((result) => ({ type: item.type, script: result }));
    })
  );
  const preloadScripts = preloadScriptsPromise.reduce((acc, item) => {
// ...
```

---

