# pinia.js

**Path**: `lib/pinia.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [saveToStoragePlugin](#savetostorageplugin) | function | ❌ | `{}` |

## Detailed Description

### <a id="savetostorageplugin"></a>saveToStoragePlugin

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveToStoragePlugin({ store, options }) {
  const newBrowser = markRaw(browser);

  store.saveToStorage = (key) => {
    const storageKey = options.storageMap[key];
    if (!storageKey || !store.retrieved) return null;

    const value = JSON.parse(JSON.stringify(store[key]));

    return newBrowser.storage.local.set({ [storageKey]: value });
  };
}
```

---

