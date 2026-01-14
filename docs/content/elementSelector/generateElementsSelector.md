# generateElementsSelector.js

**Path**: `content/elementSelector/generateElementsSelector.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `{}` |
| [idName](#idname) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ({
  list,
  target,
  selectorType,
  frameElement,
  hoveredElements,
  selectorSettings,
}) {
  let selector = '';

  const selectorOptions = selectorSettings || {};
  const [selectedElement] = hoveredElements;
  const finderOptions = { ...selectorOptions };
  let documentCtx = document;

// ...
```

---

### <a id="idname"></a>idName

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
idName: () => false
```

---

