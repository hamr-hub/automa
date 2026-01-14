# handlerUploadFile.js

**Path**: `content/blocksHandler/handlerUploadFile.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [injectFiles](#injectfiles) | function | ❌ | `element, files` |
| [anonymous](#anonymous) | function | ✅ | `block` |
| [getFile](#getfile) | arrow_function | ✅ | `path` |

## Detailed Description

### <a id="injectfiles"></a>injectFiles

- **Type**: `function`
- **Parameters**: `element, files`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function injectFiles(element, files) {
  const notFileTypeAttr = element.getAttribute('type') !== 'file';

  if (element.tagName !== 'INPUT' || notFileTypeAttr) return;

  element.files = files;
  element.dispatchEvent(new Event('change', { bubbles: true }));
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (block) {
  const elements = await handleSelector(block, { returnElement: true });

  if (!elements) throw new Error('element-not-found');

  const getFile = async (path) => {
    let fileObject;
    if (
      path.includes('|') &&
      !path.startsWith('file') &&
      !path.startsWith('http')
    ) {
      const [filename, mime, base64] = path.split('|');
      const response = await fetch(base64);
      const arrayBuffer = await response.arrayBuffer();
// ...
```

---

### <a id="getfile"></a>getFile

- **Type**: `arrow_function`
- **Parameters**: `path`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (path) => {
    let fileObject;
    if (
      path.includes('|') &&
      !path.startsWith('file') &&
      !path.startsWith('http')
    ) {
      const [filename, mime, base64] = path.split('|');
      const response = await fetch(base64);
      const arrayBuffer = await response.arrayBuffer();

      fileObject = new File([arrayBuffer], filename, { type: mime });
    } else {
      const file = await sendMessage('get:file', path, 'background');
      const name = file?.path?.replace(/^.*[\\/]/, '') || '';
// ...
```

---

