# synchronizedLock.js

**Path**: `content/synchronizedLock.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `` |
| [getLock](#getlock) | method | ✅ | `timeout?` |
| [releaseLock](#releaselock) | method | ❌ | `` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor() {
    this.lock = false;
    this.queue = [];
  }
```

---

### <a id="getlock"></a>getLock

- **Type**: `method`
- **Parameters**: `timeout?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getLock(timeout = 10000) {
    while (this.lock) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
        setTimeout(() => {
          const index = this.queue.indexOf(resolve);
          if (index !== -1) {
            this.queue.splice(index, 1);
            console.warn('SynchronizedLock timeout');
            resolve();
          }
        }, timeout);
      });
    }

// ...
```

---

### <a id="releaselock"></a>releaseLock

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
releaseLock() {
    this.lock = false;
    const resolve = this.queue.shift();
    if (resolve) resolve();
  }
```

---

