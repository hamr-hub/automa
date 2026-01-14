# liveQuery.js

**Path**: `composable/liveQuery.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useLiveQuery](#uselivequery) | function | ❌ | `querier` |

## Detailed Description

### <a id="uselivequery"></a>useLiveQuery

- **Type**: `function`
- **Parameters**: `querier`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useLiveQuery(querier) {
  return useObservable(liveQuery(querier));
}
```

---

