# decryptFlow.js

**Path**: `utils/decryptFlow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getWorkflowPass](#getworkflowpass) | function | ❌ | `pass` |
| [anonymous](#anonymous) | function | ❌ | `{}, password` |

## Detailed Description

### <a id="getworkflowpass"></a>getWorkflowPass

- **Type**: `function`
- **Parameters**: `pass`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getWorkflowPass(pass) {
  const key = getPassKey(nanoid());
  const decryptedPass = AES.decrypt(pass.substring(64), key).toString(encUtf8);

  return decryptedPass;
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}, password`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ({ pass, drawflow }, password) {
  const hmac = pass.substring(0, 64);
  const decryptedHmac = hmacSHA256(pass.substring(64), password).toString();

  if (hmac !== decryptedHmac)
    return {
      isError: true,
      message: 'incorrect-password',
    };

  const isDecrypted = parseJSON(drawflow, null);
  if (isDecrypted) return isDecrypted;

  return AES.decrypt(drawflow, password).toString(encUtf8);
}
```

---

