# SelectorElementsDetail.vue

**Path**: `components/content/selector/SelectorElementsDetail.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [copySelector](#copyselector) | function | ❌ | `name, value` |

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

### <a id="copyselector"></a>copySelector

- **Type**: `function`
- **Parameters**: `name, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copySelector(name, value) {
  rootElement.shadowRoot
    .querySelector(`[data-testid="${name}"] input`)
    ?.select();
  const type = rootElement.shadowRoot.querySelector(`select#select--1`)?.value;
  navigator.clipboard
    .writeText(
      type === 'css'
        ? `${props.selectedElements[0].tagName.toLowerCase()}[${name}="${value}"]`
        : `//${props.selectedElements[0].tagName.toLowerCase()}[@${name}='${value}']`
    )
    .catch((error) => {
      document.execCommand('copy');
      console.error(error);
    });
// ...
```

---

