# handlerWorkflowState.js

**Path**: `workflowEngine/blocksHandler/handlerWorkflowState.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }) {
  try {
    let stopCurrent = false;

    if (data.type === 'stop-current') {
      // 如果需要抛出错误
      if (data.throwError) {
        throw new Error(data.errorMessage || 'Workflow stopped manually');
      } else {
        return {};
      }
    }
    if (['stop-specific', 'stop-all'].includes(data.type)) {
      const ids = [];
      const isSpecific = data.type === 'stop-specific';
// ...
```

---

