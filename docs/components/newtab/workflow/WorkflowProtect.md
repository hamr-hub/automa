# WorkflowProtect.vue

**Path**: `components/newtab/workflow/WorkflowProtect.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [protectWorkflow](#protectworkflow) | function | ✅ | `` |

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

### <a id="protectworkflow"></a>protectWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function protectWorkflow() {
  const key = getPassKey(nanoid());
  const encryptedPass = AES.encrypt(state.password, key).toString();
  const hmac = hmacSHA256(encryptedPass, state.password).toString();

  const { drawflow } = props.workflow;
  const flow =
    typeof drawflow === 'string' ? drawflow : JSON.stringify(drawflow);

  emit('update', {
    isProtected: true,
    pass: hmac + encryptedPass,
    drawflow: AES.encrypt(flow, state.password).toString(),
  });
  emit('close');
// ...
```

---

