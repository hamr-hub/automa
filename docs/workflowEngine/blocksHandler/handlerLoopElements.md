# handlerLoopElements.js

**Path**: `workflowEngine/blocksHandler/handlerLoopElements.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [loopElements](#loopelements) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="loopelements"></a>loopElements

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function loopElements({ data, id }, { refData }) {
  try {
    if (!this.activeTab.id) throw new Error('no-tab');

    if (this.loopList[data.loopId]) {
      const index = this.loopList[data.loopId].index + 1;

      this.loopList[data.loopId].index = index;

      refData.loopData[data.loopId] = {
        $index: index,
        data: this.loopList[data.loopId].data[index],
      };
    } else {
      const maxLoop = +data.maxLoop || 0;
// ...
```

---

