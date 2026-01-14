# VTooltip.js

**Path**: `directives/VTooltip.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getContent](#getcontent) | function | ❌ | `content` |
| [mounted](#mounted) | object_method | ❌ | `el, {}` |
| [updated](#updated) | object_method | ❌ | `el, {}` |

## Detailed Description

### <a id="getcontent"></a>getContent

- **Type**: `function`
- **Parameters**: `content`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getContent(content) {
  if (typeof content === 'string') {
    return { content };
  }

  if (typeof content === 'object' && content !== null) {
    return content;
  }

  return {};
}
```

---

### <a id="mounted"></a>mounted

- **Type**: `object_method`
- **Parameters**: `el, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
mounted(el, { value, arg = 'top', instance, modifiers }) {
    const content = getContent(value);

    const tooltip = createTippy(el, {
      ...content,
      theme: 'tooltip-theme',
      placement: arg,
    });

    if (modifiers.group) {
      if (!Array.isArray(instance._tooltipGroup)) instance._tooltipGroup = [];

      instance._tooltipGroup.push(tooltip);
    }
  }
```

---

### <a id="updated"></a>updated

- **Type**: `object_method`
- **Parameters**: `el, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
updated(el, { value, arg = 'top' }) {
    const content = getContent(value);

    el._tippy.setProps({
      placement: arg,
      ...content,
    });
  }
```

---

