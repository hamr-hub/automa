# handlerBrowserEvent.js

**Path**: `workflowEngine/blocksHandler/handlerBrowserEvent.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [handleEventListener](#handleeventlistener) | function | ❌ | `target, validate` |
| [eventListener](#eventlistener) | arrow_function | ❌ | `event` |
| [onTabLoaded](#ontabloaded) | function | ❌ | `{}, {}` |
| [checkActiveTabStatus](#checkactivetabstatus) | arrow_function | ❌ | `` |
| [checkTabsStatus](#checktabsstatus) | arrow_function | ❌ | `` |
| [validateCreatedTab](#validatecreatedtab) | arrow_function | ❌ | `{}, {}` |
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="handleeventlistener"></a>handleEventListener

- **Type**: `function`
- **Parameters**: `target, validate`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleEventListener(target, validate) {
  return (data, activeTab) => {
    return new Promise((resolve) => {
      let resolved = false;
      const eventListener = (event) => {
        if (resolved) return;
        if (validate && !validate(event, { data, activeTab })) return;

        target.removeListener(eventListener);
        resolve(event);
      };

      setTimeout(() => {
        resolved = true;
        target.removeListener(eventListener);
// ...
```

---

### <a id="eventlistener"></a>eventListener

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
        if (resolved) return;
        if (validate && !validate(event, { data, activeTab })) return;

        target.removeListener(eventListener);
        resolve(event);
      }
```

---

### <a id="ontabloaded"></a>onTabLoaded

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onTabLoaded({ tabLoadedUrl, activeTabLoaded, timeout }, { id }) {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const checkActiveTabStatus = () => {
      if (resolved) return;
      if (!id) {
        reject(new Error('no-tab'));
        return;
      }

      BrowserAPIService.tabs
        .get(id)
        .then((tab) => {
          if (tab.status === 'complete') {
// ...
```

---

### <a id="checkactivetabstatus"></a>checkActiveTabStatus

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      if (resolved) return;
      if (!id) {
        reject(new Error('no-tab'));
        return;
      }

      BrowserAPIService.tabs
        .get(id)
        .then((tab) => {
          if (tab.status === 'complete') {
            resolve();
            return;
          }

// ...
```

---

### <a id="checktabsstatus"></a>checkTabsStatus

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      BrowserAPIService.tabs
        .query({
          url,
          status: 'loading',
        })
        .then((tabs) => {
          if (resolved) return;
          if (tabs.length === 0) {
            resolve();
            return;
          }

          setTimeout(checkTabsStatus, 1000);
        })
// ...
```

---

### <a id="validatecreatedtab"></a>validateCreatedTab

- **Type**: `arrow_function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ url }, { data }) => {
  if (!isWhitespace(data.tabUrl)) {
    const regex = new RegExp(data.tabUrl, 'gi');

    if (!regex.test(url)) return false;
  }

  return true;
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }) {
  const currentEvent = events[data.eventName];

  if (!currentEvent) {
    throw new Error(`Can't find ${data.eventName} event`);
  }

  const result = await currentEvent(data, this.activeTab);

  if (data.eventName === 'tab:create' && data.setAsActiveTab) {
    this.activeTab.id = result.tabId;
    this.activeTab.url = result.url;
  }

  return {
// ...
```

---

