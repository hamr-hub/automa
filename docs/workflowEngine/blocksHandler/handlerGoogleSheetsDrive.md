# handlerGoogleSheetsDrive.js

**Path**: `workflowEngine/blocksHandler/handlerGoogleSheetsDrive.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `blockData, additionalData` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `blockData, additionalData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (blockData, additionalData) {
  blockData.data.isDriveSheet = true;
  return handlerGoogleSheets.call(this, blockData, additionalData);
}
```

---

