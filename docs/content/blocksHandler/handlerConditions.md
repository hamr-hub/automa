# handlerConditions.js

**Path**: `content/blocksHandler/handlerConditions.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [handleConditionElement](#handleconditionelement) | function | ✅ | `{}` |
| [exists](#exists) | object_property_method | ❌ | `` |
| [notExists](#notexists) | object_property_method | ❌ | `` |
| [text](#text) | object_property_method | ❌ | `` |
| [visibleScreen](#visiblescreen) | object_property_method | ❌ | `` |
| [visible](#visible) | object_property_method | ❌ | `` |
| [invisible](#invisible) | object_property_method | ❌ | `` |
| [attribute](#attribute) | object_property_method | ❌ | `{}` |
| [handleConditionCode](#handleconditioncode) | function | ✅ | `{}` |
| [handleAutomaEvent](#handleautomaevent) | arrow_function | ❌ | `{}` |
| [anonymous](#anonymous) | function | ✅ | `data` |

## Detailed Description

### <a id="handleconditionelement"></a>handleConditionElement

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleConditionElement({ data, type, id, frameSelector }) {
  const selectorType = isXPath(data.selector) ? 'xpath' : 'cssSelector';

  const element = await handleSelector({
    id,
    data: {
      ...data,
      findBy: selectorType,
    },
    frameSelector,
    type: selectorType,
  });
  const { 1: actionType } = type.split('#');

  const elementActions = {
// ...
```

---

### <a id="exists"></a>exists

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
exists: () => Boolean(element)
```

---

### <a id="notexists"></a>notExists

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
notExists: () => !element
```

---

### <a id="text"></a>text

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
text: () => element?.innerText ?? null
```

---

### <a id="visiblescreen"></a>visibleScreen

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
visibleScreen: () => {
      if (!element) return false;

      return visibleInViewport(element);
    }
```

---

### <a id="visible"></a>visible

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
visible: () => {
      if (!element) return false;

      const { visibility, display } = getComputedStyle(element);

      return visibility !== 'hidden' && display !== 'none';
    }
```

---

### <a id="invisible"></a>invisible

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
invisible: () => {
      if (!element) return false;

      const { visibility, display } = getComputedStyle(element);
      const styleHidden = visibility === 'hidden' || display === 'none';

      return styleHidden || !visibleInViewport(element);
    }
```

---

### <a id="attribute"></a>attribute

- **Type**: `object_property_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
attribute: ({ attrName }) => {
      if (!element || !element.hasAttribute(attrName)) return null;

      return element.getAttribute(attrName);
    }
```

---

### <a id="handleconditioncode"></a>handleConditionCode

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleConditionCode({ data, refData }) {
  return new Promise((resolve, reject) => {
    const varName = `automa${nanoid()}`;

    const scriptEl = document.createElement('script');
    scriptEl.textContent = `
      (async () => {
        const ${varName} = ${JSON.stringify(refData)};
        ${automaRefDataStr(varName)}
        try {
          ${data.code}
        } catch (error) {
          return {
            $isError: true,
            message: error.message,
// ...
```

---

### <a id="handleautomaevent"></a>handleAutomaEvent

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ detail }) => {
      scriptEl.remove();
      window.removeEventListener(
        '__automa-condition-code__',
        handleAutomaEvent
      );

      if (detail.$isError) {
        reject(new Error(detail.message));
        return;
      }

      resolve(detail);
    }
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (data) {
  let result = null;

  if (data.type.startsWith('element')) {
    result = await handleConditionElement(data);
  } else if (data.type.startsWith('code')) {
    result = await handleConditionCode(data);
  }

  return result;
}
```

---

