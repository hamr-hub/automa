# elementSelector.js

**Path**: `newtab/utils/elementSelector.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [makeDashboardFocus](#makedashboardfocus) | function | ✅ | `` |
| [initElementSelector](#initelementselector) | function | ✅ | `tab?` |
| [verifySelector](#verifyselector) | function | ✅ | `data` |
| [selectElement](#selectelement) | function | ✅ | `name` |
| [getSelector](#getselector) | arrow_function | ❌ | `` |

## Detailed Description

### <a id="makedashboardfocus"></a>makeDashboardFocus

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function makeDashboardFocus() {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  await browser.windows.update(currentTab.windowId, {
    focused: true,
  });
}
```

---

### <a id="initelementselector"></a>initElementSelector

- **Type**: `function`
- **Parameters**: `tab?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function initElementSelector(tab = null) {
  let activeTab = tab;

  if (!tab) {
    activeTab = await getActiveTab();
  }

  const result = await browser.tabs.sendMessage(activeTab.id, {
    type: 'automa-element-selector',
  });

  if (!result) {
    if (isMV2) {
      await browser.tabs.executeScript(activeTab.id, {
        allFrames: true,
// ...
```

---

### <a id="verifyselector"></a>verifySelector

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function verifySelector(data) {
  try {
    const activeTab = await getActiveTab();

    if (!data.findBy) {
      data.findBy = isXPath(data.selector) ? 'xpath' : 'cssSelector';
    }

    await browser.tabs.update(activeTab.id, { active: true });
    await browser.windows.update(activeTab.windowId, { focused: true });

    const result = await browser.tabs.sendMessage(
      activeTab.id,
      {
        data,
// ...
```

---

### <a id="selectelement"></a>selectElement

- **Type**: `function`
- **Parameters**: `name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function selectElement(name) {
  const tab = await getActiveTab();

  await initElementSelector(tab);

  const port = await browser.tabs.connect(tab.id, { name });
  const getSelector = () => {
    return new Promise((resolve, reject) => {
      port.onDisconnect.addListener(() => {
        reject(new Error('Port closed'));
      });
      port.onMessage.addListener(async (message) => {
        try {
          makeDashboardFocus();
        } catch (error) {
// ...
```

---

### <a id="getselector"></a>getSelector

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
    return new Promise((resolve, reject) => {
      port.onDisconnect.addListener(() => {
        reject(new Error('Port closed'));
      });
      port.onMessage.addListener(async (message) => {
        try {
          makeDashboardFocus();
        } catch (error) {
          console.error(error);
        } finally {
          resolve(message);
        }
      });
    });
// ...
```

---

