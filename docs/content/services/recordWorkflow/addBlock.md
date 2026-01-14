# addBlock.js

**Path**: `content/services/recordWorkflow/addBlock.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `detail, save?` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `detail, save?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (detail, save = true) {
  const { isRecording, recording } = await browser.storage.local.get([
    'isRecording',
    'recording',
  ]);

  if (!isRecording || !recording) return null;

  let addedBlock = detail;

  if (typeof detail === 'function') addedBlock = detail(recording);
  else recording.flows.push(detail);

  if (save) await browser.storage.local.set({ recording });

// ...
```

---

