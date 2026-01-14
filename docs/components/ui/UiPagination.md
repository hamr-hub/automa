# UiPagination.vue

**Path**: `components/ui/UiPagination.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [emitEvent](#emitevent) | function | ❌ | `page` |
| [updatePage](#updatepage) | function | ❌ | `page, element` |

## Detailed Description

### <a id="emitevent"></a>emitEvent

- **Type**: `function`
- **Parameters**: `page`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function emitEvent(page) {
  emit('update:modelValue', page);
  emit('paginate', page);
}
```

---

### <a id="updatepage"></a>updatePage

- **Type**: `function`
- **Parameters**: `page, element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updatePage(page, element) {
  let currentPage = page;

  if (currentPage > maxPage.value || currentPage < 1) {
    if (!element) return;

    currentPage = currentPage > maxPage.value ? maxPage.value : 1;
  }

  emitEvent(currentPage);
}
```

---

