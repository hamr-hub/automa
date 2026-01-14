# handlerHandleDownload.js

**Path**: `workflowEngine/blocksHandler/handlerHandleDownload.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getDownloadFilesFromStorage](#getdownloadfilesfromstorage) | function | ✅ | `` |
| [saveDownloadFilesToStorage](#savedownloadfilestostorage) | function | ✅ | `filesData` |
| [removeDownloadFromStorage](#removedownloadfromstorage) | function | ✅ | `downloadId` |
| [registerDownloadListeners](#registerdownloadlisteners) | function | ✅ | `` |
| [handleDownload](#handledownload) | function | ✅ | `{}` |
| [onComplete](#oncomplete) | object_property_method | ❌ | `response` |
| [onComplete](#oncomplete) | object_property_method | ✅ | `response` |

## Detailed Description

### <a id="getdownloadfilesfromstorage"></a>getDownloadFilesFromStorage

- **Type**: `function`
- **Parameters**: ``
- **Description**:

@returns {Promise<Object>}

**Implementation**:
```javascript
async function getDownloadFilesFromStorage() {
  try {
    const result = await browser.storage.session.get(DOWNLOADS_STORAGE_KEY);
    return result[DOWNLOADS_STORAGE_KEY] || {};
  } catch (error) {
    console.error('Failed to get downloads from storage:', error);
    return {};
  }
}
```

---

### <a id="savedownloadfilestostorage"></a>saveDownloadFilesToStorage

- **Type**: `function`
- **Parameters**: `filesData`
- **Description**:

@param {Object} filesData

**Implementation**:
```javascript
async function saveDownloadFilesToStorage(filesData) {
  try {
    await browser.storage.session.set({
      [DOWNLOADS_STORAGE_KEY]: filesData,
    });
  } catch (error) {
    console.error('Failed to save downloads to storage:', error);
  }
}
```

---

### <a id="removedownloadfromstorage"></a>removeDownloadFromStorage

- **Type**: `function`
- **Parameters**: `downloadId`
- **Description**:

@param {number} downloadId

**Implementation**:
```javascript
async function removeDownloadFromStorage(downloadId) {
  try {
    const filesData = await getDownloadFilesFromStorage();
    delete filesData[downloadId];
    await saveDownloadFilesToStorage(filesData);
  } catch (error) {
    console.error('Failed to remove download from storage:', error);
  }
}
```

---

### <a id="registerdownloadlisteners"></a>registerDownloadListeners

- **Type**: `function`
- **Parameters**: ``
- **Description**:

env: background

**Implementation**:
```javascript
async function registerDownloadListeners() {
  try {
    const hasPermission = await BrowserAPIService.permissions.contains({
      permissions: ['downloads'],
    });

    if (!hasPermission) {
      const granted = await BrowserAPIService.permissions.request({
        permissions: ['downloads'],
      });
      if (!granted) {
        throw new Error('Download feature requires download permission');
      }
    }

// ...
```

---

### <a id="handledownload"></a>handleDownload

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleDownload({ data, id: blockId }) {
  const nextBlockId = this.getBlockConnections(blockId);

  try {
    const hasPermission = await BrowserAPIService.permissions.contains({
      permissions: ['downloads'],
    });
    if (!hasPermission) {
      const granted = await BrowserAPIService.permissions.request({
        permissions: ['downloads'],
      });
      if (!granted) {
        throw new Error('Download feature requires download permission');
      }
    }
// ...
```

---

### <a id="oncomplete"></a>onComplete

- **Type**: `object_property_method`
- **Parameters**: `response`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onComplete: (response) => {
                    completeResolve(response);
                  }
```

---

### <a id="oncomplete"></a>onComplete

- **Type**: `object_property_method`
- **Parameters**: `response`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onComplete: async (response) => {
                  try {
                    if (isResolved) return;

                    if (response.filename) {
                      currentFilename = response.filename;
                    }

                    if (processedData.saveData) {
                      this.addDataToColumn(
                        processedData.dataColumn,
                        currentFilename
                      );
                    }
                    if (processedData.assignVariable) {
// ...
```

---

