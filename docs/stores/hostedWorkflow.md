# hostedWorkflow.js

**Path**: `stores/hostedWorkflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [getById](#getbyid) | object_property_method | ❌ | `state` |
| [toArray](#toarray) | object_property_method | ❌ | `state` |
| [loadData](#loaddata) | object_method | ✅ | `` |
| [insert](#insert) | object_method | ✅ | `data, idKey?` |
| [delete](#delete) | object_method | ✅ | `id` |
| [update](#update) | object_method | ✅ | `{}` |
| [fetchWorkflows](#fetchworkflows) | object_method | ✅ | `ids` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    workflows: {},
    retrieved: false,
  })
```

---

### <a id="getbyid"></a>getById

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getById: (state) => (id) => state.workflows[id]
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

### <a id="loaddata"></a>loadData

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async loadData() {
      if (!browser?.storage?.local) return;

      const { workflowHosts } = await browser.storage.local.get(
        'workflowHosts'
      );
      this.workflows = workflowHosts || {};
      this.retrieved = true;
    }
```

---

### <a id="insert"></a>insert

- **Type**: `object_method`
- **Parameters**: `data, idKey?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async insert(data, idKey = 'hostId') {
      if (Array.isArray(data)) {
        data.forEach((item) => {
          this.workflows[idKey] = item;
        });
      } else {
        this.workflows[idKey] = data;
      }

      await this.saveToStorage('workflows');

      return data;
    }
```

---

### <a id="delete"></a>delete

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async delete(id) {
      delete this.workflows[id];

      await this.saveToStorage('workflows');
      await cleanWorkflowTriggers(id);

      return id;
    }
```

---

### <a id="update"></a>update

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async update({ id, data }) {
      if (!this.workflows[id]) return null;

      Object.assign(this.workflows[id], data);
      await this.saveToStorage('workflows');

      return this.workflows[id];
    }
```

---

### <a id="fetchworkflows"></a>fetchWorkflows

- **Type**: `object_method`
- **Parameters**: `ids`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async fetchWorkflows(ids) {
      if (!ids || ids.length === 0) return null;

      try {
        const result = await apiAdapter.getWorkflowsByIds(ids);

        const dataToReturn = [];

        result.forEach((data) => {
          // Supabase doesn't return 'status' field like the old API presumably did.
          // We assume if it's returned, it exists.
          // The old API logic handled 'deleted' and 'updated'.
          // With Supabase, we just get the current state.
          // If a workflow is missing from result but present in ids, it might be deleted.

// ...
```

---

