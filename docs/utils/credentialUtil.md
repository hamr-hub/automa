# credentialUtil.js

**Path**: `utils/credentialUtil.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [encryptValue](#encryptvalue) | function | ❌ | `value` |
| [decryptValue](#decryptvalue) | function | ❌ | `value` |

## Detailed Description

### <a id="encryptvalue"></a>encryptValue

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function encryptValue(value) {
  const pass = getPassKey('credential');
  const encryptedValue = AES.encrypt(value, pass).toString();
  const hmac = HmacSHA256(encryptedValue, SHA256(pass)).toString();

  return hmac + encryptedValue;
}
```

---

### <a id="decryptvalue"></a>decryptValue

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function decryptValue(value) {
  const pass = getPassKey('credential');
  const hmac = value.substring(0, 64);
  const encryptedValue = value.substring(64);
  const decryptedHmac = HmacSHA256(encryptedValue, SHA256(pass)).toString();

  if (hmac !== decryptedHmac) return '';

  const decryptedValue = AES.decrypt(encryptedValue, pass).toString(encUtf8);

  return parseJSON(decryptedValue, decryptedValue);
}
```

---

