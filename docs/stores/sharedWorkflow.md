# sharedWorkflow.js

**Path**: `stores/sharedWorkflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [toArray](#toarray) | object_property_method | ❌ | `state` |
| [getById](#getbyid) | object_property_method | ❌ | `state` |
| [insert](#insert) | object_method | ❌ | `data` |
| [update](#update) | object_method | ❌ | `{}` |
| [delete](#delete) | object_method | ❌ | `id` |
| [fetchWorkflows](#fetchworkflows) | object_method | ✅ | `useCache?` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    workflows: {},
  })
```

---

### <a id="toarray"></a>toArray

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
toArray: (state) => Object.values(state.workflows)
```

---

### <a id="getbyid"></a>getById

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getById: (state) => (id) => {
      if (!state.workflows) return null;

      return state.workflows[id] || null;
    }
```

---

### <a id="insert"></a>insert

- **Type**: `object_method`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
insert(data) {
      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.workflows[item.id] = item;
        });
      } else {
        this.workflows[data.id] = data;
      }
    }
```

---

### <a id="update"></a>update

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
update({ id, data }) {
      if (!this.workflows[id]) return null;

      Object.assign(this.workflows[id], data);

      return this.workflows[id];
    }
```

---

### <a id="delete"></a>delete

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
delete(id) {
      delete this.workflows[id];
    }
```

---

### <a id="fetchworkflows"></a>fetchWorkflows

- **Type**: `object_method`
- **Parameters**: `useCache?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async fetchWorkflows(useCache = true) {
      const userStore = useUserStore();
      if (!userStore.user) return;

      const workflows = await cacheApi(
        'shared-workflows',
        async () => {
          try {
            const result = await apiAdapter.getSharedWorkflows();
            return result;
          } catch (error) {
            console.error(error);
            return {};
          }
        },
// ...
```

---

