# SharedElSelectorActions.vue

**Path**: `components/newtab/shared/SharedElSelectorActions.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [selectElement](#selectelement) | function | ❌ | `` |
| [verifySelector](#verifyselector) | function | ❌ | `` |

## Detailed Description

### <a id="selectelement"></a>selectElement

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectElement() {
  elementSelector.selectElement().then((selector) => {
    emit('update:selector', selector);
  });
}
```

---

### <a id="verifyselector"></a>verifySelector

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function verifySelector() {
  elementSelector
    .verifySelector({
      selector: props.selector,
      multiple: props.multiple,
      findBy: props.findBy,
    })
    .then((result) => {
      if (!result.notFound) return;

      toast.error('Element not found');
    });
}
```

---

