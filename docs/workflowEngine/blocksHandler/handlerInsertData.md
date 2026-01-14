# handlerInsertData.js

**Path**: `workflowEngine/blocksHandler/handlerInsertData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [insertData](#insertdata) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="insertdata"></a>insertData

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function insertData({ id, data }, { refData }) {
  const replacedValueList = {};

  for (const item of data.dataList) {
    let value = '';

    if (item.isFile) {
      const replacedPath = await renderString(
        item.filePath || '',
        refData,
        this.engine.isPopup
      );
      const path = replacedPath.value;
      const isExcel = /.xlsx?$/.test(path);
      const isJSON = path.endsWith('.json');
// ...
```

---

