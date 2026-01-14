# findSelector.js

**Path**: `lib/findSelector.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `element, options?` |
| [tagName](#tagname) | object_property_method | ❌ | `` |
| [attr](#attr) | object_property_method | ❌ | `name, value` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `element, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (element, options = {}) {
  let selector = finder(element, {
    tagName: () => true,
    attr: (name, value) => name === 'id' || (ariaAttrs.includes(name) && value),
    ...options,
  });

  const tag = element.tagName.toLowerCase();
  if (!selector.startsWith(tag) && !selector.includes(' ')) {
    selector = `${tag}${selector}`;
  }

  return selector;
}
```

---

### <a id="tagname"></a>tagName

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
tagName: () => true
```

---

### <a id="attr"></a>attr

- **Type**: `object_property_method`
- **Parameters**: `name, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
attr: (name, value) => name === 'id' || (ariaAttrs.includes(name) && value)
```

---

