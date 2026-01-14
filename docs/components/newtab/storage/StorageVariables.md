# StorageVariables.vue

**Path**: `components/newtab/storage/StorageVariables.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [deleteVariable](#deletevariable) | function | ❌ | `{}` |
| [editVariable](#editvariable) | function | ❌ | `{}` |
| [saveVariable](#savevariable) | function | ❌ | `` |

## Detailed Description

### <a id="deletevariable"></a>deleteVariable

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteVariable({ id }) {
  dbStorage.variables.delete(id);
}
```

---

### <a id="editvariable"></a>editVariable

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function editVariable({ id, name, value }) {
  state.id = id;
  editState.name = name;
  editState.value =
    typeof value !== 'string' ? JSON.stringify(value, null, 2) : value;
  editState.type = 'edit';
  editState.show = true;
}
```

---

### <a id="savevariable"></a>saveVariable

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveVariable() {
  if (!editState.name) return;

  const trimmedName = editState.name.trim();
  const duplicateName = variables.value.some(
    ({ name, id }) => name.trim() === trimmedName && id !== state.id
  );

  if (duplicateName) {
    toast.error(`You alread add "${trimmedName}" variable`);
    return;
  }

  const varValue = parseJSON(editState.value, editState.value);

// ...
```

---

