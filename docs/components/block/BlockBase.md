# BlockBase.vue

**Path**: `components/block/BlockBase.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [insertToClipboard](#inserttoclipboard) | function | ❌ | `` |
| [handleStartDrag](#handlestartdrag) | function | ❌ | `event` |
| [runWorkflow](#runworkflow) | function | ❌ | `` |

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

### <a id="inserttoclipboard"></a>insertToClipboard

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function insertToClipboard() {
  navigator.clipboard.writeText(props.blockId);

  isCopied.value = true;
  setTimeout(() => {
    isCopied.value = false;
  }, 1000);
}
```

---

### <a id="handlestartdrag"></a>handleStartDrag

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleStartDrag(event) {
  const payload = {
    data: props.data,
    fromBlockBasic: true,
    blockId: props.blockId,
    id: props.blockData.details.id,
  };

  event.dataTransfer.setData('block', JSON.stringify(payload));
}
```

---

### <a id="runworkflow"></a>runWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function runWorkflow() {
  if (!workflowUtils) return;

  workflowUtils.executeFromBlock(props.blockId);
}
```

---

