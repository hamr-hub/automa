# handlerInteractionBlock.js

**Path**: `workflowEngine/blocksHandler/handlerInteractionBlock.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [checkAccess](#checkaccess) | function | ✅ | `blockName` |
| [interactionHandler](#interactionhandler) | function | ✅ | `block` |
| [insertDataToColumn](#insertdatatocolumn) | arrow_function | ❌ | `value` |

## Detailed Description

### <a id="checkaccess"></a>checkAccess

- **Type**: `function`
- **Parameters**: `blockName`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkAccess(blockName) {
  if (blockName === 'upload-file') {
    const hasFileAccess =
      await BrowserAPIService.extension.isAllowedFileSchemeAccess();

    if (hasFileAccess) return true;

    throw new Error('no-file-access');
  } else if (blockName === 'clipboard') {
    const hasPermission = await BrowserAPIService.permissions.contains({
      permissions: ['clipboardRead'],
    });

    if (!hasPermission) {
      throw new Error('no-clipboard-acces');
// ...
```

---

### <a id="interactionhandler"></a>interactionHandler

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function interactionHandler(block) {
  await checkAccess(block.label);

  const debugMode =
    (block.data.settings?.debugMode ?? false) && !this.settings.debugMode;
  const isChrome = BROWSER_TYPE === 'chrome';

  try {
    if (debugMode && isChrome) {
      await attachDebugger(this.activeTab.id);
      block.debugMode = true;
    }

    const data = await this._sendMessageToTab(block, {
      frameId: this.activeTab.frameId || 0,
// ...
```

---

### <a id="insertdatatocolumn"></a>insertDataToColumn

- **Type**: `arrow_function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value) => {
        this.addDataToColumn(block.data.dataColumn, value);

        const addExtraRow =
          objectHasKey(block.data, 'extraRowDataColumn') &&
          block.data.addExtraRow;
        if (addExtraRow) {
          this.addDataToColumn(
            block.data.extraRowDataColumn,
            block.data.extraRowValue
          );
        }
      }
```

---

