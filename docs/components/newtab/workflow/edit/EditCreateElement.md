# EditCreateElement.vue

**Path**: `components/newtab/workflow/edit/EditCreateElement.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [addPreloadScript](#addpreloadscript) | function | ❌ | `` |
| [updateSelector](#updateselector) | function | ❌ | `data` |

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

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
```

---

### <a id="addpreloadscript"></a>addPreloadScript

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addPreloadScript() {
  blockData.preloadScripts.push({
    src: '',
    type: 'script',
  });
}
```

---

### <a id="updateselector"></a>updateSelector

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSelector(data) {
  Object.assign(blockData, data);
}
```

---

