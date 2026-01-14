# BlockBasic.vue

**Path**: `components/block/BlockBasic.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [insertToClipboard](#inserttoclipboard) | function | ❌ | `text` |
| [getBlockName](#getblockname) | function | ❌ | `` |
| [getIconPath](#geticonpath) | function | ❌ | `path` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="inserttoclipboard"></a>insertToClipboard

- **Type**: `function`
- **Parameters**: `text`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function insertToClipboard(text) {
  navigator.clipboard.writeText(text);

  state.isCopied = true;
  setTimeout(() => {
    state.isCopied = false;
  }, 1000);
}
```

---

### <a id="getblockname"></a>getBlockName

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockName() {
  const key = `workflow.blocks.${block.details.id}.name`;

  return te(key) ? t(key) : block.details.name;
}
```

---

### <a id="geticonpath"></a>getIconPath

- **Type**: `function`
- **Parameters**: `path`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getIconPath(path) {
  if (path && path.startsWith('path')) {
    const { 1: iconPath } = path.split(':');
    return iconPath;
  }

  return '';
}
```

---

