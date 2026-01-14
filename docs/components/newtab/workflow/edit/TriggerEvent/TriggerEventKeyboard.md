# TriggerEventKeyboard.vue

**Path**: `components/newtab/workflow/edit/TriggerEvent/TriggerEventKeyboard.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [findKeyDefintion](#findkeydefintion) | function | ❌ | `value` |

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

### <a id="findkeydefintion"></a>findKeyDefintion

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findKeyDefintion(value) {
  const keyDefinition = keyDefinitions[value];

  if (!keyDefinition) return;

  defaultParams.code = keyDefinitions[value].code;
  defaultParams.keyCode = keyDefinitions[value].keyCode;
}
```

---

