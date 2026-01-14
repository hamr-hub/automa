# dataMigration.js

**Path**: `utils/dataMigration.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function () {
  try {
    const { logs, logsCtxData, migration } = await browser.storage.local.get([
      'logs',
      'migration',
      'logsCtxData',
    ]);
    const hasMigrated = migration || {};
    const backupData = {};

    if (!hasMigrated.logs && logs) {
      const ids = new Set();

      const items = [];
      const ctxData = [];
// ...
```

---

