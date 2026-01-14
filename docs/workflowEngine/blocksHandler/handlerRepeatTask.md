# handlerRepeatTask.js

**Path**: `workflowEngine/blocksHandler/handlerRepeatTask.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [repeatTask](#repeattask) | function | ❌ | `{}` |

## Detailed Description

### <a id="repeattask"></a>repeatTask

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function repeatTask({ data, id }) {
  return new Promise((resolve) => {
    const repeat = Number.isNaN(+data.repeatFor) ? 0 : +data.repeatFor;

    if (this.repeatedTasks[id] > repeat || !this.getBlockConnections(id, 2)) {
      delete this.repeatedTasks[id];

      resolve({
        data: repeat,
        nextBlockId: this.getBlockConnections(id),
      });
    } else {
      this.repeatedTasks[id] = (this.repeatedTasks[id] || 1) + 1;

      resolve({
// ...
```

---

