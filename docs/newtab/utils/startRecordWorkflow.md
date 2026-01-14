# startRecordWorkflow.js

**Path**: `newtab/utils/startRecordWorkflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `options?` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (options = {}) {
  try {
    const flows = [];
    const [activeTab] = await browser.tabs.query({
      active: true,
      url: '*://*/*',
    });

    if (activeTab && activeTab.url.startsWith('http')) {
      flows.push({
        id: 'new-tab',
        description: activeTab.url,
        data: { url: activeTab.url },
      });

// ...
```

---

