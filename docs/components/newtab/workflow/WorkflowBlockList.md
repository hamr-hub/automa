# WorkflowBlockList.vue

**Path**: `components/newtab/workflow/WorkflowBlockList.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getBlockTitle](#getblocktitle) | function | ❌ | `{}` |
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
default: () => []
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="getblocktitle"></a>getBlockTitle

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockTitle({ description, id, name }) {
  const blockPath = `workflow.blocks.${id}`;
  if (!te(blockPath)) return blocksDetail[id].name;

  const descPath = `${blockPath}.${description ? 'description' : 'name'}`;
  let blockDescription = te(descPath) ? t(descPath) : name;

  if (description) {
    blockDescription = `[${t(`${blockPath}.name`)}]\n${blockDescription}`;
  }

  return blockDescription;
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

