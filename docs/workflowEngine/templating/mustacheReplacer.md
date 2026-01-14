# mustacheReplacer.js

**Path**: `workflowEngine/templating/mustacheReplacer.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [extractStrFunction](#extractstrfunction) | function | ❌ | `str` |
| [keyParser](#keyparser) | function | ❌ | `key, data` |
| [replacer](#replacer) | function | ❌ | `str, {}` |
| [anonymous](#anonymous) | function | ❌ | `str, refData, options?` |
| [modifyPath](#modifypath) | object_property_method | ❌ | `path` |

## Detailed Description

### <a id="extractstrfunction"></a>extractStrFunction

- **Type**: `function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function extractStrFunction(str) {
  const extractedStr = /^\$\s*(\w+)\s*\((.*)\)/.exec(
    str.trim().replace(/\r?\n|\r/g, '')
  );

  if (!extractedStr) return null;
  const { 1: name, 2: funcParams } = extractedStr;
  const params = funcParams
    .split(/,(?=(?:[^'"\\"\\']*['"][^'"]*['"\\"\\'])*[^'"]*$)/)
    .map((param) => param.trim().replace(/^['"]|['"]$/g, '') || '');

  return {
    name,
    params,
  };
// ...
```

---

### <a id="keyparser"></a>keyParser

- **Type**: `function`
- **Parameters**: `key, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function keyParser(key, data) {
  let [dataKey, path] = key.split(/[@.](.+)/);

  dataKey = refKeys[dataKey] ?? dataKey;

  if (!path) return { dataKey, path: '' };

  if (dataKey !== 'table') {
    if (dataKey === 'loopData' && !path.endsWith('.$index')) {
      const pathArr = path.split('.');
      pathArr.splice(1, 0, 'data');

      path = pathArr.join('.');
    }

// ...
```

---

### <a id="replacer"></a>replacer

- **Type**: `function`
- **Parameters**: `str, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function replacer(
  str,
  {
    data,
    regex,
    tagLen,
    modifyPath,
    checkExistence = false,
    disableStringify = false,
  }
) {
  const replaceResult = {
    list: {},
    value: str,
  };
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `str, refData, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (str, refData, options = {}) {
  if (!str || typeof str !== 'string') return '';

  const data = { ...refData, functions: templatingFunctions };
  const replacedList = {};

  const replacedStr = replacer(`${str}`, {
    data,
    tagLen: 2,
    regex: /\{\{(.*?)\}\}/g,
    modifyPath: (path) => {
      const { value, list } = replacer(path, {
        data,
        tagLen: 1,
        regex: /\[(.*?)\]/g,
// ...
```

---

### <a id="modifypath"></a>modifyPath

- **Type**: `object_property_method`
- **Parameters**: `path`
- **Description**: *No description provided.*

**Implementation**:
```javascript
modifyPath: (path) => {
      const { value, list } = replacer(path, {
        data,
        tagLen: 1,
        regex: /\[(.*?)\]/g,
        ...options,
        checkExistence: false,
      });
      Object.assign(replacedList, list);

      return value;
    }
```

---

