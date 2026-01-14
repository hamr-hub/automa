# EditAutocomplete.vue

**Path**: `components/newtab/workflow/edit/EditAutocomplete.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [autocompleteFilter](#autocompletefilter) | function | ❌ | `{}` |
| [onSearch](#onsearch) | function | ❌ | `value` |

## Detailed Description

### <a id="autocompletefilter"></a>autocompleteFilter

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function autocompleteFilter({ text, item }) {
  if (!text) return true;

  const query = text.replace('@', '.').split('.').pop();
  return item.toLocaleLowerCase().includes(query);
}
```

---

### <a id="onsearch"></a>onSearch

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSearch(value) {
  const pathArr = (value ?? '').replace('@', '.').split('.');

  state.path = (pathArr.length > 1 ? pathArr.slice(0, -1) : pathArr).join('.');
  state.pathLen = pathArr.length;
}
```

---

