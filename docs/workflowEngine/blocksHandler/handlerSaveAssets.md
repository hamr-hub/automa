# handlerSaveAssets.js

**Path**: `workflowEngine/blocksHandler/handlerSaveAssets.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getFilename](#getfilename) | function | ❌ | `url` |
| [anonymous](#anonymous) | function | ✅ | `{}` |
| [downloadFile](#downloadfile) | arrow_function | ❌ | `url` |

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

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id, label }) {
  const hasPermission = await BrowserAPIService.permissions.contains({
    permissions: ['downloads'],
  });

  if (!hasPermission) {
    const error = new Error('no-permission');
    error.data = { permission: 'downloads' };

    throw error;
  }

  let sources = [data.url];
  let index = 0;
  const downloadFile = (url) => {
// ...
```

---

### <a id="downloadfile"></a>downloadFile

- **Type**: `arrow_function`
- **Parameters**: `url`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(url) => {
    const options = { url, conflictAction: data.onConflict };
    let filename = decodeURIComponent(data.filename || getFilename(url));

    if (filename) {
      if (data.onConflict === 'overwrite' && index !== 0) {
        filename = `(${index}) ${filename}`;
      }

      options.filename = filename;
      index += 1;
    }

    return BrowserAPIService.downloads.download(options);
  }
```

---

