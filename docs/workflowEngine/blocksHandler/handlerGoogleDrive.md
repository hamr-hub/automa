# handlerGoogleDrive.js

**Path**: `workflowEngine/blocksHandler/handlerGoogleDrive.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getFilename](#getfilename) | function | ❌ | `url` |
| [googleDrive](#googledrive) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="getfilename"></a>getFilename

- **Type**: `function`
- **Parameters**: `url`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getFilename(url) {
  try {
    const filename = new URL(url).pathname.split('/').pop();
    const hasExtension = /\.[0-9a-z]+$/i.test(filename);

    if (!hasExtension) return null;

    return filename;
  } catch (e) {
    return null;
  }
}
```

---

### <a id="googledrive"></a>googleDrive

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function googleDrive({ id, data }, { refData }) {
  const bucket = data.bucket || 'automa_files';
  const action = data.action || 'upload';

  const resultPromise = data.filePaths.map(async (item) => {
    let path = (await renderString(item.path, refData, this.engine.isPopup))
      .value;
    const name =
      (await renderString(item.name || '', refData, this.engine.isPopup))
        .value;

    if (action === 'upload') {
      if (item.type === 'downloadId') {
        const [downloadItem] = await BrowserAPIService.downloads.search({
          id: +path,
// ...
```

---

