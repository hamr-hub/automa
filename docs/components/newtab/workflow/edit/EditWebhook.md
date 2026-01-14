# EditWebhook.vue

**Path**: `components/newtab/workflow/edit/EditWebhook.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [removeHeader](#removeheader) | function | ❌ | `index` |
| [addHeader](#addheader) | function | ❌ | `` |
| [updateMethod](#updatemethod) | function | ❌ | `method` |

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

### <a id="removeheader"></a>removeHeader

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeHeader(index) {
  headers.value.splice(index, 1);
}
```

---

### <a id="addheader"></a>addHeader

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addHeader() {
  headers.value.push({ name: '', value: '' });
}
```

---

### <a id="updatemethod"></a>updateMethod

- **Type**: `function`
- **Parameters**: `method`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateMethod(method) {
  if (notHaveBody.includes(method) && activeTab.value === 'body') {
    activeTab.value = 'headers';
  }

  updateData({ method });
}
```

---

