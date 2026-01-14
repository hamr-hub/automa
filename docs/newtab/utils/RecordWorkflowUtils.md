# RecordWorkflowUtils.js

**Path**: `newtab/utils/RecordWorkflowUtils.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [validateUrl](#validateurl) | arrow_function | ❌ | `str` |
| [updateRecording](#updaterecording) | method | ✅ | `callback` |
| [onTabCreated](#ontabcreated) | method | ❌ | `tab` |
| [onTabsActivated](#ontabsactivated) | method | ✅ | `{}` |
| [onWebNavigationCommited](#onwebnavigationcommited) | method | ❌ | `{}` |
| [onWebNavigationCompleted](#onwebnavigationcompleted) | method | ✅ | `{}` |

## Detailed Description

### <a id="validateurl"></a>validateUrl

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) => str?.startsWith('http')
```

---

### <a id="updaterecording"></a>updateRecording

- **Type**: `method`
- **Parameters**: `callback`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async updateRecording(callback) {
    const { isRecording, recording } = await browser.storage.local.get([
      'isRecording',
      'recording',
    ]);

    if (!isRecording || !recording) return;

    callback(recording);

    await browser.storage.local.set({ recording });
  }
```

---

### <a id="ontabcreated"></a>onTabCreated

- **Type**: `method`
- **Parameters**: `tab`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onTabCreated(tab) {
    this.updateRecording((recording) => {
      const url = tab.url || tab.pendingUrl;
      const lastFlow = recording.flows[recording.flows.length - 1];
      const invalidPrevFlow =
        lastFlow &&
        lastFlow.id === 'new-tab' &&
        !validateUrl(lastFlow.data.url);

      if (!invalidPrevFlow) {
        const validUrl = validateUrl(url) ? url : '';

        recording.flows.push({
          id: 'new-tab',
          data: {
// ...
```

---

### <a id="ontabsactivated"></a>onTabsActivated

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async onTabsActivated({ tabId }) {
    const { url, id, title } = await browser.tabs.get(tabId);

    if (!validateUrl(url)) return;

    this.updateRecording((recording) => {
      recording.activeTab = { id, url };
      recording.flows.push({
        id: 'switch-tab',
        description: title,
        data: {
          url,
          matchPattern: url,
          createIfNoMatch: true,
        },
// ...
```

---

### <a id="onwebnavigationcommited"></a>onWebNavigationCommited

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onWebNavigationCommited({ frameId, tabId, url, transitionType }) {
    const allowedType = ['link', 'typed'];
    if (frameId !== 0 || !allowedType.includes(transitionType)) return;

    this.updateRecording((recording) => {
      if (recording.activeTab.id && tabId !== recording.activeTab.id) return;

      const lastFlow = recording.flows.at(-1) ?? {};
      const isInvalidNewtabFlow =
        lastFlow &&
        lastFlow.id === 'new-tab' &&
        !validateUrl(lastFlow.data.url);

      if (isInvalidNewtabFlow) {
        lastFlow.data.url = url;
// ...
```

---

### <a id="onwebnavigationcompleted"></a>onWebNavigationCompleted

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async onWebNavigationCompleted({ tabId, url, frameId }) {
    if (frameId > 0 || !url.startsWith('http')) return;

    try {
      const { isRecording } = await browser.storage.local.get('isRecording');
      if (!isRecording) return;

      if (isMV2) {
        await browser.tabs.executeScript(tabId, {
          allFrames: true,
          runAt: 'document_start',
          file: './recordWorkflow.bundle.js',
        });
      } else {
        await browser.scripting.executeScript({
// ...
```

---

