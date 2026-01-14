# UiAutocomplete.vue

**Path**: `components/ui/UiAutocomplete.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getItem](#getitem) | arrow_function | ❌ | `item, key` |
| [defaultFilter](#defaultfilter) | arrow_function | ❌ | `{}` |
| [getLastKeyBeforeCaret](#getlastkeybeforecaret) | function | ❌ | `caretIndex` |
| [getPosition](#getposition) | arrow_function | ❌ | `val, index` |
| [getSearchText](#getsearchtext) | function | ❌ | `caretIndex, charIndex` |
| [showPopover](#showpopover) | function | ❌ | `` |
| [checkInView](#checkinview) | function | ❌ | `container, element, partial?` |
| [updateValue](#updatevalue) | function | ❌ | `value` |
| [selectItem](#selectitem) | function | ❌ | `itemIndex, selected` |
| [handleKeydown](#handlekeydown) | function | ❌ | `event` |
| [handleBlur](#handleblur) | function | ❌ | `` |
| [handleFocus](#handlefocus) | function | ❌ | `` |
| [handleInput](#handleinput) | function | ❌ | `` |
| [attachEvents](#attachevents) | function | ❌ | `` |
| [detachEvents](#detachevents) | function | ❌ | `` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="getitem"></a>getItem

- **Type**: `arrow_function`
- **Parameters**: `item, key`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(item, key) =>
  item[key ? props.itemKey : props.itemLabel] || item
```

---

### <a id="defaultfilter"></a>defaultFilter

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ item, text }) => {
    return getItem(item)?.toLocaleLowerCase().includes(text);
  }
```

---

### <a id="getlastkeybeforecaret"></a>getLastKeyBeforeCaret

- **Type**: `function`
- **Parameters**: `caretIndex`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getLastKeyBeforeCaret(caretIndex) {
  const getPosition = (val, index) => ({
    index,
    charIndex: input.value.lastIndexOf(val, caretIndex - 1),
  });
  const [charData] = props.triggerChar
    .map(getPosition)
    .sort((a, b) => b.charIndex - a.charIndex);

  if (charData.index > 0) return -1;

  return charData.charIndex;
}
```

---

### <a id="getposition"></a>getPosition

- **Type**: `arrow_function`
- **Parameters**: `val, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(val, index) => ({
    index,
    charIndex: input.value.lastIndexOf(val, caretIndex - 1),
  })
```

---

### <a id="getsearchtext"></a>getSearchText

- **Type**: `function`
- **Parameters**: `caretIndex, charIndex`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getSearchText(caretIndex, charIndex) {
  if (charIndex !== -1) {
    const closeTrigger = (props.triggerChar ?? [])[1];
    const searchRgxp = new RegExp(
      `\\s${closeTrigger ? `|${closeTrigger}` : ''}`
    );

    const inputValue = input.value;
    const afterCaretTxt = inputValue.substring(caretIndex);
    const lastClosingIdx = afterCaretTxt.search(searchRgxp);

    const charsLength = props.triggerChar.length;
    const text =
      input.value.substring(charIndex + charsLength, caretIndex) +
      afterCaretTxt.substring(0, lastClosingIdx);
// ...
```

---

### <a id="showpopover"></a>showPopover

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function showPopover() {
  if (props.disabled) return;

  if (props.triggerChar.length < 1) {
    state.showPopover = true;
    return;
  }

  const { selectionStart } = input;

  if (selectionStart >= 0) {
    const charIndex = getLastKeyBeforeCaret(selectionStart);
    const text = getSearchText(selectionStart, charIndex);

    emit('search', text);
// ...
```

---

### <a id="checkinview"></a>checkInView

- **Type**: `function`
- **Parameters**: `container, element, partial?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function checkInView(container, element, partial = false) {
  const cTop = container.scrollTop;
  const cBottom = cTop + container.clientHeight;

  const eTop = element.offsetTop;
  const eBottom = eTop + element.clientHeight;

  const isTotal = eTop >= cTop && eBottom <= cBottom;
  const isPartial =
    partial &&
    ((eTop < cTop && eBottom > cTop) || (eBottom > cBottom && eTop < cBottom));

  return isTotal || isPartial;
}
```

---

### <a id="updatevalue"></a>updateValue

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateValue(value) {
  state.inputChanged = true;

  emit('change', value);
  emit('update:modelValue', value);

  input.value = value;
  input.dispatchEvent(new Event('input'));
}
```

---

### <a id="selectitem"></a>selectItem

- **Type**: `function`
- **Parameters**: `itemIndex, selected`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectItem(itemIndex, selected) {
  let selectedItem = filteredItems.value[itemIndex];
  if (!selectedItem) return;

  selectedItem = getItem(selectedItem);

  let caretPosition;
  const isTriggerChar = state.charIndex >= 0 && state.searchText;

  if (isTriggerChar) {
    const val = input.value;
    const index = state.charIndex;
    const charLength = props.triggerChar[0].length;
    const lastSearchIndex = state.searchText.length + index + charLength;

// ...
```

---

### <a id="handlekeydown"></a>handleKeydown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleKeydown(event) {
  if (!state.showPopover) {
    return;
  }

  const itemsLength = filteredItems.value.length - 1;

  if (event.key === 'ArrowUp') {
    if (state.activeIndex <= 0) state.activeIndex = itemsLength;
    else state.activeIndex -= 1;

    event.preventDefault();
  } else if (event.key === 'ArrowDown') {
    if (state.activeIndex >= itemsLength) state.activeIndex = 0;
    else state.activeIndex += 1;
// ...
```

---

### <a id="handleblur"></a>handleBlur

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleBlur() {
  state.showPopover = false;
}
```

---

### <a id="handlefocus"></a>handleFocus

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleFocus() {
  if (props.triggerChar.length < 1) return;

  showPopover();
}
```

---

### <a id="handleinput"></a>handleInput

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleInput() {
  state.inputChanged = true;
}
```

---

### <a id="attachevents"></a>attachEvents

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function attachEvents() {
  if (!input) return;

  input.addEventListener('blur', handleBlur);
  input.addEventListener('input', handleInput);
  input.addEventListener('focus', handleFocus);
  input.addEventListener('input', showPopover);
  input.addEventListener('keydown', handleKeydown);
}
```

---

### <a id="detachevents"></a>detachEvents

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function detachEvents() {
  if (!input) return;

  input.removeEventListener('blur', handleBlur);
  input.removeEventListener('input', handleInput);
  input.removeEventListener('focus', handleFocus);
  input.removeEventListener('input', showPopover);
  input.removeEventListener('keydown', handleKeydown);
}
```

---

