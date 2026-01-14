# getBlockMessage.js

**Path**: `utils/getBlockMessage.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `{}` |
| [normalize](#normalize) | arrow_function | ❌ | `value` |
| [interpolate](#interpolate) | arrow_function | ❌ | `key` |
| [named](#named) | arrow_function | ❌ | `key` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ({ message, ...data }) {
  const normalize = (value) => value.join('');
  const interpolate = (key) => data[key];
  const named = (key) => key;

  const localeMessage = locale.log.messages[message];
  if (localeMessage) return localeMessage({ normalize, interpolate, named });

  return message;
}
```

---

### <a id="normalize"></a>normalize

- **Type**: `arrow_function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value) => value.join('')
```

---

### <a id="interpolate"></a>interpolate

- **Type**: `arrow_function`
- **Parameters**: `key`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(key) => data[key]
```

---

### <a id="named"></a>named

- **Type**: `arrow_function`
- **Parameters**: `key`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(key) => key
```

---

