# SelectorBlocks.vue

**Path**: `components/content/selector/SelectorBlocks.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateParams](#updateparams) | function | ❌ | `data?` |
| [onSelectChanged](#onselectchanged) | function | ❌ | `value` |
| [executeBlock](#executeblock) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="updateparams"></a>updateParams

- **Type**: `function`
- **Parameters**: `data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateParams(data = {}) {
  state.params = data;
  emit('update');
}
```

---

### <a id="onselectchanged"></a>onSelectChanged

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSelectChanged(value) {
  state.params = tasks[value].data;
  state.blockResult = '';
  emit('update');
}
```

---

### <a id="executeblock"></a>executeBlock

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function executeBlock() {
  const params = {
    ...state.params,
    selector: props.selector,
    multiple: props.elements.length > 1,
  };

  emit('execute', true);

  blocks[state.selectedBlock].handler({ data: params }).then((result) => {
    state.blockResult = JSON.stringify(result, null, 2).trim();
    emit('update');
    emit('execute', false);
  });
}
```

---

