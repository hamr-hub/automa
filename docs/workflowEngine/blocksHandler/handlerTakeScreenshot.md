# handlerTakeScreenshot.js

**Path**: `workflowEngine/blocksHandler/handlerTakeScreenshot.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [saveImage](#saveimage) | function | ✅ | `{}` |
| [takeScreenshot](#takescreenshot) | function | ✅ | `{}` |
| [saveScreenshot](#savescreenshot) | arrow_function | ✅ | `dataUrl` |
| [captureTab](#capturetab) | arrow_function | ✅ | `` |

## Detailed Description

### <a id="saveimage"></a>saveImage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveImage({ filename, uri, ext }) {
  const hasDownloadAccess = await BrowserAPIService.permissions.contains({
    permissions: ['downloads'],
  });
  const name = `${filename || 'Screenshot'}.${ext || 'png'}`;

  if (hasDownloadAccess) {
    await BrowserAPIService.downloads.download({
      url: uri,
      filename: name,
    });

    return;
  }

// ...
```

---

### <a id="takescreenshot"></a>takeScreenshot

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function takeScreenshot({ data, id, label }) {
  const saveToComputer =
    typeof data.saveToComputer === 'undefined' || data.saveToComputer;

  try {
    let screenshot = null;
    const options = {
      quality: data.quality,
      format: data.ext || 'png',
    };
    const saveScreenshot = async (dataUrl) => {
      if (data.saveToColumn) this.addDataToColumn(data.dataColumn, dataUrl);
      if (saveToComputer)
        await saveImage({
          filename: data.fileName,
// ...
```

---

### <a id="savescreenshot"></a>saveScreenshot

- **Type**: `arrow_function`
- **Parameters**: `dataUrl`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (dataUrl) => {
      if (data.saveToColumn) this.addDataToColumn(data.dataColumn, dataUrl);
      if (saveToComputer)
        await saveImage({
          filename: data.fileName,
          uri: dataUrl,
          ext: data.ext,
        });
      if (data.assignVariable)
        await this.setVariable(data.variableName, dataUrl);
    }
```

---

### <a id="capturetab"></a>captureTab

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
        let result = null;

        if (isChrome) {
          const currentTab = await BrowserAPIService.tabs.get(
            this.activeTab.id
          );
          result = await BrowserAPIService.tabs.captureVisibleTab(
            currentTab.windowId,
            options
          );
        } else {
          result = await BrowserAPIService.tabs.captureTab(
            this.activeTab.id,
            options
// ...
```

---

