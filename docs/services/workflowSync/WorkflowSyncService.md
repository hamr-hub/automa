# WorkflowSyncService.js

**Path**: `services/workflowSync/WorkflowSyncService.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [now](#now) | function | ❌ | `` |
| [readPending](#readpending) | function | ✅ | `` |
| [writePending](#writepending) | function | ✅ | `pending` |
| [readMeta](#readmeta) | function | ✅ | `` |
| [writeMeta](#writemeta) | function | ✅ | `meta` |
| [isSupabaseReady](#issupabaseready) | function | ✅ | `` |
| [markPending](#markpending) | method | ✅ | `type, id` |
| [getPendingCount](#getpendingcount) | method | ✅ | `` |
| [syncOnce](#synconce) | method | ✅ | `options?` |

## Detailed Description

### <a id="now"></a>now

- **Type**: `function`
- **Parameters**: ``
- **Description**:

@typedef {'upsert'|'delete'} PendingOpType

@typedef PendingOp

@property {PendingOpType} type

@property {string} id

@property {number} ts

**Implementation**:
```javascript
function now() {
  return Date.now();
}
```

---

### <a id="readpending"></a>readPending

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function readPending() {
  const { [STORAGE_KEYS.pending]: pending } = await browser.storage.local.get(
    STORAGE_KEYS.pending
  );
  if (!pending || typeof pending !== 'object') return {};
  return pending;
}
```

---

### <a id="writepending"></a>writePending

- **Type**: `function`
- **Parameters**: `pending`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function writePending(pending) {
  await browser.storage.local.set({ [STORAGE_KEYS.pending]: pending });
}
```

---

### <a id="readmeta"></a>readMeta

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function readMeta() {
  const { [STORAGE_KEYS.meta]: meta } = await browser.storage.local.get(
    STORAGE_KEYS.meta
  );
  return meta || { lastSyncAt: null, lastError: null };
}
```

---

### <a id="writemeta"></a>writeMeta

- **Type**: `function`
- **Parameters**: `meta`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function writeMeta(meta) {
  await browser.storage.local.set({ [STORAGE_KEYS.meta]: meta });
}
```

---

### <a id="issupabaseready"></a>isSupabaseReady

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function isSupabaseReady() {
  // 只要 client 初始化成功 + 已登录才认为 ready
  if (!supabaseClient?.client) return false;
  try {
    const user = await supabaseClient.getCurrentUser();
    return Boolean(user);
  } catch (_) {
    return false;
  }
}
```

---

### <a id="markpending"></a>markPending

- **Type**: `method`
- **Parameters**: `type, id`
- **Description**:

记录本地变更（离线队列）

@param {PendingOpType} type

@param {string} id

**Implementation**:
```javascript
static async markPending(type, id) {
    if (!id) return;

    const pending = await readPending();

    // 合并规则：
    // - delete 覆盖 upsert
    // - upsert 覆盖旧的 upsert
    pending[id] = { type, id, ts: now() };

    await writePending(pending);
  }
```

---

### <a id="getpendingcount"></a>getPendingCount

- **Type**: `method`
- **Parameters**: ``
- **Description**:

获取待同步数量

**Implementation**:
```javascript
static async getPendingCount() {
    const pending = await readPending();
    return Object.keys(pending).length;
  }
```

---

### <a id="synconce"></a>syncOnce

- **Type**: `method`
- **Parameters**: `options?`
- **Description**:

执行一次同步（local wins）

@param {{ force?: boolean }} options

**Implementation**:
```javascript
static async syncOnce(options = {}) {
    const { force = false } = options;

    const pending = await readPending();
    const ids = Object.keys(pending);
    if (ids.length === 0) return { synced: 0, skipped: 0 };

    // 尝试初始化 Supabase（不抛错，失败则返回）
    try {
      await apiAdapter.__ensureSupabase?.();
    } catch (_) {
      // ignore
    }

    const ready = await isSupabaseReady();
// ...
```

---

