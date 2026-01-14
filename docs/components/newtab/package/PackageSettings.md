# PackageSettings.vue

**Path**: `components/newtab/package/PackageSettings.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [deleteBlockIo](#deleteblockio) | function | ❌ | `type, index` |
| [getNodeName](#getnodename) | function | ❌ | `{}` |
| [getBlockIOName](#getblockioname) | function | ❌ | `type, data` |

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

### <a id="deleteblockio"></a>deleteBlockIo

- **Type**: `function`
- **Parameters**: `type, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteBlockIo(type, index) {
  packageState[type].splice(index, 1);
}
```

---

### <a id="getnodename"></a>getNodeName

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getNodeName({ label, data }) {
  let name = blocks[label]?.name || '';

  if (data.name) name += ` (${data.name})`;
  else if (data.description) name += ` (${data.description})`;

  return name;
}
```

---

### <a id="getblockioname"></a>getBlockIOName

- **Type**: `function`
- **Parameters**: `type, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockIOName(type, data) {
  if (!props.editor) return '';

  const cacheId = `${data.blockId}-${data.handleId}`;
  if (cacheIOName.has(cacheId)) return cacheIOName.get(cacheId);

  let name = '';

  const node = props.editor.getNode.value(data.blockId);
  if (!node) {
    name = 'Block not found';
  } else {
    const nodeName = getNodeName(node);
    const handleType = type === 'outputs' ? 'source' : 'target';
    const index = node.handleBounds[handleType].findIndex(
// ...
```

---

