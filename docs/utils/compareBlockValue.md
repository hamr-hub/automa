# compareBlockValue.js

**Path**: `utils/compareBlockValue.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [[computed]](#-computed-) | object_property_method | ❌ | `a, b` |
| [anonymous](#anonymous) | function | ❌ | `type, valueA, valueB` |

## Detailed Description

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'==': (a, b) => a === b
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'!=': (a, b) => a !== b
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'>': (a, b) => a > b
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'>=': (a, b) => a >= b
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'<': (a, b) => a < b
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'<=': (a, b) => a <= b
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'()': (a, b) => a?.includes(b) ?? false
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `type, valueA, valueB`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (type, valueA, valueB) {
  const handler = handlers[type];

  if (handler) return handler(valueA, valueB);

  return false;
}
```

---

