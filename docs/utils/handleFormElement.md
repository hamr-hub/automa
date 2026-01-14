# handleFormElement.js

**Path**: `utils/handleFormElement.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [reactJsEvent](#reactjsevent) | function | ❌ | `element, value` |
| [formEvent](#formevent) | function | ❌ | `element, data` |
| [inputText](#inputtext) | function | ✅ | `{}` |
| [anonymous](#anonymous) | function | ✅ | `element, data` |
| [getOptionValue](#getoptionvalue) | arrow_function | ❌ | `index` |

## Detailed Description

### <a id="reactjsevent"></a>reactJsEvent

- **Type**: `function`
- **Parameters**: `element, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function reactJsEvent(element, value) {
  if (!element._valueTracker) return;

  const previousValue = element.value;
  nativeInputValueSetter.call(element, value);
  element._valueTracker.setValue(previousValue);
}
```

---

### <a id="formevent"></a>formEvent

- **Type**: `function`
- **Parameters**: `element, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formEvent(element, data) {
  if (data.type === 'text-field') {
    const currentKey = /\s/.test(data.value) ? 'Space' : data.value;
    const { key, keyCode, code } = keyDefinitions[currentKey] || {
      key: currentKey,
      keyCode: 0,
      code: `Key${currentKey}`,
    };

    simulateEvent(element, 'input', {
      inputType: 'insertText',
      data: data.value,
      bubbles: true,
      cancelable: true,
    });
// ...
```

---

### <a id="inputtext"></a>inputText

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function inputText({ data, element, isEditable }) {
  element?.focus();
  element?.click();
  const elementKey = isEditable ? 'textContent' : 'value';

  if (data.delay > 0 && !document.hidden) {
    for (let index = 0; index < data.value.length; index += 1) {
      if (elementKey === 'value') reactJsEvent(element, element.value);

      const currentChar = data.value[index];
      element[elementKey] += currentChar;

      formEvent(element, {
        type: 'text-field',
        value: currentChar,
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `element, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (element, data) {
  const textFields = ['INPUT', 'TEXTAREA'];
  const isEditable =
    element.hasAttribute('contenteditable') && element.isContentEditable;

  if (isEditable) {
    if (data.clearValue) element.innerText = '';

    await inputText({ data, element, isEditable });
    return;
  }

  if (data.type === 'text-field' && textFields.includes(element.tagName)) {
    if (data.clearValue) {
      element?.select();
// ...
```

---

### <a id="getoptionvalue"></a>getOptionValue

- **Type**: `arrow_function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(index) => {
      if (!options) return element.value;

      let optionIndex = index;
      const maxIndex = options.length - 1;

      if (index < 0) optionIndex = 0;
      else if (index > maxIndex) optionIndex = maxIndex;

      return options[optionIndex]?.value || element.value;
    }
```

---

