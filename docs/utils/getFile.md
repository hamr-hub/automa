# getFile.js

**Path**: `utils/getFile.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [readFileAsBase64](#readfileasbase64) | function | ❌ | `blob` |
| [downloadFile](#downloadfile) | function | ✅ | `url, options` |
| [getLocalFile](#getlocalfile) | function | ❌ | `path, options` |
| [anonymous](#anonymous) | function | ❌ | `path, options?` |

## Detailed Description

### <a id="readfileasbase64"></a>readFileAsBase64

- **Type**: `function`
- **Parameters**: `blob`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function readFileAsBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}
```

---

### <a id="downloadfile"></a>downloadFile

- **Type**: `function`
- **Parameters**: `url, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function downloadFile(url, options) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);

  const type = options.responseType || 'blob';
  const result = await response[type]();

  if (options.returnValue) {
    return result;
  }

  if (URL.createObjectURL) {
    const objUrl = URL.createObjectURL(result);
    return { objUrl, path: url, type: result.type };
  }
// ...
```

---

### <a id="getlocalfile"></a>getLocalFile

- **Type**: `function`
- **Parameters**: `path, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getLocalFile(path, options) {
  return new Promise((resolve, reject) => {
    const isFile = /\.(.*)/.test(path);

    if (!isFile) {
      reject(new Error(`"${path}" is invalid file path.`));
      return;
    }

    const fileUrl = path?.startsWith('file://') ? path : `file://${path}`;

    /* eslint-disable-next-line */
    if ('XMLHttpRequest' in self) {
      const xhr = new XMLHttpRequest();
      xhr.responseType = options.responseType || 'blob';
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `path, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (path, options = {}) {
  if (path.startsWith('http')) return downloadFile(path, options);

  return getLocalFile(path, options);
}
```

---

