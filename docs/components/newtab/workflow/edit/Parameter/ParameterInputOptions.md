# ParameterInputOptions.vue

**Path**: `components/newtab/workflow/edit/Parameter/ParameterInputOptions.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [addMask](#addmask) | function | ❌ | `` |
| [addToken](#addtoken) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="addmask"></a>addMask

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addMask() {
  options.masks.push({
    isRegex: false,
    mask: '',
    lazy: false,
  });
}
```

---

### <a id="addtoken"></a>addToken

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addToken() {
  options.customTokens.push({
    symbol: '',
    regex: '',
  });
}
```

---

