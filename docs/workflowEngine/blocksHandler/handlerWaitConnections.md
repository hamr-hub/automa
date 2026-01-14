# handlerWaitConnections.js

**Path**: `workflowEngine/blocksHandler/handlerWaitConnections.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [waitConnections](#waitconnections) | function | ✅ | `{}, {}` |
| [registerConnections](#registerconnections) | arrow_function | ❌ | `` |
| [checkConnections](#checkconnections) | arrow_function | ❌ | `` |

## Detailed Description

### <a id="waitconnections"></a>waitConnections

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function waitConnections({ data, id }, { prevBlock }) {
  return new Promise((resolve, reject) => {
    let timeout;
    let resolved = false;

    const nextBlockId = this.getBlockConnections(id);
    const destroyWorker =
      data.specificFlow && prevBlock?.id !== data.flowBlockId;

    const registerConnections = () => {
      const connections = this.engine.connectionsMap;
      Object.keys(connections).forEach((key) => {
        const isConnected = [...connections[key].values()].some(
          (connection) => connection.id === id
        );
// ...
```

---

### <a id="registerconnections"></a>registerConnections

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      const connections = this.engine.connectionsMap;
      Object.keys(connections).forEach((key) => {
        const isConnected = [...connections[key].values()].some(
          (connection) => connection.id === id
        );

        if (!isConnected) return;

        const index = key.indexOf('-output');
        const prevBlockId = key.slice(0, index === -1 ? key.length : index);
        this.engine.waitConnections[id][prevBlockId] = {
          isHere: false,
          isContinue: false,
        };
// ...
```

---

### <a id="checkconnections"></a>checkConnections

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      if (resolved) return;

      const state = Object.values(this.engine.waitConnections[id]);
      const isAllHere = state.every((worker) => worker.isHere);

      if (isAllHere) {
        this.engine.waitConnections[id][prevBlock.id].isContinue = true;
        const allContinue = state.every((worker) => worker.isContinue);

        if (allContinue) {
          registerConnections();
        }

        clearTimeout(timeout);
// ...
```

---

