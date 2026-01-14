# helper.js

**Path**: `utils/helper.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getActiveTab](#getactivetab) | function | ✅ | `` |
| [isXPath](#isxpath) | function | ❌ | `str` |
| [visibleInViewport](#visibleinviewport) | function | ❌ | `element` |
| [sleep](#sleep) | function | ❌ | `timeout?` |
| [findTriggerBlock](#findtriggerblock) | function | ❌ | `drawflow?` |
| [throttle](#throttle) | function | ❌ | `callback, limit` |
| [convertArrObjTo2DArr](#convertarrobjto2darr) | function | ❌ | `arr` |
| [convert2DArrayToArrayObj](#convert2darraytoarrayobj) | function | ❌ | `values` |
| [parseJSON](#parsejson) | function | ❌ | `data, def` |
| [parseFlow](#parseflow) | function | ❌ | `flow` |
| [replaceMustache](#replacemustache) | function | ❌ | `str, replacer` |
| [openFilePicker](#openfilepicker) | function | ❌ | `acceptedFileTypes?, attrs?` |
| [fileSaver](#filesaver) | function | ❌ | `filename, data` |
| [countDuration](#countduration) | function | ❌ | `started, ended` |
| [getText](#gettext) | arrow_function | ❌ | `num, suffix` |
| [toCamelCase](#tocamelcase) | function | ❌ | `str, capitalize?` |
| [isObject](#isobject) | function | ❌ | `obj` |
| [objectHasKey](#objecthaskey) | function | ❌ | `obj, key` |
| [isWhitespace](#iswhitespace) | function | ❌ | `str` |
| [debounce](#debounce) | function | ❌ | `callback, time?` |
| [clearCache](#clearcache) | function | ✅ | `workflow` |
| [arraySorter](#arraysorter) | function | ❌ | `{}` |

## Detailed Description

### <a id="getactivetab"></a>getActiveTab

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getActiveTab() {
  try {
    const tabsQuery = {
      active: true,
      url: '*://*/*',
    };

    const window = await browser.windows.getLastFocused({
      populate: true,
      windowTypes: ['normal'],
    });
    const windowId = window.id;

    if (windowId) tabsQuery.windowId = windowId;
    else tabsQuery.lastFocusedWindow = true;
// ...
```

---

### <a id="isxpath"></a>isXPath

- **Type**: `function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isXPath(str) {
  const regex = /^([(/@]|id\()/;

  return regex.test(str);
}
```

---

