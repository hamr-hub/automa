# EditDataMapping.vue

**Path**: `components/newtab/workflow/edit/EditDataMapping.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [isNameDuplicate](#isnameduplicate) | function | ❌ | `{}` |
| [updateSource](#updatesource) | function | ❌ | `{}` |
| [updateDestination](#updatedestination) | function | ❌ | `{}` |
| [addSource](#addsource) | function | ❌ | `` |
| [addDestination](#adddestination) | function | ❌ | `sourceIndex` |
| [updateData](#updatedata) | function | ❌ | `value` |

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

### <a id="isnameduplicate"></a>isNameDuplicate

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isNameDuplicate({ items, currItem, newName, event }) {
  const isDuplicate = items.some(
    (item) => currItem.id !== item.id && item.name === newName
  );

  if (isDuplicate || !newName) {
    event.target.value = currItem.name;
    return true;
  }

  return false;
}
```

---

### <a id="updatesource"></a>updateSource

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSource({ index, source, event }) {
  const newName = event.target.value.trim();
  const isDuplicate = isNameDuplicate({
    event,
    newName,
    currItem: source,
    items: state.sources,
  });

  if (isDuplicate) return;

  state.sources[index].name = newName;
}
```

---

### <a id="updatedestination"></a>updateDestination

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateDestination({ index, destIndex, destination, event }) {
  const newName = event.target.value.trim();
  const sourceDests = state.sources[index].destinations;
  const isDuplicate = isNameDuplicate({
    event,
    newName,
    items: sourceDests,
    currItem: destination,
  });

  if (isDuplicate) return;

  sourceDests[destIndex].name = newName;
}
```

---

### <a id="addsource"></a>addSource

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addSource() {
  const id = nanoid(4);

  state.sources.push({
    id,
    destinations: [],
    name: `source_${id}`,
  });
}
```

---

### <a id="adddestination"></a>addDestination

- **Type**: `function`
- **Parameters**: `sourceIndex`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addDestination(sourceIndex) {
  const id = nanoid(4);

  state.sources[sourceIndex].destinations.push({
    id,
    name: `dest_${id}`,
  });
}
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

