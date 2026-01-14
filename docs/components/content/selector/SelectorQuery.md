# SelectorQuery.vue

**Path**: `components/content/selector/SelectorQuery.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [copySelector](#copyselector) | function | ❌ | `` |

## Detailed Description

### <a id="copyselector"></a>copySelector

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copySelector() {
  rootElement.shadowRoot.querySelector('input')?.select();

  navigator.clipboard.writeText(props.selector).catch((error) => {
    document.execCommand('copy');
    console.error(error);
  });
}
```

---

