# EditCookie.vue

**Path**: `components/newtab/workflow/edit/EditCookie.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [cookieOptionsAutocomplete](#cookieoptionsautocomplete) | function | ❌ | `context` |
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

### <a id="cookieoptionsautocomplete"></a>cookieOptionsAutocomplete

- **Type**: `function`
- **Parameters**: `context`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cookieOptionsAutocomplete(context) {
  const word = context.matchBefore(/\w*/);
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (
    nodeBefore.name !== 'PropertyName' ||
    (word.from === word.to && !context.explicit)
  )
    return null;

  let options = [];

  if (props.data.type === 'get') {
    if (props.data.getAll) {
      options = [
// ...
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

