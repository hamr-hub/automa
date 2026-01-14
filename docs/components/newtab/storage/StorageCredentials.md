# StorageCredentials.vue

**Path**: `components/newtab/storage/StorageCredentials.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [deleteCredential](#deletecredential) | function | ❌ | `{}` |
| [saveCredential](#savecredential) | function | ❌ | `` |

## Detailed Description

### <a id="deletecredential"></a>deleteCredential

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteCredential({ id }) {
  dbStorage.credentials.delete(id);
}
```

---

### <a id="savecredential"></a>saveCredential

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveCredential() {
  if (!addState.name) return;

  const trimmedName = addState.name.trim();
  const duplicateName = credentials.value.some(
    ({ name, id }) => name.trim() === trimmedName && id !== state.id
  );

  if (duplicateName) {
    toast.error(`You alread add "${trimmedName}" credential`);
    return;
  }

  const encryptedValue = credentialUtil.encrypt(addState.value);

// ...
```

---

