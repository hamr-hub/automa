# BackgroundUtils.js

**Path**: `background/BackgroundUtils.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [openDashboard](#opendashboard) | method | ✅ | `url, updateTab?` |
| [sendMessageToDashboard](#sendmessagetodashboard) | method | ✅ | `type, data` |

## Detailed Description

### <a id="opendashboard"></a>openDashboard

- **Type**: `method`
- **Parameters**: `url, updateTab?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async openDashboard(url, updateTab = true) {
    const tabUrl = browser.runtime.getURL(
      `/newtab.html#${typeof url === 'string' ? url : ''}`
    );

    try {
      const [tab] = await browser.tabs.query({
        url: browser.runtime.getURL('/newtab.html'),
      });

      if (tab) {
        const tabOptions = { active: true };
        if (updateTab) tabOptions.url = tabUrl;

        await browser.tabs.update(tab.id, tabOptions);
// ...
```

---

### <a id="sendmessagetodashboard"></a>sendMessageToDashboard

- **Type**: `method`
- **Parameters**: `type, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async sendMessageToDashboard(type, data) {
    const [tab] = await browser.tabs.query({
      url: browser.runtime.getURL('/newtab.html'),
    });

    await waitTabLoaded({ tabId: tab.id });
    const result = await browser.tabs.sendMessage(tab.id, { type, data });

    return result;
  }
```

---

