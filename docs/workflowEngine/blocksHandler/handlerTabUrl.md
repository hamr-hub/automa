# handlerTabUrl.js

**Path**: `workflowEngine/blocksHandler/handlerTabUrl.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [logData](#logdata) | function | ✅ | `{}` |

## Detailed Description

### <a id="logdata"></a>logData

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function logData({ id, data }) {
  let urls = [];

  if (data.type === 'active-tab') {
    if (!this.activeTab.id) throw new Error('no-tab');

    const tab = await BrowserAPIService.tabs.get(this.activeTab.id);
    urls = tab.url || tab.pendingUrl || '';
  } else {
    const query = {};

    if (data.qMatchPatterns) {
      query.url = data.qMatchPatterns;
    }
    if (data.qTitle) {
// ...
```

---

