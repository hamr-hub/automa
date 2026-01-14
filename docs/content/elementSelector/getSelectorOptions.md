# getSelectorOptions.js

**Path**: `content/elementSelector/getSelectorOptions.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `{}` |
| [idName](#idname) | object_property_method | ❌ | `` |
| [tagName](#tagname) | object_property_method | ❌ | `` |
| [className](#classname) | object_property_method | ❌ | `` |
| [attr](#attr) | object_property_method | ❌ | `name` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ({ idName, tagName, className, attr, attrNames }) {
  const attrs = attr
    ? attrNames.split(',').map((item) => item.trim())
    : ['data-testid'];

  return {
    idName: () => idName ?? true,
    tagName: () => tagName ?? true,
    className: () => className ?? true,
    attr: (name) => attrs.includes(name),
  };
}
```

---

### <a id="idname"></a>idName

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
idName: () => idName ?? true
```

---

### <a id="tagname"></a>tagName

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
tagName: () => tagName ?? true
```

---

### <a id="classname"></a>className

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
className: () => className ?? true
```

---

### <a id="attr"></a>attr

- **Type**: `object_property_method`
- **Parameters**: `name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
attr: (name) => attrs.includes(name)
```

---

