# handlerExportData.js

**Path**: `workflowEngine/blocksHandler/handlerExportData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [blobToBase64](#blobtobase64) | function | ❌ | `blob` |
| [exportData](#exportdata) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="blobtobase64"></a>blobToBase64

- **Type**: `function`
- **Parameters**: `blob`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
```

---

### <a id="exportdata"></a>exportData

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function exportData({ data, id }, { refData }) {
  const dataToExport = data.dataToExport || 'data-columns';
  let payload = refData.table;

  if (dataToExport === 'google-sheets') {
    payload = refData.googleSheets[data.refKey] || [];
  } else if (dataToExport === 'variable') {
    payload = refData.variables[data.variableName] || [];

    if (!Array.isArray(payload)) {
      payload = [payload];

      if (data.type === 'csv' && typeof payload[0] !== 'object')
        payload = [payload];
    }
// ...
```

---

