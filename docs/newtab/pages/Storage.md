# Storage.vue

**Path**: `newtab/pages/Storage.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [onTabChange](#ontabchange) | function | ❌ | `value` |

## Detailed Description

### <a id="ontabchange"></a>onTabChange

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onTabChange(value) {
  router.replace({ query: { tab: value } });
}
```

---