### <a id="visibleinviewport"></a>visibleInViewport

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function visibleInViewport(element) {
  const { top, left, bottom, right, height, width } =
    element.getBoundingClientRect();

  if (height === 0 || width === 0) return false;

  return (
    top >= 0 &&
    left >= 0 &&
    bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
```

---

### <a id="sleep"></a>sleep

- **Type**: `function`
- **Parameters**: `timeout?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function sleep(timeout = 500) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
```

---

### <a id="findtriggerblock"></a>findTriggerBlock

- **Type**: `function`
- **Parameters**: `drawflow?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findTriggerBlock(drawflow = {}) {
  if (!drawflow) return null;

  if (drawflow.drawflow) {
    const blocks = Object.values(drawflow.drawflow?.Home?.data ?? {});
    if (!blocks) return null;

    return blocks.find(({ name }) => name === 'trigger');
  }
  if (drawflow.nodes) {
    return drawflow.nodes.find((node) => node.label === 'trigger');
  }

  return null;
}
```

---

### <a id="throttle"></a>throttle

- **Type**: `function`
- **Parameters**: `callback, limit`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function throttle(callback, limit) {
  let waiting = false;

  return (...args) => {
    if (!waiting) {
      callback.apply(this, args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
}
```

---

### <a id="convertarrobjto2darr"></a>convertArrObjTo2DArr

- **Type**: `function`
- **Parameters**: `arr`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function convertArrObjTo2DArr(arr) {
  const keyIndex = new Map();
  const values = [[]];

  arr.forEach((obj) => {
    const keys = Object.keys(obj);
    const row = [];

    keys.forEach((key) => {
      if (!keyIndex.has(key)) {
        keyIndex.set(key, keyIndex.size);
        values[0].push(key);
      }

      const value = obj[key];
// ...
```

---

### <a id="convert2darraytoarrayobj"></a>convert2DArrayToArrayObj

- **Type**: `function`
- **Parameters**: `values`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function convert2DArrayToArrayObj(values) {
  let keyIndex = 0;
  const keys = values.shift();
  const result = [];

  for (let columnIndex = 0; columnIndex < values.length; columnIndex += 1) {
    const currentColumn = {};

    for (
      let rowIndex = 0;
      rowIndex < values[columnIndex].length;
      rowIndex += 1
    ) {
      let key = keys[rowIndex];

// ...
```

---

### <a id="parsejson"></a>parseJSON

- **Type**: `function`
- **Parameters**: `data, def`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function parseJSON(data, def) {
  try {
    const result = JSON.parse(data);

    return result;
  } catch (error) {
    return def;
  }
}
```

---

### <a id="parseflow"></a>parseFlow

- **Type**: `function`
- **Parameters**: `flow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function parseFlow(flow) {
  const obj = typeof flow === 'string' ? parseJSON(flow, {}) : flow;

  return obj;
}
```

---

### <a id="replacemustache"></a>replaceMustache

- **Type**: `function`
- **Parameters**: `str, replacer`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function replaceMustache(str, replacer) {
  /* eslint-disable-next-line */
  return str.replace(/\{\{(.*?)\}\}/g, replacer);
}
```

---

### <a id="openfilepicker"></a>openFilePicker

- **Type**: `function`
- **Parameters**: `acceptedFileTypes?, attrs?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openFilePicker(acceptedFileTypes = [], attrs = {}) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = Array.isArray(acceptedFileTypes)
      ? acceptedFileTypes.join(',')
      : acceptedFileTypes;

    Object.entries(attrs).forEach(([key, value]) => {
      input[key] = value;
    });

    input.onchange = (event) => {
      const { files } = event.target;
      const validFiles = [];
// ...
```

---

### <a id="filesaver"></a>fileSaver

- **Type**: `function`
- **Parameters**: `filename, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function fileSaver(filename, data) {
  const anchor = document.createElement('a');
  anchor.download = filename;
  anchor.href = data;

  anchor.dispatchEvent(new MouseEvent('click'));
  anchor.remove();
}
```

---

### <a id="countduration"></a>countDuration

- **Type**: `function`
- **Parameters**: `started, ended`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function countDuration(started, ended) {
  const duration = Math.round((ended - started) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  const getText = (num, suffix) => (num > 0 ? `${num}${suffix}` : '');

  return `${getText(minutes, 'm')} ${seconds}s`;
}
```

---

### <a id="gettext"></a>getText

- **Type**: `arrow_function`
- **Parameters**: `num, suffix`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(num, suffix) => (num > 0 ? `${num}${suffix}` : '')
```

---

### <a id="tocamelcase"></a>toCamelCase

- **Type**: `function`
- **Parameters**: `str, capitalize?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toCamelCase(str, capitalize = false) {
  const result = str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
    return index === 0 && !capitalize
      ? letter.toLowerCase()
      : letter.toUpperCase();
  });

  return result.replace(/\s+|[-]/g, '');
}
```

---

### <a id="isobject"></a>isObject

- **Type**: `function`
- **Parameters**: `obj`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
```

---

### <a id="objecthaskey"></a>objectHasKey

- **Type**: `function`
- **Parameters**: `obj, key`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function objectHasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
```

---

### <a id="iswhitespace"></a>isWhitespace

- **Type**: `function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isWhitespace(str) {
  return !/\S/.test(str);
}
```

---

### <a id="debounce"></a>debounce

- **Type**: `function`
- **Parameters**: `callback, time?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function debounce(callback, time = 200) {
  let interval;

  return (...args) => {
    clearTimeout(interval);

    return new Promise((resolve) => {
      interval = setTimeout(() => {
        interval = null;

        callback(...args);
        resolve();
      }, time);
    });
  };
// ...
```

---

### <a id="clearcache"></a>clearCache

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function clearCache(workflow) {
  try {
    await BrowserAPIService.storage.local.remove(`state:${workflow.id}`);

    const flows = parseJSON(workflow.drawflow, null);
    const blocks = flows && flows.drawflow.Home.data;

    if (blocks) {
      Object.values(blocks).forEach(({ name, id }) => {
        if (name !== 'loop-data') return;

        localStorage.removeItem(`index:${id}`);
      });
    }

// ...
```

---

### <a id="arraysorter"></a>arraySorter

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function arraySorter({ data, key, order = 'asc' }) {
  let runCounts = {};
  const copyData = data.slice();

  if (key === 'mostUsed') {
    runCounts = parseJSON(localStorage.getItem('runCounts'), {}) || {};
  }

  return copyData.sort((a, b) => {
    let comparison = 0;
    let itemA = a[key] || a;
    let itemB = b[key] || b;

    if (key === 'mostUsed') {
      itemA = runCounts[a.id] || 0;
// ...
```

---

