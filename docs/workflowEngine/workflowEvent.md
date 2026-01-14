# workflowEvent.js

**Path**: `workflowEngine/workflowEvent.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [handle](#handle) | method | ✅ | `event, refData` |

## Detailed Description

### <a id="handle"></a>handle

- **Type**: `method`
- **Parameters**: `event, refData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async handle(event, refData) {
    switch (event.type) {
      case 'http-request':
        await this.#httpRequest(event, refData);
        break;
      case 'js-code':
        await this.#javascriptCode(event, refData);
        break;
      default:
    }
  }
```

---

