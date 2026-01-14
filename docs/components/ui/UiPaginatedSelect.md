# UiPaginatedSelect.vue

**Path**: `components/ui/UiPaginatedSelect.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [debounce](#debounce) | function | ❌ | `func, wait` |
| [later](#later) | arrow_function | ❌ | `` |
| [fetchOptions](#fetchoptions) | arrow_function | ✅ | `isNewSearch` |
| [toggleDropdown](#toggledropdown) | arrow_function | ❌ | `` |
| [closeDropdown](#closedropdown) | arrow_function | ❌ | `` |
| [selectOption](#selectoption) | arrow_function | ❌ | `option` |
| [handleScroll](#handlescroll) | arrow_function | ❌ | `event` |
| [handleClickOutside](#handleclickoutside) | arrow_function | ❌ | `event` |

## Detailed Description

### <a id="debounce"></a>debounce

- **Type**: `function`
- **Parameters**: `func, wait`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

---

### <a id="later"></a>later

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      clearTimeout(timeout);
      func(...args);
    }
```

---

### <a id="fetchoptions"></a>fetchOptions

- **Type**: `arrow_function`
- **Parameters**: `isNewSearch`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (isNewSearch) => {
  // Prevent concurrent scroll requests, but allow new searches to override.
  if (isLoading.value && !isNewSearch) return;

  isLoading.value = true;
  if (isNewSearch) {
    page.value = 1;
    options.value = [];
    haveMore.value = true;
    // Each new search gets a unique token.
    // This invalidates ongoing requests from previous searches.
    fetchRequestToken.value += 1;
  }

  const currentRequestToken = fetchRequestToken.value;
// ...
```

---

### <a id="toggledropdown"></a>toggleDropdown

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
}
```

---

### <a id="closedropdown"></a>closeDropdown

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  isOpen.value = false;
}
```

---

### <a id="selectoption"></a>selectOption

- **Type**: `arrow_function`
- **Parameters**: `option`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(option) => {
  const value = option[props.optionValueKey];
  const label = option[props.optionLabelKey];
  localInitialLabel.value = label;
  emit('update:modelValue', value);
  emit('change', value, label);
  closeDropdown();
}
```

---

### <a id="handlescroll"></a>handleScroll

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
  const el = event.target;
  const threshold = 50;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
    fetchOptions(false);
  }
}
```

---

### <a id="handleclickoutside"></a>handleClickOutside

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
  if (root.value && !root.value.contains(event.target)) {
    closeDropdown();
  }
}
```

---

