# serialization.js

**Path**: `utils/serialization.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [serializeFunctions](#serializefunctions) | function | ❌ | `obj` |
| [deserializeFunctions](#deserializefunctions) | function | ❌ | `obj` |

## Detailed Description

### <a id="serializefunctions"></a>serializeFunctions

- **Type**: `function`
- **Parameters**: `obj`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function serializeFunctions(obj) {
  if (typeof obj === 'function') {
    return {
      __type: 'function',
      __value: obj.toString(),
    };
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeFunctions(item));
  }

  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
// ...
```

---

### <a id="deserializefunctions"></a>deserializeFunctions

- **Type**: `function`
- **Parameters**: `obj`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deserializeFunctions(obj) {
  if (obj && typeof obj === 'object') {
    if (obj.__type === 'function') {
      // eslint-disable-next-line no-new-func, prefer-template
      return new Function('return ' + obj.__value)();
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => deserializeFunctions(item));
    }

    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = deserializeFunctions(obj[key]);
// ...
```

---

